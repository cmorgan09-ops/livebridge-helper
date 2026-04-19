const obsService = require("./obs-service");

async function main() {
  try {
    console.log("Requesting OBS to start streaming...");
    await obsService.startStream();
    console.log("OBS start stream command sent successfully.");
  } catch (error) {
    console.error("Failed to start OBS stream:");
    console.error(error.message);
  }
}

main();