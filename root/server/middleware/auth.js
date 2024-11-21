const jwt = require('jsonwebtoken')
const config = require('config')

// Authenticates user
module.exports = function auth(req, res, next) {
    const token = req.cookies.authToken; // Get token from cookies
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.jetPrivateKey); // Verify token
        req.user = decoded
        next()
    }
    catch (ex) {
        res.status(400).send('Invalid token.')
    }

}
    