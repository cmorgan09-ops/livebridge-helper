const OBSWebSocket = require("obs-websocket-js").default;
const config = require("./config");

class ObsService {
  constructor() {
    this.obs = new OBSWebSocket();
    this.connected = false;
  }
  async applyPreparedStream(stream) {
    if (!stream || !stream.stream_server || !stream.stream_key) {
      throw new Error("Prepared stream is missing stream_server or stream_key");
    }

    return this.setStreamServiceSettings(
      stream.stream_server,
      stream.stream_key
    );
  }
  getClient() {
    return this.obs;
  }
  async connect() {
    try {
      if (this.connected) return true;

      await this.obs.connect(config.obsWsUrl, config.obsWsPassword);
      this.connected = true;
      return true;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  async getStreamStatus() {
    try {
      const ok = await this.connect();

      if (!ok) {
        return {
          connected: false,
          streaming: false,
          configured: false
        };
      }

      const streamStatus = await this.obs.call("GetStreamStatus");
      const streamService = await this.obs.call("GetStreamServiceSettings");

      const settings = streamService.streamServiceSettings || {};
      const server = settings.server || "";
      const key = settings.key || settings.password || "";

      return {
        connected: true,
        streaming: !!streamStatus.outputActive,
        configured: !!(server && key),
        settings: {
          server,
          hasKey: !!key
        }
      };
    } catch (error) {
      this.connected = false;
      return {
        connected: false,
        streaming: false,
        configured: false
      };
    }
  }

  async getStreamServiceSettings() {
    try {
      const ok = await this.connect();

      if (!ok) {
        throw new Error("OBS is not connected");
      }

      const response = await this.obs.call("GetStreamServiceSettings");
      const settings = response.streamServiceSettings || {};

      return {
        server: settings.server || "",
        hasKey: !!(settings.key || settings.password || "")
      };
    } catch (error) {
      throw error;
    }
  }
  async setStreamServiceSettings(server, key) {
    try {
      const ok = await this.connect();

      if (!ok) {
        throw new Error("OBS is not connected");
      }

      await this.obs.call("SetStreamServiceSettings", {
        streamServiceType: "rtmp_custom",
        streamServiceSettings: {
          server,
          key
        }
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async startStream() {
    try {
      const ok = await this.connect();

      if (!ok) {
        throw new Error("OBS is not connected");
      }

      await this.obs.call("StartStream");
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async stopStream() {
    try {
      const ok = await this.connect();

      if (!ok) {
        throw new Error("OBS is not connected");
      }

      await this.obs.call("StopStream");
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ObsService();