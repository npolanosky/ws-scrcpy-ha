# ws-scrcpy

Web client for [scrcpy](https://github.com/Genymobile/scrcpy) — mirror and
control Android devices straight from your browser. This add-on packages
[ws-scrcpy](https://github.com/NetrisTV/ws-scrcpy) so it runs inside Home
Assistant.

## Installation

1. In Home Assistant go to **Settings → Add-ons → Add-on Store**.
2. Click the **⋮** menu (top right) → **Repositories** and add:
   `https://github.com/npolanosky/ws-scrcpy-ha`
3. Find **ws-scrcpy** in the store and click **Install**.
4. Start the add-on and open the **Web UI** (or browse to
   `http://<home-assistant-host>:8000`).

## Connecting devices

ws-scrcpy talks to your Android devices over `adb`. There are two ways to make
a device visible to the add-on.

### USB

Plug the device into the machine running Home Assistant. The add-on is granted
USB access (`usb: true`). On the device, enable **Developer options → USB
debugging** and accept the *"Allow USB debugging?"* prompt the first time.

### Wireless debugging (network adb)

For devices on the same network (or when USB passthrough is not available),
enable **Developer options → Wireless debugging** on the device and list its
`ip:port` under the `adb_devices` option. The add-on runs `adb connect` for
each entry on startup.

> Note: on Android 11+ the *pairing* step (a one-time 6-digit code) cannot be
> done from this UI. Pair once from a PC or an `adb pair` shell, then add the
> persistent `ip:5555` (or the wireless-debugging port) here.

## Options

| Option        | Default | Description                                                        |
| ------------- | ------- | ------------------------------------------------------------------ |
| `port`        | `8000`  | TCP port the web interface listens on.                             |
| `debug`       | `false` | Enable verbose server logging (`WS_SCRCPY_DEBUG`).                 |
| `adb_devices` | `[]`    | List of `ip:port` wireless-debugging targets to auto-connect.      |

Example:

```yaml
port: 8000
debug: false
adb_devices:
  - 192.168.1.50:5555
  - 192.168.1.51:5555
```

## Embedding in a Home Assistant dashboard

You can drop a live, controllable device straight onto a dashboard with a
**Webpage** card (or an `iframe` panel) pointing at a *deep-link* URL that opens
the stream directly — skipping the device list.

### Getting the deep-link

1. Open the add-on Web UI and find your device in the list.
2. Right-click the player link for it (e.g. **H264 Converter**) → **Copy link
   address**. That URL already contains `action=stream`, the device `udid`, the
   `player`, and the `ws` endpoint.

### Baking in the quality settings (no localStorage needed)

Append video-settings parameters to the URL so the embed always loads at the
right quality regardless of which browser/window opens it:

| Param | Meaning | Example |
| --- | --- | --- |
| `bitrate` | bits per second | `bitrate=8000000` (8 Mbps) |
| `maxFps` | max frame rate | `maxFps=60` |
| `maxWidth` / `maxHeight` | max size in px | `maxWidth=1920&maxHeight=1920` |
| `iFrameInterval` | keyframe interval (s) | `iFrameInterval=5` |
| `fitToScreen` | fill the iframe/viewport | `fitToScreen=1` |

Any param you omit falls back to the stored/preferred value. For an embed,
`fitToScreen=1` is usually what you want so the video fills the card.

Full example:

```
http://homeassistant.local:8000/#!action=stream&udid=192.168.0.175:5555&player=mse&bitrate=8000000&maxFps=60&maxWidth=1920&maxHeight=1920&fitToScreen=1&ws=<the-ws-value-from-the-copied-link>
```

Lovelace Webpage card:

```yaml
type: iframe
url: http://homeassistant.local:8000/#!action=stream&udid=192.168.0.175:5555&player=mse&bitrate=8000000&maxFps=60&fitToScreen=1&ws=...
aspect_ratio: 50%
```

> Tip: pick `player=mse` (H264 Converter) for desktop and the Android app;
> `player=broadway` is the universal software fallback (e.g. the iOS app). For
> wireless devices, give the phone a static IP and fixed port so the `udid`
> stays valid.

## Notes & limitations

- **iOS support is not included.** The add-on builds the Android-only variant of
  ws-scrcpy.
- **No authentication.** ws-scrcpy itself does not provide a login. Anyone who
  can reach the port can control connected devices — only expose it on trusted
  networks, and do not forward the port to the internet.
- **Ingress is not supported** because ws-scrcpy relies on a fixed WebSocket
  base path; the add-on is served on a real port instead.
