const { Exercise } = require('../models/exercise')

async function getExercise(req, res, next) {
    let exercise;
    try {
        exercise = await Exercise.findById(req.params.id).populate('userId')
        if (!exercise) {
            return res.status(404).json({ message: 'Cannot find exercise'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
    res.exercise = exercise
    next()
} 

module.exports = getExercise