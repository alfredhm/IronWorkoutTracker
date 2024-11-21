const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function () {
    const db = process.env.MONGO_URI || 'mongodb://localhost/tracker'; // Use environment variable or fallback to localhost
    mongoose
        .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => winston.info(`Connected to MongoDB at ${db}`))
        .catch((err) => {
            winston.error(`Failed to connect to MongoDB: ${err.message}`);
            process.exit(1); // Exit if the database connection fails
        });
};