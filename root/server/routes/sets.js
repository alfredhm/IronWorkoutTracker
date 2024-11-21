const { Set, validate } = require('../models/set')
const getSet = require('../middleware/getSet')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

// Get all sets
router.get('/', asyncMiddleware(async (req, res) => {
    const sets = await Set.find().populate('exerciseId')
    res.json(sets)
}))

// Get sets by exercise ID
router.get('/exercise/:exerciseId', asyncMiddleware(async (req, res) => {
    const exerciseId = req.params.exerciseId
    const sets = await Set.find({ exerciseId: exerciseId })
    res.json(sets)
}))

// Get set by set ID
router.get('/:id', getSet, asyncMiddleware(async (req, res) => {
    res.json(res.varSet)
}))

// Post new set  
router.post('/', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message) 

    const set = new Set({
        exerciseId: req.body.exerciseId,
        userId: req.body.userId,
        sessionId: req?.body.sessionId,
        reps: req?.body.reps,
        weight: req?.body.weight,
        notes: req.body.notes,
        bodyWeight: req.body.bodyWeight,
        restTimeSec: req.body.restTimeSec,
        ghost: req?.body.ghost 
    }); 

    const newSet = await set.save()
    res.status(201).json(newSet) 
}))

// Put/update an existing set
router.put('/:id', getSet, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    
    if (req.body.exerciseId !== undefined) res.varSet.exerciseId = req.body.exerciseId;
    if (req.body.userId !== undefined) res.varSet.userId = req.body.userId;
    if (req.body.sessionId !== undefined) res.varSet.sessionId = req.body.sessionId;
    if (req.body.reps !== undefined) res.varSet.reps = req.body.reps;
    if (req.body.weight !== undefined) res.varSet.weight = req.body.weight;
    if (req.body.notes !== undefined) res.varSet.notes = req.body.notes;
    if (req.body.bodyWeight !== undefined) res.varSet.bodyWeight = req.body.bodyWeight;
    if (req.body.restTimeSec !== undefined) res.varSet.restTimeSec = req.body.restTimeSec;
    if (req.body.ghost !== undefined) res.varSet.ghost = req.body.ghost;

    const updatedSet = await res.varSet.save();
    res.json(updatedSet);
}))

// Delete an exercise
router.delete('/:id', getSet, asyncMiddleware(async (req, res) => {
    await res.varSet.deleteOne();
    res.json({ message: 'Deleted Exercise' });
}));

module.exports = router;
