const { Workout } = require('../models/workout')

// Fetches a workout
async function getWorkout(req, res, next) {
    let workout;
    try {
        workout = await Workout.findById(req.params.id).populate('userId')
        if (!workout) {
            return res.status(404).json({ message: 'Cannot find workout'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
    res.workout = workout
    next()
} 

module.exports = getWorkout