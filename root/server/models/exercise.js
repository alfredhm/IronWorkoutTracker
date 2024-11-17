const Joi = require('joi')
const mongoose = require('mongoose')
const muscleCategories = require('../resources/muscle-groups')

const exerciseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {    
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    category: { 
        type: [String], 
        enum: muscleCategories,
    }, 
    notes: {
        type: String,
        max: 500 
    },
    sets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Set'
    }],
    numOfSets:{ 
        type: Number,
        default: 3
    }, 
    isSingle: {
        type: Boolean,
        default: false
    }, 
    isPreset: {
        type: Boolean,
        default: false
    },
    isUserPreset: {
        type: Boolean,
        default: false
    }
})
 
const Exercise = mongoose.model('Exercise', exerciseSchema)

// Validator function
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
        category: Joi.array()
            .items(Joi.string().valid(...muscleCategories))
            .error(errors => {
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.only":
                            err.message = "Must Be a Valid Category"
                            break
                        case "any.max":
                            err.message = "Only 1 Category"
                            break
                    } 
                })
            return errors
        }),
        notes: Joi.string().max(500).allow('').error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "string.max":
                        err.message = `Max Notes Length is 500 Characters`;
                        break;                   
                }
            })
            return errors
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
        numOfSets: Joi.number().default(3),
        isSingle: Joi.boolean().default(false),
        isPreset: Joi.boolean().default(false),
        isUserPreset: Joi.boolean().default(false)
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