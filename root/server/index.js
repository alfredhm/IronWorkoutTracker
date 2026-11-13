const winston = require('winston')
const express = require('express')
const path = require('path')
const app = express()
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, '..', 'config')

require('./startup/logging')()
require('./startup/config')()
require('./startup/routes')(app)
require('./startup/prod')(app)

const port = process.env.PORT || 5000

async function start() {
    await require('./startup/db')()
    app.listen(port, () => winston.info(`Listening on port ${port}...`))
}

start().catch(err => {
    winston.error('Failed to start server', err)
    process.exit(1)
})
