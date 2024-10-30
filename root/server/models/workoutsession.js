const Joi = require('joi')
const mongoose = require('mongoose')
const muscleGroups = require('../resources/muscle-groups')
const Exercise = require('./exercise')

const workoutSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        maxlength: 50,
        default: "Unnamed Session"
    },
    focusGroup: {
        type: [String],
        enum: muscleGroups,
        default: []
    },
    workoutTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout'
    },
    exercises: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
    }],
    date: {
        type: Date,
        default: Date.now
    },
    durationSec: {
        type: Number, 
        default: 0
    },
    notes: {
        type: String,
        maxlength: 50,
        default: ""
    }
});

// Middleware to delete exercises when a WorkoutSession is deleted
workoutSessionSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        await Exercise.deleteMany({ _id: { $in: this.exercises } });
        next();
    } catch (err) {
        next(err);
    }
});

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

async function validateWorkoutSession(workoutSession) {
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
        name: Joi.string().max(30).default('Unnamed Session').allow('', null).error(errors => {
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
                        console.log(muscleGroups)
                        break
                    case "any.only":
                        err.message = "Must Be a Valid Muscle Group"
                        console.log(err)
                        console.log(muscleGroups)
                        break
                }
            })
        return errors
        }),
        workoutTemplate: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).error(errors => {
            errors.forEach(err => {
                switch (err.code) { 
                    case "string.pattern.base":
                        err.message = "Invalid Workout ID format";
                        break;
                  } 
            })
            return errors
        }),
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
        date: Joi.date(),
        durationSec: Joi.number().default(0).allow('', null).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "any.empty":
                        err.message = "Workout Duration is Required"
                        break
                    case "number.min":
                        err.message = "Workout Must be Longer than 10 Seconds"
                        break
                }
            })
            return errors
        }),
        notes: Joi.string().max(50).allow('', null).optional().error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "string.max":
                        err.message = `Max Notes Length is 250 Characters`;
                        break;                   
                }
            })
            return errors
        }),
    })

    // Validate using Joi Schema
    const { error } = schema.validate(workoutSession)
    if (error) {
        throw error;
    }

    // If all is good, return exercise
    return workoutSession
}

exports.WorkoutSession = WorkoutSession
exports.validate = validateWorkoutSession