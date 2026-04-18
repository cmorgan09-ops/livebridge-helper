require("dotenv").config();
const obsService = require("./obs-service");
const config = require("./config");

async function getJson(path) {
  const response = await fetch(`${config.backendUrl}${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${path} failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  try {
    console.log("Fetching current stream from backend...");
    const currentStreamResponse = await getJson("/streams/current");
    const stream = currentStreamResponse.data;

    console.log("Current stream:");
    console.log(stream);

    console.log("\nApplying prepared stream to OBS...");
    await obsService.applyPreparedStream(stream);

    console.log("OBS stream settings updated successfully.");

    const settings = await obsService.getStreamServiceSettings();
    console.log("\nOBS Stream Service Settings After Apply:");
    console.log(settings);
  } catch (error) {
    console.error("Failed to apply backend stream to OBS:");
    console.error(error.message);
  }
}

main();