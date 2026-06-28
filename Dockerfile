# syntax=docker/dockerfile:1
#
# ws-scrcpy Home Assistant add-on image.
#
# Two stages:
#   1. builder  - compiles the webpack bundle (dist/) and installs the runtime
#                 node_modules (including the native node-pty addon).
#   2. runtime  - a slim image with Node.js + adb that runs the built server.
#
# Both stages use the same Node major version so the native modules compiled in
# the builder are ABI-compatible with the runtime.

# ---- Builder ----------------------------------------------------------------
FROM node:20-alpine AS builder

# Build toolchain for native modules (node-pty) and git.
RUN apk add --no-cache python3 make g++ git linux-headers

WORKDIR /build

# Install dev + prod deps (webpack lives in devDependencies). Optional deps
# (appium / iOS support) are intentionally omitted: the default build config
# ships Android-only (INCLUDE_APPL=false), so they are dead weight here.
# NOTE: upstream's package-lock.json is not always in sync with package.json,
# so `npm install` is used here instead of `npm ci`. scripts/ is needed because
# the package.json postinstall runs scripts/setup-appium.js (a no-op here since
# the optional appium dep is omitted).
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm install --omit=optional --no-audit --no-fund

# Build the production bundle into ./dist.
COPY . .
RUN npm run dist:prod

# Install only the runtime dependencies for the generated server bundle.
WORKDIR /build/dist
RUN npm install --omit=dev --omit=optional --no-audit --no-fund

# ---- Runtime ----------------------------------------------------------------
FROM node:20-alpine

# adb (android-tools), jq for reading add-on options, tini as PID 1 so adb's
# child processes are reaped and signals are forwarded cleanly.
RUN apk add --no-cache android-tools jq tini

WORKDIR /app
COPY --from=builder /build/dist /app
COPY run.sh /run.sh
RUN chmod +x /run.sh

ENV NODE_ENV=production
EXPOSE 8000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/run.sh"]
