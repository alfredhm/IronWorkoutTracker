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

const allowedOrigins = [
  "http://localhost:3000",                // Local development
  "https://ironworkoutapp-fcc22fe202a5.herokuapp.com"  // Deployed frontend URL
];

module.exports = function(app) {
    // Middleware
    app.use(express.json())
    app.use(cors({
      origin: function (origin, callback) {
          if (allowedOrigins.includes(origin) || !origin) {
              callback(null, true);
          } else {
              callback(new Error("Not allowed by CORS"));
          }
      },
      credentials: true, // Allow credentials
    }));
    app.use(cookieParser())

    // Routes
    app.use('/api/users', users)
    app.use('/api/auth', auth, loginLimiter())
    app.use('/api/exercises', exercises)
    app.use('/api/sets', sets)
    app.use('/api/workouts', workouts)
    app.use('/api/workoutsessions', workoutSessions)

    // Error handling
    app.use(error)
}