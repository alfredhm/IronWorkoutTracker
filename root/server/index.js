const winston = require('winston')
const express = require('express')
const app = express()

console.log("Environment:", process.env.NODE_ENV);
console.log("JWT Private Key:", process.env.jwtPrivateKey ? "Set" : "Not Set");

require('dotenv').config({ path: "./config.env" })

require('./startup/logging')()
require('./startup/db')()
require('./startup/config')()
require('./startup/routes')(app)
require('./startup/prod')(app)

const port = process.env.PORT || 5000
app.listen(port, () => winston.info(`Listening on port ${port}...`))

