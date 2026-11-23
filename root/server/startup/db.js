const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = async function () {
  await mongoose.connect(config.get("mongoUri"));
  winston.info("Connected to MongoDB");
};
