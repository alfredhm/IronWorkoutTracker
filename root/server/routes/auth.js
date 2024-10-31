const bcrypt = require('bcrypt')
const Joi = require('joi')
const _ = require('lodash')
const { User } = require('../models/user')
const express = require('express')
const router = express.Router()

// Function for authenticating user
router.post('/', async (req, res) => {

    // Throw error if body is not valid
    const { error } = validate(req.body) 
    if (error) return res.status(400).send(error.details[0].message)

    // Find the user with email, if there is none, throw error
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Invalid email or password.')

    // Verify password, if not verified, throw error
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid email or password.')
    
    // On success, create token and welcome user
    const token = user.generateAuthToken()
    res.json({ message: `Welcome ${user.name}`, token: token, uid: user._id})
})


// Validates request body
function validate(req) {  
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    })
    return schema.validate(req) 
}    

module.exports = router