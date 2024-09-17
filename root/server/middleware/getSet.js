const { Set } = require('../models/set')

async function getSet(req, res, next) {
    let set;
    try {
        set = await Set.findById(req.params.id).populate('exerciseId').populate({
            path: 'exerciseId',
            populate: {
                path: 'userId',
                model: 'User'
            }
        })
        if (!set) {
            return res.status(404).json({ message: 'Cannot find set'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
    res.varSet = set
    next()
} 

module.exports = getSet