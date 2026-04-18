const OBSWebSocket = require("obs-websocket-js").default;
const config = require("./config");
const { printStatus, printBackendError } = require("./formatters");

const obs = new OBSWebSocket();

let obsConnected = false;
let lastSnapshot = null;
let lastObsConnected = null;
let lastObsStreaming = null;

async function getJson(path) {
  const response = await fetch(`${config.backendUrl}${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${path} failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function connectToObs() {
  try {
    if (obsConnected) return true;

    await obs.connect(config.obsWsUrl, config.obsWsPassword);
    obsConnected = true;
    console.log(`Connected to OBS at ${config.obsWsUrl}`);
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
        streaming: false,
        configured: false
      };
    }

    const streamStatus = await obs.call("GetStreamStatus");
    const streamService = await obs.call("GetStreamServiceSettings");

    const settings = streamService.streamServiceSettings || {};
    const server = settings.server || "";
    const key = settings.key || settings.password || "";

    return {
      connected: true,
      streaming: !!streamStatus.outputActive,
      configured: !!(server && key)
    };
  } catch (error) {
    obsConnected = false;
    return {
      connected: false,
      streaming: false,
      configured: false
    };
  }
}

function logObsEvents(obsStatus) {
  if (lastObsConnected === null) {
    lastObsConnected = obsStatus.connected;
  } else if (lastObsConnected !== obsStatus.connected) {
    console.log(
      obsStatus.connected
        ? "EVENT: OBS connected"
        : "EVENT: OBS disconnected"
    );
    lastObsConnected = obsStatus.connected;
  }

  if (lastObsStreaming === null) {
    lastObsStreaming = obsStatus.streaming;
  } else if (lastObsStreaming !== obsStatus.streaming) {
    console.log(
      obsStatus.streaming
        ? "EVENT: OBS started streaming"
        : "EVENT: OBS stopped streaming"
    );
    lastObsStreaming = obsStatus.streaming;
  }
}

async function checkStatus() {
  try {
    const backendStatus = await getJson("/streams/status");
    const obsStatus = await getObsStatus();

    logObsEvents(obsStatus);

    const snapshot = {
      selected_page: backendStatus?.data?.selected_page || null,
      current_stream: backendStatus?.data?.current_stream || null,
      obs: obsStatus
    };

    const current = JSON.stringify(snapshot);

    if (current !== lastSnapshot) {
      printStatus(snapshot);
      lastSnapshot = current;
    }
  } catch (error) {
    printBackendError(error);
  }
}

async function main() {
  console.log("LiveBridge Helper (Structured Mode)");
  console.log(`Backend: ${config.backendUrl}`);
  console.log(`OBS WebSocket: ${config.obsWsUrl}`);

  await checkStatus();
  setInterval(checkStatus, config.pollIntervalMs);
}

main();