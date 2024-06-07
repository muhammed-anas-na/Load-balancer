const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //Feeds error logs in error.log
    new winston.transports.File({ filename: "error.log", level: "error" }),

    //Feed info logs and low prority logs in combinedl.log
    new winston.transports.File({ filename: "combined.log"}),
  ],
});

module.exports = logger;
