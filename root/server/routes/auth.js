const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const { User } = require('../models/user')
const express = require('express')
const config = require('config')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const { Workout } = require('../models/workout')
const { WorkoutSession } = require('../models/workoutsession')
const router = express.Router()

const JWT_SECRET = process.env.jwtPrivateKey

// Function for verifying user
router.get("/verify", (req, res) => {
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
router.post('/', asyncMiddleware(async (req, res, next) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 * 3000,
    });
    res.json({ 
        message: `Welcome ${user.name}`, 
        token, uid: user._id, name: user.name, email: user.email 
    });
}));

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