const auth = require('../middleware/auth')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const _ = require('lodash')
const { User, validate } = require('../models/user') 
const mongoose = require('mongoose')
const express = require('express')
const { Workout } = require('../models/workout')
const seedDatabase = require('../seedDatabase')
const { WorkoutSession } = require('../models/workoutsession')
const { Exercise } = require('../models/exercise')
const { Set } = require('../models/set')
const router = express.Router()

const JWT_SECRET = config.get('jwtPrivateKey')

// Gets user data (except password)
router.get('/me', auth, asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
}))

// Creates new user
router.post('/', asyncMiddleware(async (req, res) => {
    // Validate body, if not validated, throw error
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Find user with email, if user found, throw error that user is already registered
    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('Unable to register with the provided email.');

    // Create new user with encrypted password
    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()
    await seedDatabase(user._id)
    
    // Send token 
    const token = user.generateAuthToken();
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 * 1000, // 1 hour expiration
    });
    res.send({
        uid: user._id, // Include the id as uid
        name: user.name,
        email: user.email,
    });
}))

// Sends a reset password link to a user, activated when email is submitted to forgot password page
router.post('/reset-password', asyncMiddleware(async (req, res) => {
    const { email } = (req.body)

    // Find user by email, if none, throw error
    const user = await User.findOne({ email: email})
    if (!user) {
        return res.status(400).json({ success: false, message: 'User does not exist'})
    }

    // Create jwt token for reset link
    const secret = JWT_SECRET
    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
        expiresIn: "15m",
    });

    const link = `http://localhost:3000/reset-password/${user._id}/${token}`

    // Use nodemailer to send link to user through email
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ironworkouttracker@gmail.com',
            pass: 'qetf rdhv xair dnqw'
        }
    });
      
    var mailOptions = {
        from: 'ironworkouttracker@gmail.com',
        to: user.email,
        subject: 'Password Reset',
        text: `Click on the link to change your password \n ${link}`
    };
      
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.cookie('resetToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000, // 5 minutes expiration
    });
    res.send("Check your email for the reset link.");
}))

// Verifies user and token when reset link is clicked
router.get("/reset-password/:id/:token", asyncMiddleware(async (req, res) => {
    const { id, token } = req.params

    // Get user
    const user = await User.findOne({ _id: id})

    // If user doesn't exist, throw error
    if (!user) {
        return res.status(400).json({ success: false, message: 'User does not exist'})
    }

    // Verifies jwt token
    const secret = JWT_SECRET
    const verify = jwt.verify(token, secret)
    
    // If id doesn't match after verification, token is invalid
    if (verify.id !== id) {
        return res.status(400).json({ success: false, message: 'Invalid Token'})
    }

    // If success, redirect user to new password page
    res.json({ success: true, message: 'Token Verified', redirectUrl: `/new-password/${id}/${token}`})
}))

// Changes the user's password
router.post("/reset-password/:id/:token", asyncMiddleware(async (req, res) => {
    const { id, token } = req.params
    const { password, password_2 } = req.body

    // Get user
    const user = await User.findOne({ _id: id})

    // If user doesn't exist, throw error
    if (!user) {
        return res.status(400).json({ success: false, message: 'User does not exist'})
    }

    // Verifies jwt token
    const secret = JWT_SECRET
    const verify = jwt.verify(token, secret)
    
    // If id doesn't match after verification, token is invalid
    if (verify.id !== id) {
        return res.status(400).json({ success: false, message: 'Invalid Token'})
    }

    if (password !== password_2 || password.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid password input.' });
    }
    // Encrypt new password and update user's password
    const salt = await bcrypt.genSalt(10)
    const encryptedPassword = await bcrypt.hash(password, salt)

    await User.updateOne(
        {
            _id: id,
        },
        {
            $set: {
                password: encryptedPassword,
            },
        }
    )
    res.json({ success: true, message: 'Password Updated'})
}))

router.put('/me', auth, asyncMiddleware(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email,
    }, { new: true })
    if (!user) return res.status(404).send('The user with the given ID was not found.')

    res.send(user)
}))

router.delete('/:userId/workouts/:workoutId', auth, asyncMiddleware(async (req, res) => {
    const userId = req.params.userId
    const workoutId = req.params.workoutId

    // Validate that user exists
    const userExists = await User.exists({ _id: userId })
    if (!userExists) {
        return res.status(400).send('User does not exist in database')
    }

    // Validate that workout exists
    const workoutExists = await Workout.exists({ _id: workoutId })
    if (!workoutExists) {
        return res.status(400).send('Workout does not exist in database')
    }

    res.json({ message: 'User deleted' })
}))

module.exports = router
