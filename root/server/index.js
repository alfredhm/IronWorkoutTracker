const winston = require('winston')
const express = require('express')
const app = express()
require('dotenv').config({ path: "./config.env" })

require('./startup/logging')()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/prod')(app)

const port = process.env.PORT || 5000
app.listen(port, () => winston.info(`Listening on port ${port}...`))

