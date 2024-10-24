const { Exercise } = require('../models/exercise')

async function getExercise(req, res, next) {
    var exercise;
    try {
        exercise = await Exercise.findById(req.params.id)
        if (!exercise) {
            return res.status(404).json({ message: 'Cannot find exercise'})
        }
    } catch (err) {
        return res.status(404).json({ message: 'Cannot find exercise'})
    }
    res.exercise = exercise
    next()
} 

module.exports = getExercise