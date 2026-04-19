const config = require("./config");
const { printStatus, printBackendError } = require("./formatters");
const obsService = require("./obs-service");
const obsClient = obsService.getClient();

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
    const obsStatus = await obsService.getStreamStatus();

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
  console.log("LiveBridge Helper (Action Layer Mode)");
  console.log(`Backend: ${config.backendUrl}`);
  console.log(`OBS WebSocket: ${config.obsWsUrl}`);

  obsClient.on("StreamStateChanged", (event) => {
    console.log("\nEVENT: StreamStateChanged");
    console.log(event);
  });

  obsClient.on("ConnectionClosed", () => {
    console.log("\nEVENT: OBS connection closed");
  });

  obsClient.on("ConnectionOpened", () => {
    console.log("\nEVENT: OBS connection opened");
  });

  await checkStatus();
  setInterval(checkStatus, config.pollIntervalMs);
}
main();