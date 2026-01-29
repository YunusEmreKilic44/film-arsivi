import fs from "fs/promises";
import path from "path";

const logPath = path.join(process.cwd(), "logs", "app.log");

function now() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

async function write(level, message) {
  await fs.appendFile(
    logPath,
    `[${now()} ${level.toUpperCase()}: ${message}]\n`,
  );
}

export const logger = {
  info: (msg) => write("info", msg),
  warn: (msg) => write("warn", msg),
  error: (msg) => write("error", msg),
  event: (msg) => write("event", msg),
};
