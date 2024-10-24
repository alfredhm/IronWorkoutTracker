const { WorkoutSession, validate } = require('../models/workoutsession')
const { Workout } = require('../models/workout')
const { User } = require('../models/user')
const getWorkoutSession = require('../middleware/getWorkoutSession')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

// Get all workout sessions
router.get('/', async (req, res) => {
    try {
        const workoutSessions = await WorkoutSession.find().populate('userId', 'name email').populate('exercises')
        res.json(workoutSessions)
    } catch (err) {
        res.status(500).json({ message: err.message})
    } 
})

// Get workout session by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const workoutSessions = await WorkoutSession.find({ userId: userId }).populate('userId', 'name email').populate('exercises')
        if (workoutSessions.length === 0) {
            return res.status(404).json({ message: 'No workout sessions found for this user'})
        }
        res.json(workoutSessions)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get workout by exercise ID
router.get('/:id', getWorkoutSession, async (req, res) => {
    res.json(res.workoutSession)
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
    if (req.body.workoutTemplate) {
        const workoutExists = await Workout.exists({ _id: req.body.workoutTemplate })
        if (!workoutExists) {
            return res.status(400).send('Workout does not exist in database')
        }
    }

    try {
        const workoutSession = new WorkoutSession({
            userId: req.body.userId,
            name: req.body.name,
            focusGroup: req.body.focusGroup,
            workoutTemplate: req.body.workoutTemplate,
            exercises: req.body.exercises,
            date: req.body.date,
            durationSec: req.body.durationSec,
            notes: req.body.notes || "",
        }); 

        const newWorkoutSession = await workoutSession.save()
        res.status(201).json(newWorkoutSession)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    
})

// Put/update a workout
router.put('/:id', getWorkoutSession, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    try {
        if (req.body.userId != null) {
            res.workoutSession.userId = req.body.userId;
        }
        if (req.body.name != null) {
            res.workoutSession.name = req.body.name;
        }
        if (req.body.focusGroup != null) {
            res.workoutSession.focusGroup = req.body.focusGroup;
        }
        if (req.body.workoutSessionTemplate != null) {
            res.workoutSession.workoutTemplate = req.body.workoutTemplate;
        }
        if (req.body.exercises != null) {
            res.workoutSession.exercises = req.body.exercises;
        }
        if (req.body.date != null) {
            res.workoutSession.date = req.body.date;
        }
        if (req.body.durationSec != null) {
            res.workoutSession.durationSec = req.body.durationSec;
        }
        if (req.body.notes != null) {
            res.workoutSession.notes = req.body.notes;
        }

        const updatedWorkout = await res.workoutSession.save();
        res.json(updatedWorkout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update the exercises array in a workout session
router.put('/:id/exercises', async (req, res) => {
    try {
        const workoutSession = await WorkoutSession.findById(req.params.id);
        if (!workoutSession) return res.status(404).send('Workout session not found.');

        // Add the new exercise to the exercises array
        workoutSession.exercises.push(req.body.exerciseId);

        // Save the updated session
        await workoutSession.save();
        res.send(workoutSession);
    } catch (error) {
        res.status(500).send('Something went wrong.');
    }
});

// Delete a workout
router.delete('/:id', getWorkoutSession, async (req, res) => {
    try {
        await res.workoutSession.deleteOne()
        res.json({ message: 'Deleted Workout Session' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;