require("dotenv").config();

module.exports = {
  backendUrl: process.env.LIVEBRIDGE_BACKEND_URL || "http://localhost:3000",
  obsWsUrl: process.env.OBS_WS_URL || "ws://127.0.0.1:4455",
  obsWsPassword: process.env.OBS_WS_PASSWORD || "",
  pollIntervalMs: 1000
};