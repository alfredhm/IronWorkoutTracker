const auth = require('../middleware/auth')
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
const router = express.Router()

const JWT_SECRET = config.get('jwtPrivateKey')

// Gets user data (except password)
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
})

// Creates new user
router.post('/', async (req, res) => {
    // Validate body, if not validated, throw error
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Find user with email, if user found, throw error that user is already registered
    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('User already registered.')

    // Create new user with encrypted password
    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()
    console.log("ASDADAWDAWD", user, user._id)
    await seedDatabase(user._id)
    
    // Send token 
    const token = user.generateAuthToken()
    res.header('x-auth-token', token).send(_.pick(user, ['name', 'email']))
})

// Sends a reset password link to a user, activated when email is submitted to forgot password page
router.post('/reset-password', async (req, res) => {
    const { email } = (req.body)

    try {
        // Find user by email, if none, throw error
        const user = await User.findOne({ email: email})
        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist'})
        }

        // Create jwt token for reset link
        const secret = JWT_SECRET
        const token = jwt.sign({ email: user.email, id: user._id }, secret, {
            expiresIn: "5m",
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
        return res.send("Done")

    } catch (err) { 
        console.error(err.message)
    }
})

// Verifies user and token when reset link is clicked
router.get("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params

    try {
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
    } catch (err) {
        console.error('Token verification failed: ', err)
        res.status(400).json({ success: false, message: 'Not Verified'})
    }
})

// Changes the user's password
router.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params
    const { password, password_2 } = req.body

    try {
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

        // If passwords don't match, throw error
        if (password !== password_2) {
            return res.status(400).json({ success: false, message: 'Passwords Do Not Match'})
        }        

        // If password is less than 10 characters, throw error
        if (password.length < 10) {
            return res.status(400).json({ success: false, message: 'Password Must Be At Least 10 Characters'})
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
    } catch (err) {
        console.error('Password reset failed: ', err)
        res.status(400).json({ success: false, message: 'Something went wrong'})
    }
})

router.delete('/:userId/workouts/:workoutId', auth, async (req, res) => {
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

    // Delete workout
    await Workout.deleteOne({ _id: workoutId })
    res.json({ message: 'Workout deleted' })
})

module.exports = router