const config = require('config')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {   
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true, 
        minlength: 2,
        maxlength: 255,
        unique: true
    },  
    password: {
        type: String, 
        required: true,
        minlength: 10,
        maxlength: 1024
    }, 
    workouts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout'
    }],
    isAdmin: Boolean 
}) 

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ id: this._id, email: this.email, name: this.name, isAdmin: this.isAdmin }, process.env.jwtPrivateKey || config.get('jwtPrivateKey'), { expiresIn: '1h' })
    return token
}

const User = mongoose.model('User', userSchema)

// Validator function
function validateUser(user) {
    const schema = Joi.object({
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
        email: Joi.string().min(2).max(255).required().email().error(errors => {
            errors.forEach(err => {
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
            })
            return errors
        }),
        password: Joi.string().min(10).max(255).required().error(errors => {
            errors.forEach(err => {
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
            })
            return errors
        }),
        workouts: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).error(errors => {
          errors.forEach(err => {
              switch (err.code) { 
                  case "string.pattern.base":
                      err.message = "Invalid Workout ID format";
                      break;
                } 
          })
          return errors
      })
    })

    return schema.validate(user)
}

exports.User = User
exports.validate = validateUser