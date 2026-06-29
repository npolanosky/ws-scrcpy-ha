import '../style/app.css';
import { StreamClientScrcpy } from './googDevice/client/StreamClientScrcpy';
import { HostTracker } from './client/HostTracker';
import { Tool } from './client/Tool';

window.onload = async function (): Promise<void> {
    const hash = location.hash.replace(/^#!/, '');
    const parsedQuery = new URLSearchParams(hash);
    const action = parsedQuery.get('action');

    /// #if USE_BROADWAY
    const { BroadwayPlayer } = await import('./player/BroadwayPlayer');
    StreamClientScrcpy.registerPlayer(BroadwayPlayer);
    /// #endif

    /// #if USE_H264_CONVERTER
    const { MsePlayer } = await import('./player/MsePlayer');
    StreamClientScrcpy.registerPlayer(MsePlayer);
    /// #endif

    /// #if USE_TINY_H264
    const { TinyH264Player } = await import('./player/TinyH264Player');
    StreamClientScrcpy.registerPlayer(TinyH264Player);
    /// #endif

    /// #if USE_WEBCODECS
    const { WebCodecsPlayer } = await import('./player/WebCodecsPlayer');
    StreamClientScrcpy.registerPlayer(WebCodecsPlayer);
    /// #endif

    if (action === StreamClientScrcpy.ACTION && typeof parsedQuery.get('udid') === 'string') {
        const idleRaw = parsedQuery.get('idleTimeout');
        const idleSeconds = idleRaw ? parseInt(idleRaw, 10) : 0;
        if (!isNaN(idleSeconds) && idleSeconds > 0) {
            // On-demand mode: don't connect on page load (so just opening a
            // dashboard never wakes the device). Connect on first interaction,
            // and disconnect after `idleTimeout` seconds with no input so the
            // device can sleep again.
            startOnDemand(parsedQuery, idleSeconds * 1000);
        } else {
            StreamClientScrcpy.start(parsedQuery);
        }
        return;
    }

    /// #if INCLUDE_APPL
    {
        const { DeviceTracker } = await import('./applDevice/client/DeviceTracker');

        /// #if USE_QVH_SERVER
        const { StreamClientQVHack } = await import('./applDevice/client/StreamClientQVHack');

        DeviceTracker.registerTool(StreamClientQVHack);

        /// #if USE_WEBCODECS
        const { WebCodecsPlayer } = await import('./player/WebCodecsPlayer');
        StreamClientQVHack.registerPlayer(WebCodecsPlayer);
        /// #endif

        /// #if USE_H264_CONVERTER
        const { MsePlayerForQVHack } = await import('./player/MsePlayerForQVHack');
        StreamClientQVHack.registerPlayer(MsePlayerForQVHack);
        /// #endif

        if (action === StreamClientQVHack.ACTION && typeof parsedQuery.get('udid') === 'string') {
            StreamClientQVHack.start(StreamClientQVHack.parseParameters(parsedQuery));
            return;
        }
        /// #endif

        /// #if USE_WDA_MJPEG_SERVER
        const { StreamClientMJPEG } = await import('./applDevice/client/StreamClientMJPEG');
        DeviceTracker.registerTool(StreamClientMJPEG);

        const { MjpegPlayer } = await import('./player/MjpegPlayer');
        StreamClientMJPEG.registerPlayer(MjpegPlayer);

        if (action === StreamClientMJPEG.ACTION && typeof parsedQuery.get('udid') === 'string') {
            StreamClientMJPEG.start(StreamClientMJPEG.parseParameters(parsedQuery));
            return;
        }
        /// #endif
    }
    /// #endif

    const tools: Tool[] = [];

    /// #if INCLUDE_ADB_SHELL
    const { ShellClient } = await import('./googDevice/client/ShellClient');
    if (action === ShellClient.ACTION && typeof parsedQuery.get('udid') === 'string') {
        ShellClient.start(ShellClient.parseParameters(parsedQuery));
        return;
    }
    tools.push(ShellClient);
    /// #endif

    /// #if INCLUDE_DEV_TOOLS
    const { DevtoolsClient } = await import('./googDevice/client/DevtoolsClient');
    if (action === DevtoolsClient.ACTION) {
        DevtoolsClient.start(DevtoolsClient.parseParameters(parsedQuery));
        return;
    }
    tools.push(DevtoolsClient);
    /// #endif

    /// #if INCLUDE_FILE_LISTING
    const { FileListingClient } = await import('./googDevice/client/FileListingClient');
    if (action === FileListingClient.ACTION) {
        FileListingClient.start(FileListingClient.parseParameters(parsedQuery));
        return;
    }
    tools.push(FileListingClient);
    /// #endif

    if (tools.length) {
        const { DeviceTracker } = await import('./googDevice/client/DeviceTracker');
        tools.forEach((tool) => {
            DeviceTracker.registerTool(tool);
        });
    }
    HostTracker.start();
};

// Connect-on-interaction with an inactivity timeout. Shows a "tap to connect"
// overlay instead of streaming immediately; connects on the first tap/click/key,
// resets an idle timer on every user input, and tears the connection down (so the
// device-side scrcpy server exits and the device may sleep) once idle.
function startOnDemand(query: URLSearchParams, idleMs: number): void {
    const inputEvents: Array<keyof DocumentEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    let client: StreamClientScrcpy | undefined;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    document.body.className = query.get('embed') ? 'stream embed' : 'stream';

    const overlay = document.createElement('div');
    overlay.className = 'on-demand-overlay';
    const label = document.createElement('div');
    label.className = 'on-demand-overlay-label';
    label.innerText = 'Tap to connect';
    overlay.appendChild(label);

    const onInput = (): void => {
        if (!client) {
            return;
        }
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
        idleTimer = setTimeout(disconnect, idleMs);
    };

    function connect(): void {
        if (client) {
            return;
        }
        overlay.style.display = 'none';
        client = StreamClientScrcpy.start(query);
        inputEvents.forEach((type) => document.addEventListener(type, onInput, true));
        onInput();
    }

    function disconnect(): void {
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = undefined;
        }
        inputEvents.forEach((type) => document.removeEventListener(type, onInput, true));
        if (client) {
            client.stop();
            client = undefined;
        }
        overlay.style.display = '';
    }

    overlay.addEventListener('click', connect);
    overlay.addEventListener('touchstart', (event) => {
        event.preventDefault();
        connect();
    });
    document.body.appendChild(overlay);
}
