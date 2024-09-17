const { WorkoutSession } = require('../models/workoutsession')

async function getWorkoutSession(req, res, next) {
    let workoutSession;
    try {
        workoutSession = await WorkoutSession.findById(req.params.id).populate('userId').populate('exercises')
        if (!workoutSession) {
            return res.status(404).json({ message: 'Cannot find workout session'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
    res.workoutSession = workoutSession
    next()
} 

module.exports = getWorkoutSession