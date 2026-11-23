const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// Units are derived from measurement kind so clients cannot store mismatched units.
const measurementUnits = { bodyWeight: "lb" };

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
    unique: true,
  },
  heightInches: {
    type: Number,
    min: 24,
    max: 96,
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1024,
  },
  workouts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
    },
  ],
  // Keep each dated body measurement embedded with its owning user record.
  measurements: [
    {
      kind: {
        type: String,
        enum: ["bodyWeight", "waist", "chest", "hips", "upperArm", "thigh"],
        required: true,
      },
      value: {
        type: Number,
        min: 0,
        required: true,
      },
      unit: {
        type: String,
        enum: ["lb", "in"],
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email, name: this.name, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey"),
    { expiresIn: "1h" },
  );
  return token;
};

// Model methods keep measurement ordering and persistence out of route handlers.
userSchema.methods.getMeasurements = function () {
  return this.measurements
    .filter((measurement) => measurement.kind === "bodyWeight")
    .slice()
    .sort((first, second) => second.date - first.date);
};

userSchema.methods.addMeasurement = async function (measurement) {
  this.measurements.push({
    kind: measurement.kind,
    value: measurement.value,
    unit: measurementUnits[measurement.kind],
    date: measurement.date,
  });
  await this.save();
  return this.measurements[this.measurements.length - 1];
};

userSchema.methods.removeMeasurement = async function (measurementId) {
  const measurement = this.measurements.id(measurementId);
  if (!measurement) return false;

  this.measurements.pull(measurement._id);
  await this.save();
  return true;
};

const User = mongoose.model("User", userSchema);

// Apply the same kind/unit limits to every measurement API request.
function validateMeasurement(measurement) {
  const schema = Joi.object({
    kind: Joi.string()
      .valid(...Object.keys(measurementUnits))
      .required(),
    value: Joi.number().positive().max(1000).required(),
    date: Joi.date().default(Date.now),
  });

  return schema.validate(measurement);
}

function validateHeightInches(heightInches) {
  const schema = Joi.number()
    .min(24)
    .max(96)
    .allow(null)
    .optional();
  return schema.validate(heightInches);
}

// Validator function
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(30)
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.empty":
              err.message = "Name Is Required";
              break;
            case "string.min":
              err.message = `Name must be at least ${err.local.limit} characters!`;
              break;
            case "string.max":
              err.message = `Name should not be more than ${err.local.limit} characters!`;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    email: Joi.string()
      .min(2)
      .max(255)
      .required()
      .email()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.empty":
              err.message = "E-Mail Is Required";
              break;
            case "string.min":
              err.message = `E-Mail must be at least ${err.local.limit} characters!`;
              break;
            case "string.max":
              err.message = `E-Mail should not be more than ${err.local.limit} characters!`;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    password: Joi.string()
      .min(10)
      .max(255)
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.empty":
              err.message = "Password Is Required";
              break;
            case "string.min":
              err.message = `Password must be at least ${err.local.limit} characters!`;
              break;
            case "string.max":
              err.message = `Password should not be more than ${err.local.limit} characters!`;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    workouts: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.pattern.base":
              err.message = "Invalid Workout ID format";
              break;
          }
        });
        return errors;
      }),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
exports.validateMeasurement = validateMeasurement;
exports.validateHeightInches = validateHeightInches;
