const Joi = require('joi')
const mongoose = require('mongoose')

const workoutSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    notes: {
        type: String,
        maxlength: 500,
        default: ""
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
        notes: Joi.string().max(250).error(errors => {
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