const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const _ = require('lodash')
const { User, validate } = require('../models/user')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const JWT_SECRET = config.get('jwtPrivateKey')

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('User already registered.')

    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()
    
    const token = user.generateAuthToken()
    res.header('x-auth-token', token).send(_.pick(user, ['name', 'email']))
})

router.post('/reset-password', async (req, res) => {
    const { email } = (req.body)

    try {
        const user = await User.findOne({ email: email})
        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist'})
        }
        const secret = JWT_SECRET
        const token = jwt.sign({ email: user.email, id: user._id }, secret, {
            expiresIn: "5m",
        });

        const link = `http://localhost:3000/reset-password/${user._id}/${token}`

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
          
          transporter.sendMail(mailOptions, function(error, info){
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

router.get("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params

    try {
        const user = await User.findOne({ _id: id})

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist'})
        }
    
        const secret = JWT_SECRET
        const verify = jwt.verify(token, secret)
        
        if (verify.id !== id) {
            return res.status(400).json({ success: false, message: 'Invalid Token'})
        }

        res.json({ success: true, message: 'Token Verified', redirectUrl: `/new-password/${id}/${token}`})
    } catch (err) {
        console.error('Token verification failed: ', err)
        res.status(400).json({ success: false, message: 'Not Verified'})
    }
})

router.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params
    const { password, password_2 } = req.body

    try {
        const user = await User.findOne({ _id: id})

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist'})
        }
    
        const secret = JWT_SECRET
        const verify = jwt.verify(token, secret)
        
        if (verify.id !== id) {
            return res.status(400).json({ success: false, message: 'Invalid Token'})
        }

        if (password !== password_2) {
            return res.status(400).json({ success: false, message: 'Passwords Do Not Match'})
        }        

        if (password.length < 10) {
            return res.status(400).json({ success: false, message: 'Password Must Be At Least 10 Characters'})
        }        

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

module.exports = router