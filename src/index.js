require("dotenv").config();
const OBSWebSocket = require("obs-websocket-js").default;

const BASE_URL = process.env.LIVEBRIDGE_BACKEND_URL || "http://localhost:3000";
const OBS_WS_URL = process.env.OBS_WS_URL || "ws://127.0.0.1:4455";
const OBS_WS_PASSWORD = process.env.OBS_WS_PASSWORD || "";

const obs = new OBSWebSocket();
let lastSnapshot = null;
let obsConnected = false;

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${path} failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function connectToObs() {
  try {
    if (obsConnected) return true;

    await obs.connect(OBS_WS_URL, OBS_WS_PASSWORD);
    obsConnected = true;
    console.log(`Connected to OBS at ${OBS_WS_URL}`);
    return true;
  } catch (error) {
    obsConnected = false;
    return false;
  }
}

async function getObsStatus() {
  try {
    const connected = await connectToObs();

    if (!connected) {
      return {
        connected: false,
        streaming: false
      };
    }

    const streamStatus = await obs.call("GetStreamStatus");

    return {
      connected: true,
      streaming: !!streamStatus.outputActive
    };
  } catch (error) {
    obsConnected = false;
    return {
      connected: false,
      streaming: false
    };
  }
}

async function checkStatus() {
  try {
    const backendStatus = await getJson("/streams/status");
    const obsStatus = await getObsStatus();

    const snapshot = {
      selected_page: backendStatus?.data?.selected_page || null,
      current_stream: backendStatus?.data?.current_stream || null,
      obs: obsStatus
    };

    const current = JSON.stringify(snapshot);

    if (current !== lastSnapshot) {
      const pageReady = !!snapshot.selected_page;
      const streamReady = !!snapshot.current_stream;
      const backendReady = pageReady && streamReady;

      console.log("\n=== LiveBridge Status Update ===");
      console.log(`Backend reachable: YES`);
      console.log(`Page selected: ${pageReady ? "YES" : "NO"}`);
      console.log(`Stream prepared: ${streamReady ? "YES" : "NO"}`);
      console.log(`OBS connected: ${snapshot.obs.connected ? "YES" : "NO"}`);
      console.log(`OBS streaming: ${snapshot.obs.streaming ? "YES" : "NO"}`);
      console.log(`System ready: ${backendReady && snapshot.obs.connected ? "YES" : "NO"}`);

      if (snapshot.current_stream) {
        console.log(`Stream Title: ${snapshot.current_stream.title}`);
      }

      lastSnapshot = current;
    }
  } catch (error) {
    console.log("\n=== LiveBridge Status Update ===");
    console.log("Backend reachable: NO");
    console.log(error.message);
  }
}

async function main() {
  console.log("LiveBridge Helper (OBS Watch Mode)");
  console.log(`Backend: ${BASE_URL}`);
  console.log(`OBS WebSocket: ${OBS_WS_URL}`);

  setInterval(checkStatus, 5000);
  await checkStatus();
}

main();