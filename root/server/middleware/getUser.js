const { User } = require("../models/user");
const asyncMiddleware = require("./asyncMiddleware");

// Attach the authenticated user's safe-to-return document for downstream routes.
module.exports = asyncMiddleware(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).send("The user with the given ID was not found.");
  }

  res.user = user;
  next();
});
