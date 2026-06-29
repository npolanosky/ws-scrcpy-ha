# Changelog

## 0.9.7

- Add a **Sleep** button to the controls bar (sends KEYCODE_SLEEP) to put an
  Android TV / Shield back to sleep without leaving the session open.
- Add **on-demand connect with an idle timeout** (`&idleTimeout=<seconds>` on the
  stream URL, default 60 in generated embed URLs). The stream no longer connects
  when the page/dashboard loads — it shows a "Tap to connect" overlay, connects on
  first interaction, and disconnects after the device receives no input for the
  timeout, so it stops holding the device awake (and a dashboard with the card
  open no longer wakes the TV). Set `idleTimeout=0` for an always-on embed.

## 0.9.6

- The "Capture keyboard" button now raises the on-screen keyboard on mobile and
  injects typed text (and Enter/Backspace) to the device. Physical keyboards on
  desktop are unaffected. Note: predictive/IME composition behavior varies by
  keyboard; basic typing works.

## 0.9.5

- Add a "Copy HA embed URL" button to the Configure Stream dialog that generates
  a ready-to-use Home Assistant embed deep-link from the current settings
  (player, bitrate, fps, size) — no more hand-editing URLs.

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
