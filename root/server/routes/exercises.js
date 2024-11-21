const { Exercise, validate } = require('../models/exercise')
const { User } = require('../models/user')
const getExercise = require('../middleware/getExercise')
const mongoose = require('mongoose')
const express = require('express')
const { Workout } = require('../models/workout')
const { Set } = require('../models/set')
const asyncMiddleware = require('../middleware/asyncMiddleware')
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
router.get('/', asyncMiddleware(async (req, res) => {
    const exercises = await Exercise.find()
    res.json(exercises)
}))

// Get exercises by user ID
router.get('/user/:userId', asyncMiddleware(async (req, res) => {
    const userId = req.params.userId
    const exercises = await Exercise.find({ userId: userId })
    if (exercises.length === 0) {
        return res.json([])
    }
    res.json(exercises)
}))

// Get user made exercises by category
router.get('/category/:category/:userId', asyncMiddleware(async (req, res) => {
    let category = req.params.category;
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    let categories = exerciseKey[category];

    if (!categories || categories.length === 0) {
        return res.json([]);
    }

    let exercises = [];
    let userId = req.params.userId;

    for (let i = 0; i < categories.length; i++) {
        const currExercises = await Exercise.find({ category: categories[i], userId: userId, isUserPreset: true });
        exercises.push(...currExercises);
    }
    res.json(exercises);
}));

// Get preset exercises by category 
router.get('/preset/category/:category', asyncMiddleware(async (req, res) => {
    let category = req.params.category
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    let categories = exerciseKey[category]
    if (categories.length === 0 || !categories) {
        return res.json([])
    }

    let exercises = []

    for (let i = 0; i < categories.length; i++) {
        const currExercises = await Exercise.find({ category: categories[i], isPreset: true })
        exercises.push(...currExercises)
    }
    res.json(exercises)
}))

// Get exercise by exercise ID
router.get('/:id', getExercise, asyncMiddleware(async (req, res) => {
    res.json(res.exercise)
}))

// Post new exercise
router.post('/', asyncMiddleware(async (req, res) => {
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
        category: req.body.category,
        name: req.body.name,
        focusGroup: req.body.focusGroup,
        notes: req.body.notes,
        sets: req.body.sets,
        numOfSets: req.body.numOfSets,
        isTemplate: req.body.isTemplate,
        isSingle: req.body.isSingle,
        isPreset: req.body.isPreset,
        isUserPreset: req.body.isUserPreset
    });

    const newExercise = await exercise.save()
    res.status(201).json(newExercise)
}))

// Put/update an existing exercise
router.put('/:id', getExercise, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    if (req.body.userId !== undefined) res.exercise.userId = req.body.userId;
    if (req.body.workoutId !== undefined) res.exercise.workoutId = req.body.workoutId;
    if (req.body.category !== undefined) res.exercise.category = req.body.category;
    if (req.body.name !== undefined) res.exercise.name = req.body.name;
    if (req.body.focusGroup !== undefined) res.exercise.focusGroup = req.body.focusGroup;
    if (req.body.notes !== undefined) res.exercise.notes = req.body.notes;
    if (req.body.isTemplate !== undefined) res.exercise.isTemplate = req.body.isTemplate;
    if (req.body.isSingle !== undefined) res.exercise.isSingle = req.body.isSingle;
    if (req.body.isPreset !== undefined) res.exercise.isPreset = req.body.isPreset;
    if (req.body.isUserPreset !== undefined) res.exercise.isUserPreset = req.body.isUserPreset;
    if (req.body.sets !== undefined && Array.isArray(req.body.sets)) res.exercise.sets = req.body.sets;
    if (req.body.numOfSets !== undefined) res.exercise.numOfSets = req.body.numOfSets;

    const updatedExercise = await res.exercise.save();
    res.json(updatedExercise);
}))

// Delete an exercise
router.delete('/:id', getExercise, asyncMiddleware(async (req, res) => {
    // Delete all sets with a matching exerciseId
    await Set.deleteMany({ exerciseId: req.params.id });

    await res.exercise.deleteOne();
    res.json({ message: 'Deleted Exercise and associated sets' });
}));

module.exports = router;
