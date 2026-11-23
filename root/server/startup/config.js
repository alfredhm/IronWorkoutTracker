const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: JWT_PRIVATE_KEY is not defined.");
  }
};
