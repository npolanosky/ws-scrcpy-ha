import { ACTION } from '../common/Action';
import { ParamsStream } from './ParamsStream';
import VideoSettings from '../app/VideoSettings';

export interface ParamsStreamScrcpy extends ParamsStream {
    action: ACTION.STREAM_SCRCPY;
    ws: string;
    fitToScreen?: boolean;
    videoSettings?: VideoSettings;
    // Optional video-settings overrides parsed from the deep-link URL so an
    // embed URL can be fully self-contained (independent of localStorage).
    bitrate?: number;
    maxFps?: number;
    maxWidth?: number;
    maxHeight?: number;
    iFrameInterval?: number;
    // Layout mode for embedding (e.g. a Home Assistant iframe card): scale the
    // video to fill the available space instead of rendering at the encoding
    // resolution.
    embed?: boolean;
}
