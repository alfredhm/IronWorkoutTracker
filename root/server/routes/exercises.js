const { Exercise, validate } = require('../models/exercise')
const { User } = require('../models/user')
const getExercise = require('../middleware/getExercise')
const mongoose = require('mongoose')
const express = require('express')
const { Workout } = require('../models/workout')
const router = express.Router()

const exerciseKey = {
    "Abs": ["Abs", "Obliques"],
    "Back": ["Back", "Lower Back"],
    "Biceps": ["Biceps"],
    "Chest": ["Chest"],
    "Legs": ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
    "Shoulders": ["Shoulders"],
    "Triceps": ["Triceps"]
}


// Get all exercises
router.get('/', async (req, res) => {
    try {
        const exercises = await Exercise.find()
        res.json(exercises)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Get exercises by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const exercises = await Exercise.find({ userId: userId })
        if (exercises.length === 0) {
            return res.json([])
        }
        res.json(exercises)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get exercises by category
router.get('/category/:category', async (req, res) => {
    try {
        let category = req.params.category
        category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
        let categories = exerciseKey[category]
        if (categories.length === 0 || !categories) {
            return res.json([])
        }

        let exercises = []

        for (let i = 0; i < categories.length; i++) {
            const currExercises = await Exercise.find({ category: categories[i] })
            exercises.push(...currExercises)
            
        }
        res.json(exercises)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get exercise by exercise ID
router.get('/:id', getExercise, async (req, res) => {
    res.json(res.exercise)
})

// Post new exercise
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Validate that user exists
    const userExists = await User.exists({ _id: req.body.userId })
    if (!userExists) {
        return res.status(400).send('User does not exist in database')
    }

    // If connected to a workout, check that workout exists
    if (req.body.workoutId) {
        const workoutExists = await Workout.exists({ _id: req.body.workoutId })
        if (!workoutExists) {
            return res.status(400).send('Workout does not exist in database')
        }
    }

    const exercise = new Exercise({
        userId: req.body.userId,
        workoutId: req.body.workoutId,
        name: req.body.name,
        focusGroup: req.body.focusGroup,
        notes: req.body.notes,
        sets: req.body.sets,
        isTemplate: req.body.isTemplate,
        isSingle: req.body.isSingle,
        isPreset: req.body.isPreset
    });

    try {
        const newExercise = await exercise.save()
        res.status(201).json(newExercise)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    
})

// Put/update an existing exercise
router.put('/:id', getExercise, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    try { 
        if (req.body.userId != null) {
            res.exercise.userId = req.body.userId;
        }
        if (req.body.workoutId != null) {
            res.exercise.workoutId = req.body.workoutId;
        }
        if (req.body.name != null) {
            res.exercise.name = req.body.name;
        }
        if (req.body.focusGroup != null) {
            res.exercise.focusGroup = req.body.focusGroup;
        }
        if (req.body.notes != null) {
            res.exercise.notes = req.body.notes;
        }
        if (req.body.sets != null) {
            res.exercise.sets = req.body.sets;
        }
        if (req.body.isTemplate != null) {
            res.exercise.isTemplate = req.body.isTemplate;
        }
        if (req.body.isSingle != null) {
            res.exercise.isSingle = req.body.isSingle;
        }
        if (req.body.isPreset != null) {
            res.exercise.isPreset = req.body.isPreset;
        }

        const updatedExercise = await res.exercise.save();
        res.json(updatedExercise);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Delete an exercise
router.delete('/:id', getExercise, async (req, res) => {
    try {
        await res.exercise.remove();
        res.json({ message: 'Deleted Exercise' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


