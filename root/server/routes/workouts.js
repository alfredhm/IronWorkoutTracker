const { Workout, validate } = require('../models/workout')
const { User } = require('../models/user')
const getWorkout = require('../middleware/getWorkout')
const express = require('express')
const { ExerciseTemplate, Exercise } = require('../models/exercise')
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

// Get template workouts
router.get('/template', async (req, res) => {
    try {
        const workouts = await Workout.find({ isTemplate: true }).populate('userId', 'name email').populate('exercises')
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
            return res.json([])
        }
        res.json(workouts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }  
})
 
// Get workout by workout ID
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
        if (req.body.userId !== undefined) res.workout.userId = req.body.userId;
        if (req.body.name !== undefined) res.workout.name = req.body.name;
        if (req.body.focusGroup !== undefined) res.workout.focusGroup = req.body.focusGroup;
        if (req.body.notes !== undefined) res.workout.notes = req.body.notes;
        if (req.body.exercises !== undefined) res.workout.exercises = req.body.exercises;
        if (req.body.isTemplate !== undefined) res.workout.isTemplate = req.body.isTemplate;
        
        const updatedWorkout = await res.workout.save();
        res.json(updatedWorkout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update the exercises array in a workout
router.put('/:id/exercises', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) return res.status(404).send('Workout not found.');

        // Add the new exercise to the exercises array
        workout.exercises.push(req.body.exerciseId);

        // Save the updated session
        await workout.save();
        res.send(workout);
    } catch (error) {
        res.status(500).send('Something went wrong.');
    }
});

const mongoose = require('mongoose');

// Delete an exercise in the exercises array in a workout
router.delete('/:workoutID/exercises', async (req, res) => {
    const { workoutID } = req.params;
    const { exerciseID } = req.body;

    try {
        // Verify if workout exists
        const workout = await Workout.findById(workoutID);
        if (!workout) {
            return res.status(404).json({ message: `Workout with ID ${workoutID} not found` });
        }

        // Ensure exerciseID is in the correct format
        const exerciseObjectId = new mongoose.Types.ObjectId(exerciseID);

        // Remove the exercise from the workout's exercises array
        await Workout.findByIdAndUpdate(
            workoutID,
            { $pull: { exercises: exerciseObjectId } }, // Ensure ObjectId conversion here
            { new: true }
        ); 

        // Delete the exercise document itself
        const deletedExercise = await Exercise.findByIdAndDelete(exerciseObjectId);
        if (!deletedExercise) {
            return res.status(404).json({ message: 'Exercise not found or already deleted' });
        }

        // Re-fetch the updated workout session with populated exercises
        const updatedWorkoutSession = await Workout.findById(workoutID).populate('exercises');
        res.status(200).json({ message: 'Exercise removed from workout session and deleted', updatedWorkoutSession });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Delete a workout
router.delete('/:id', getWorkout, async (req, res) => {
    try {
        // Delete all exercises in the workout.exercises array
        await Exercise.deleteMany({ _id: { $in: res.workout.exercises } });

        // Remove the workout itself
        await res.workout.deleteOne();
        res.json({ message: 'Deleted Workout and all associated exercises' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;