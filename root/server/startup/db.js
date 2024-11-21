const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function () {
    const db = process.env.MONGODB_URI || 'mongodb://localhost/tracker'; // Use environment variable or fallback to localhost
    mongoose
        .connect(db)
        .then(() => winston.info(`Connected to MongoDB at ${db}`))
        .catch((err) => {
            winston.error(`Failed to connect to MongoDB: ${err.message}`);
            process.exit(1); // Exit if the database connection fails
        });
};