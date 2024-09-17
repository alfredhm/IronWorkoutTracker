const config = require('config')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const mongoose = require('mongoose')
const muscleGroups = require('../resources/muscle-groups')
const { User } = require('./user')

const exerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout'
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    focusGroup: {
        type: [String],
        enum: muscleGroups,
    },
    notes: {
        type: String,
        max: 250
    },
    sets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Set'
    }],
    isTemplate: {
        type: Boolean,
        default: true
    }
})

const Exercise = mongoose.model('Exercise', exerciseSchema)

async function validateExercise(exercise) {
    const schema = Joi.object({
        userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "any.empty":
                        err.message = "User ID is required";
                        break;
                    case "string.pattern.base":
                        err.message = "InvalidUser ID format";
                        break;
                }
            })
            return errors
        }),
        workoutId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "any.empty":
                        err.message = "Workout ID is required";
                        break;
                    case "string.pattern.base":
                        err.message = "Workout User ID format";
                        break;
                }
            })
            return errors
        }),
        name: Joi.string().min(2).max(30).required().error(errors => {
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
                    default:
                      break;
                  } 
            })
            return errors
        }),
        focusGroup: Joi.array()
            .items(Joi.string().valid(...muscleGroups))
            .min(1)
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
        notes: Joi.string().max(250).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "string.max":
                        err.message = `Max Notes Length is 250 Characters`;
                        break;                   
                }
            })
        }),
        sets: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).error(errors => {
            errors.forEach(err => {
                switch (err.code) { 
                    case "string.pattern.base":
                        err.message = "Invalid Set ID format";
                        break;
                  } 
            })
            return errors
        }),
        template: Joi.boolean().default(true),
    })

    // Validate using Joi Schema
    const { error } = schema.validate(exercise)
    if (error) {
        throw error;
    }

    
    // If all is good, return exercise
    return exercise
}

exports.Exercise = Exercise
exports.validate = validateExercise