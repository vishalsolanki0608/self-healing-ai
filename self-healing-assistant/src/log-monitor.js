const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const LOG_FILE = path.resolve(__dirname, "../../demo-backend/logs/app.log");

class LogMonitor {
  constructor(onError) {
    this.onError = onError;
    this.lastSize = 0;
  }

  start() {
    console.log(`Watching log file: ${LOG_FILE}`);

    if (!fs.existsSync(LOG_FILE)) {
      console.error(`Log file does not exist: ${LOG_FILE}`);
      return;
    }

    this.lastSize = fs.statSync(LOG_FILE).size;

    console.log("Initial file size:", this.lastSize);

    const watcher = chokidar.watch(LOG_FILE, {
      persistent: true,
      ignoreInitial: true,

      // Reliable file monitoring on Windows
      usePolling: true,
      interval: 500,
    });

    watcher.on("ready", () => {
      console.log("👀 Log watcher is ready");
    });

    watcher.on("change", (filePath) => {
      console.log("🔥 Log file changed:", filePath);

      this.readNewLogs();
    });

    watcher.on("error", (error) => {
      console.error("Log watcher error:", error);
    });

    console.log("Log monitor started.");
  }

  readNewLogs() {
    try {
      const stats = fs.statSync(LOG_FILE);

      if (stats.size < this.lastSize) {
        console.log("Log file was truncated. Resetting position.");

        this.lastSize = 0;
      }

      const bytesToRead = stats.size - this.lastSize;

      if (bytesToRead <= 0) {
        return;
      }

      const fileHandle = fs.openSync(LOG_FILE, "r");

      const buffer = Buffer.alloc(bytesToRead);

      fs.readSync(fileHandle, buffer, 0, bytesToRead, this.lastSize);

      fs.closeSync(fileHandle);

      this.lastSize = stats.size;

      const newContent = buffer.toString("utf8");

      console.log("📄 New log content received.");

      const lines = newContent
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        this.processLogLine(line);
      }
    } catch (error) {
      console.error("Failed to read log file:", error);
    }
  }

  processLogLine(line) {
    try {
      const log = JSON.parse(line);

      if (log.level === "error") {
        console.log("\n🚨 ERROR DETECTED!");

        this.onError(log);
      }
    } catch (error) {
      console.error("Invalid JSON log:", line);
    }
  }
}

module.exports = LogMonitor;
