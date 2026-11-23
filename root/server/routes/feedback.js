const express = require("express");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");
const asyncMiddleware = require("../middleware/asyncMiddleware");
const { User } = require("../models/user");

const router = express.Router();
const feedbackAddress = "ironworkouttracker@gmail.com";
const feedbackSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  subject: Joi.string().trim().min(1).max(120).pattern(/^[^\r\n]+$/).required(),
  body: Joi.string().trim().min(1).max(10000).required(),
});

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error, value } = feedbackSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findById(req.user.id).select("name");
    if (!user)
      return res.status(404).json({ message: "The user was not found." });

    const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
    if (!appPassword) {
      return res.status(503).json({
        message:
          "Feedback email is not configured. Set GMAIL_APP_PASSWORD on the server.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: feedbackAddress, pass: appPassword },
    });

    try {
      await transporter.sendMail({
        from: {
          name: "Iron Workout Tracker Feedback",
          address: feedbackAddress,
        },
        to: feedbackAddress,
        replyTo: { name: user.name, address: value.email },
        subject: `[Feedback] ${value.subject}`,
        text: `From: ${user.name} <${value.email}>\n\n${value.body}`,
      });
    } catch (mailError) {
      if (mailError.code === "EAUTH" || mailError.responseCode === 534) {
        console.error("Feedback Gmail authentication failed:", {
          code: mailError.code,
          responseCode: mailError.responseCode,
        });
        return res.status(503).json({
          message:
            "Gmail rejected the credentials for ironworkouttracker@gmail.com. Set a valid App Password for that account in root .env, then restart the backend.",
        });
      }
      throw mailError;
    }

    res.status(200).json({ message: "Feedback sent." });
  }),
);

module.exports = router;
