const winston = require("winston");
require("winston-mongodb");

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
  );

  process.on("uncaughtException", (ex) => {
    console.error("Uncaught server exception:", ex.message);
    winston.error(ex.message, ex);
  });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(new winston.transports.File({ filename: "logfile.log" }));
};
