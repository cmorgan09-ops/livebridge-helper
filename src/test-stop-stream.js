const obsService = require("./obs-service");

async function main() {
  try {
    console.log("Requesting OBS to stop streaming...");
    await obsService.stopStream();
    console.log("OBS stop stream command sent successfully.");
  } catch (error) {
    console.error("Failed to stop OBS stream:");
    console.error(error.message);
  }
}

main();