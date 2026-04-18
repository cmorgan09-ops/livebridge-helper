const obsService = require("./obs-service");

async function main() {
  const testServer = "rtmps://example.com/live";
  const testKey = "test-stream-key-123";

  try {
    console.log("Writing OBS stream settings...");
    console.log(`Server: ${testServer}`);
    console.log(`Key: ${testKey}`);

    await obsService.setStreamServiceSettings(testServer, testKey);

    console.log("OBS stream settings written successfully.");

    const settings = await obsService.getStreamServiceSettings();
    console.log("OBS Stream Service Settings After Write:");
    console.log(settings);
  } catch (error) {
    console.error("Failed to set OBS stream service settings:");
    console.error(error.message);
  }
}

main();