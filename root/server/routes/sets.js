const { Set, validate } = require('../models/set')
const getSet = require('../middleware/getSet')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

// Get all sets
router.get('/', async (req, res) => {
    try {
        const sets = await Set.find().populate('exerciseId')
        res.json(sets)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Get sets by exercise ID
router.get('/exercise/:exerciseId', async (req, res) => {
    try {
        const exerciseId = req.params.exerciseId
        const sets = await Set.find({ exerciseId: exerciseId }).populate('exerciseId')
        if (sets.length === 0) {
            return res.status(404).json({ message: 'No sets found for this user'})
        }
        res.json(sets)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get set by set ID
router.get('/:id', getSet, async (req, res) => {
    res.json(res.varSet)
})

// Post new exercise
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const set = new Set({
        exerciseId: req.body.exerciseId,
        reps: req.body.reps,
        weight: req.body.weight,
        bodyWeight: req.body.bodyWeight,
        restTimeSec: req.body.restTimeSec
    });

    try {
        const newSet = await set.save()
        res.status(201).json(newSet)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    
})

// Put/update an existing set
router.put('/:id', getSet, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    
    if (req.body.exerciseId != null) {
        res.exercise.exerciseId = req.body.exerciseId;
    }
    if (req.body.reps != null) {
        res.exercise.reps = req.body.reps;
    }
    if (req.body.weight != null) {
        res.exercise.weight = req.body.weight;
    }
    if (req.body.bodyWeight != null) {
        res.exercise.bodyWeight = req.body.bodyWeight;
    }
    if (req.body.restTimeSec != null) {
        res.exercise.restTimeSec = req.body.restTimeSec;
    }

    try {
        const updatedSet = await res.set.save();
        res.json(updatedSet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Delete an exercise
router.delete('/:id', getSet, async (req, res) => {
    try {
        await res.set.remove();
        res.json({ message: 'Deleted Exercise' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
