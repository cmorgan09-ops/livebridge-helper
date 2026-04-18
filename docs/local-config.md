# LiveBridge Helper Local Config

## Environment Variables

### LIVEBRIDGE_BACKEND_URL
The URL of the LiveBridge backend.

Example:
`http://localhost:3000`

### OBS_WS_URL
The OBS WebSocket URL.

Example:
`ws://127.0.0.1:4455`

or

`ws://192.168.1.215:4455`

### OBS_WS_PASSWORD
The OBS WebSocket password configured inside OBS.

### pollIntervalMs
Defined in `src/config.js`
Controls how often the helper checks backend and OBS state.

Default:
`5000`