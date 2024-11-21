const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const users = require('../routes/users')
const auth = require('../routes/auth')
const exercises = require('../routes/exercises')
const sets = require('../routes/sets')
const workouts = require('../routes/workouts')
const workoutSessions = require('../routes/workoutsessions')
const loginLimiter = require('../middleware/loginLimiter')
const error = require('../middleware/error')

module.exports = function(app) {
    app.use(express.json())
    app.use(cors({
        credentials: true
      }))
    app.use(cookieParser())
    app.use('/api/users', users)
    app.use('/api/auth', auth, loginLimiter())
    app.use('/api/exercises', exercises)
    app.use('/api/sets', sets)
    app.use('/api/workouts', workouts)
    app.use('/api/workoutsessions', workoutSessions)
    app.use(error)
}