const obsService = require("./obs-service");

async function main() {
  try {
    const settings = await obsService.getStreamServiceSettings();
    console.log("OBS Stream Service Settings:");
    console.log(settings);
  } catch (error) {
    console.error("Failed to get OBS stream service settings:");
    console.error(error.message);
  }
}

main();