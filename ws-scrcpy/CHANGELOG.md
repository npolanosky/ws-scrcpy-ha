# Changelog

## 0.9.4

- Embed mode now places the controls along the bottom (horizontal) instead of
  down the right side, so a 16:9 card matches the device with minimal
  letterboxing.

## 0.9.3

- Add an embed layout mode (`&embed=1` on the stream URL) that scales the video
  to fill an iframe/Webpage card and letterboxes to fit, instead of rendering at
  the (often tiny) encoding resolution. Scoped so the normal full-window view is
  unchanged; touch/click mapping stays accurate.

## 0.9.2

- Persist the adb client RSA key on the `/data` volume so it survives add-on
  updates, restarts and host reboots. Devices (e.g. Nvidia Shield) now only need
  to authorize "this computer" once instead of re-prompting after every update.

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
