const EventEmitter = require("node:events");

const event = new EventEmitter();

(async () => {
  const { logger } = await import("./logger.mjs");

  event.on("filmViewed", (film) => {
    logger.event(`filmViewed - Film ${film.title}`);
  });

  event.on("filmAdded", (film) => {
    logger.event(`filmAdded - Film: ${film.title}`);
  });

  event.on(`reportsGenerated`, (file) => {
    logger.event(`reportsGenerated - File: ${file}`);
  });
})();

module.exports = event;
