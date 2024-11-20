const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const { User } = require('../models/user')
const express = require('express')
const config = require('config')
const router = express.Router()

const JWT_SECRET = config.get('jwtPrivateKey')

// Function for verifying user
router.get("/verify", (req, res) => {
    console.log(req.body)
    const token = req.cookies.authToken; // Read the cookie

    if (!token) {
        return res.status(401).json({ authenticated: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
        return res.status(200).json({ authenticated: true, user: decoded });
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ authenticated: false, message: "Invalid token" });
    }
});

// Function for authenticating user
router.post('/', async (req, res) => {

    // Throw error if body is not valid
    const { error } = validate(req.body) 
    if (error) return res.status(400).send(error.details[0].message) 

    // Find the user with email, if there is none, throw error
    let user = await User.findOne({ email: req.body.email })

    // Verify password, if not verified, throw error
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if (!user || !validPassword) return res.status(400).send('Invalid email or password.')
    
    // On success, create token and welcome user
    const token = user.generateAuthToken()
    res.cookie('authToken', token, {
        httpOnly: true, // Prevent access by JavaScript
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Prevent CSRF
        maxAge: 3600 * 1000, // 1 hour expiration
    });
    res.json({ message: `Welcome ${user.name}`, token: token, uid: user._id, name: user.name, email: user.email })
})

// Function for logging out user
router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.json({ message: 'Successfully logged out' });
});


// Validates request body
function validate(req) {  
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    })
    return schema.validate(req) 
}    

module.exports = router