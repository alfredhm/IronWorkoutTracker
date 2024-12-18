const { WorkoutSession, validate } = require('../models/workoutsession')
const { Workout } = require('../models/workout')
const { User } = require('../models/user')
const getWorkoutSession = require('../middleware/getWorkoutSession')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const mongoose = require('mongoose')
const express = require('express')
const { Exercise } = require('../models/exercise')
const { Set } = require('../models/set')
const router = express.Router()

// Get all workout sessions
router.get('/', asyncMiddleware(async (req, res) => {
    const workoutSessions = await WorkoutSession.find().populate('userId', 'name email').populate('exercises')
    res.json(workoutSessions)
}))

// Get workout session by user ID
router.get('/user/:userId', asyncMiddleware(async (req, res) => {
    const userId = req.params.userId
    const workoutSessions = await WorkoutSession.find({ userId: userId }).populate('userId', 'name email').populate('exercises')
    if (workoutSessions.length === 0) {
        return res.json([])
    }
    res.json(workoutSessions)
}))

// Get workout by exercise ID
router.get('/:id', getWorkoutSession, asyncMiddleware(async (req, res) => {
    res.json(res.workoutSession)
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
    if (req.body.workoutTemplate) {
        const workoutExists = await Workout.exists({ _id: req.body.workoutTemplate })
        if (!workoutExists) {
            return res.status(400).send('Workout does not exist in database')
        } 
    }

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
}))

// Put/update a workout
router.put('/:id', getWorkoutSession, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    if (req.body.userId !== undefined) res.workoutSession.userId = req.body.userId;
    if (req.body.name !== undefined) res.workoutSession.name = req.body.name;
    if (req.body.focusGroup !== undefined) res.workoutSession.focusGroup = req.body.focusGroup;
    if (req.body.workoutTemplate !== undefined) res.workoutSession.workoutTemplate = req.body.workoutTemplate;
    if (req.body.exercises !== undefined) res.workoutSession.exercises = req.body.exercises;
    if (req.body.date !== undefined) res.workoutSession.date = req.body.date;
    if (req.body.durationSec !== undefined) res.workoutSession.durationSec = req.body.durationSec;
    if (req.body.notes !== undefined) res.workoutSession.notes = req.body.notes;

    const updatedWorkout = await res.workoutSession.save();
    res.json(updatedWorkout);
}))

// Update the exercises array in a workout session
router.put('/:id/exercises', asyncMiddleware(async (req, res) => {
    const workoutSession = await WorkoutSession.findById(req.params.id);
    if (!workoutSession) return res.status(404).send('Workout session not found.');

    // Add the new exercise to the exercises array
    workoutSession.exercises.push(req.body.exerciseId);

    // Save the updated session
    await workoutSession.save();
    res.send(workoutSession);
}))

// Delete an exercise in the exercises array in a workout session
router.delete('/:workoutID/exercises', asyncMiddleware(async (req, res) => {
    const { workoutID } = req.params;
    const { exerciseID } = req.body;

    // Ensure exerciseID is in the correct format
    const exerciseObjectId = new mongoose.Types.ObjectId(exerciseID);

    // Remove the exercise from the workout's exercises array
    await WorkoutSession.findByIdAndUpdate(
        workoutID,
        { $pull: { exercises: exerciseObjectId } },
        { new: true } 
    );

    // Delete the exercise itself 
    await Exercise.findByIdAndDelete(exerciseObjectId);

    // Re-fetch the updated workout session
    const updatedWorkoutSession = await WorkoutSession.findById(workoutID).populate('exercises');
    res.status(200).json({ message: 'Exercise removed from workout session and deleted' });
}))

// Delete a workout
router.delete('/:id', getWorkoutSession, asyncMiddleware(async (req, res) => {
    // Delete all sets in each exercise's sets array
    for (const exerciseId of res.workoutSession.exercises) {
        const exercise = await Exercise.findById(exerciseId);
        if (exercise && exercise.sets && exercise.sets.length > 0) {
            await Set.deleteMany({ _id: { $in: exercise.sets } });
        }
    }

    // Delete all exercises in the workout.exercises array
    await Exercise.deleteMany({ _id: { $in: res.workoutSession.exercises } });

    // Remove the workout itself
    await res.workoutSession.deleteOne();
    res.json({ message: 'Deleted Workout Session, all associated exercises, and their sets' });
}))

module.exports = router;
