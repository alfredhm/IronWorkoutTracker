const Joi = require('joi')
const mongoose = require('mongoose')
const { Exercise } = require('./exercise')

const setSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    reps: {
        type: Number,
    },
    weight: {
        type: Number,
        min: 0,
    },
    notes: {
        type: String,
        max: 250
    },
    bodyWeight: {
        type: Boolean,
        default: false
    },
    restTimeSec: {
        type: Number,
        min: 0,
    }
})

const Set = mongoose.model('Set', setSchema)

// Validator function
async function validateSet(set) {
    const schema = Joi.object({
        exerciseId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "any.empty":
                        err.message = "Exercise ID is required";
                        break;
                    case "string.pattern.base":
                        err.message = "Invalid Exercise ID format";
                        break;
                }
            })
            return errors
        }),
        reps: Joi.number().error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "number.min":
                        err.message = `Minimum Number of Reps is 1`;
                        break;
                    case "number.max":
                        err.message = `Maximum Number of Reps is 30`;
                        break;                    
                }
            })
            return errors
        }),
        weight: Joi.number().min(0).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "number.min":
                        err.message = `Minimum Weight is 0`;
                        break;                   
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
        bodyWeight: Joi.boolean().default(false),
        restTimeSec: Joi.number().min(0).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "number.min":
                        err.message = `Minimum Number of Reps is 1`;
                        break;                   
                }
            })
            return errors
        }),
    })

    // Validate using Joi Schema
    const { error } = schema.validate(set)
    if (error) {
        throw error;
    }

    // Validate that exercise exists
    const exerciseExists = await Exercise.exists({ _id: set.exerciseId })
    if (!exerciseExists) {
        throw new Error('Exercise does not exist in database')
    }

    
    // If all is good, return set
    return set
}

exports.Set = Set
exports.validate = validateSet