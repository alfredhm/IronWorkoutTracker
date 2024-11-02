const { Set } = require('../models/set')

// Fetches a set
async function getSet(req, res, next) {
    let set;
    try {
        set = await Set.findById(req.params.id).exec()
        console.log(set)
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