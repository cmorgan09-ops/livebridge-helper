function yesNo(value) {
  return value ? "YES" : "NO";
}

function printStatus(snapshot) {
  const pageReady = !!snapshot.selected_page;
  const streamReady = !!snapshot.current_stream;
  const obsConnected = !!snapshot.obs?.connected;
  const obsStreaming = !!snapshot.obs?.streaming;
  const obsConfigured = !!snapshot.obs?.configured;
  const backendReady = pageReady && streamReady;
  const systemReady = backendReady && obsConnected && obsConfigured;

  console.log("\n=== LiveBridge Status Update ===");
  console.log(`Backend reachable: YES`);
  console.log(`Page selected: ${yesNo(pageReady)}`);
  console.log(`Stream prepared: ${yesNo(streamReady)}`);
  console.log(`OBS connected: ${yesNo(obsConnected)}`);
  console.log(`OBS streaming: ${yesNo(obsStreaming)}`);
  console.log(`OBS configured: ${yesNo(obsConfigured)}`);
  console.log(`System ready: ${yesNo(systemReady)}`);

  if (snapshot.selected_page) {
    console.log(`Selected Page: ${snapshot.selected_page.page_name}`);
  }

  if (snapshot.current_stream) {
    console.log(`Stream Title: ${snapshot.current_stream.title}`);
  }
}

function printBackendError(error) {
  console.log("\n=== LiveBridge Status Update ===");
  console.log("Backend reachable: NO");
  console.log(error.message);
}

module.exports = {
  printStatus,
  printBackendError
};