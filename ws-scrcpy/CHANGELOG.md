# Changelog

## 0.9.1

- Deep-link URLs can now carry video settings directly, so an embedded URL is
  self-contained and no longer depends on per-browser localStorage:
  `bitrate`, `maxFps`, `maxWidth`, `maxHeight`, `iFrameInterval`, `fitToScreen`.
  Example: `…#!action=stream&udid=…&player=mse&bitrate=8000000&maxFps=60&maxWidth=1920&maxHeight=1920`.
- Makes embedding in a Home Assistant dashboard (Webpage card / iframe) reliable.

## 0.9.0

- Initial release of the ws-scrcpy Home Assistant add-on.
- Android device mirroring and control in the browser, served on port 8000.
- USB device passthrough (`usb: true`) and wireless-debugging auto-connect via
  the `adb_devices` option.
- Multi-arch prebuilt images (amd64, aarch64, armv7) published to GHCR.
- Options: `port`, `debug`, `adb_devices`.
