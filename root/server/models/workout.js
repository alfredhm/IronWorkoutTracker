const Joi = require('joi')
const mongoose = require('mongoose')
const muscleGroups = require('../resources/muscle-groups')

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        maxlength: 50,
        default: "Unnamed Workout"
    },
    focusGroup: {
        type: [String],
        enum: muscleGroups,
        default: []
    },
    notes: {
        type: String,
        max: 500,
        default: ""
    },
    date: {
        type: Date, 
        default: Date.now
    },
    exercises: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
    }], 
    isTemplate: {
        type: Boolean,
        default: true 
    },
}, { timestamps: true })

const Workout = mongoose.model('Workout', workoutSchema)

// Validator function
async function validateWorkout(workout) {
     const schema = Joi.object({
        userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "any.empty":
                        err.message = "User ID is required";
                        break;
                    case "string.pattern.base":
                        err.message = "Invalid User ID format";
                        break;
                }
            })
            return errors
        }),
        name: Joi.string().max(30).default('Unnamed Workout').allow('', null).error(errors => {
            errors.forEach(err => {
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
                  } 
            })
            return errors
        }),
        focusGroup: Joi.array()
            .items(Joi.string().valid(...muscleGroups))
            .error(errors => { 
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.empty":
                            err.message = "At Least 1 Focus Group is Required"
                            break
                        case "any.only":
                            err.message = "Must Be a Valid Muscle Group"
                            break
                    }
                })
            return errors
        }),
        notes: Joi.string().max(500).allow('', null).optional().error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "string.max":
                        err.message = `Max Notes Length is 500 Characters`;
                        break;                   
                }
            })
            return errors
        }),
        date: Joi.date(),
        exercises: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).error(errors => {
            errors.forEach(err => {
                switch (err.code) { 
                    case "string.pattern.base":
                        err.message = "Invalid Exercise ID format";
                        break;
                  } 
            })
            return errors
        }),
        isTemplate: Joi.boolean().default(false),
    })

    // Validate using Joi Schema
    const { error } = schema.validate(workout)
    if (error) {
        throw error;
    }

    // If all is good, return exercise
    return workout
}

exports.Workout = Workout
exports.validate = validateWorkout