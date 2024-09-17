const { Workout, validate } = require('../models/workout')
const { User } = require('../models/user')
const getWorkout = require('../middleware/getWorkout')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

// Get all workouts
router.get('/', async (req, res) => {
    try {
        const workouts = await Workout.find().populate('userId', 'name email').populate('exercises')
        res.json(workouts)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Get workout by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const workouts = await Workout.find({ userId: userId }).populate('userId', 'name email').populate('exercises')
        if (workouts.length === 0) {
            return res.status(404).json({ message: 'No workouts found for this user'})
        }
        res.json(workouts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get workout by exercise ID
router.get('/:id', getWorkout, async (req, res) => {
    res.json(res.workout)
})

// Post new workout
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

        
    // Validate that user exists
    const userExists = await User.exists({ _id: req.body.userId })
    if (!userExists) {
        return res.status(400).send('User does not exist in database')
    }

    try {
        const workout = new Workout({
            userId: req.body.userId,
            name: req.body.name,
            focusGroup: req.body.focusGroup,
            notes: req.body.notes,
            durationSec: req.body.durationSec,
            exercises: req.body.exercises,
            isTemplate: req.body.isTemplate,
        });

        const newWorkout = await workout.save()
        res.status(201).json(newWorkout)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    
})

// Put/update a workout
router.put('/:id', getWorkout, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    try {
        if (req.body.userId != null) {
            res.workout.userId = req.body.userId;
        }
        if (req.body.name != null) {
            res.workout.name = req.body.name;
        }
        if (req.body.focusGroup != null) {
            res.workout.focusGroup = req.body.focusGroup;
        }
        if (req.body.notes != null) {
            res.workout.notes = req.body.notes;
        }
        if (req.body.durationSec != null) {
            res.workout.durationSec = req.body.durationSec;
        }
        if (req.body.exercises != null) {
            res.workout.exercises = req.body.exercises;
        }
        if (req.body.isTemplate != null) {
            res.workout.isTemplate = req.body.isTemplate;
        }

        const updatedWorkout = await res.workout.save();
        res.json(updatedWorkout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Delete a workout
router.delete('/:id', getWorkout, async (req, res) => {
    try {
        await res.workout.remove();
        res.json({ message: 'Deleted Workout' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;