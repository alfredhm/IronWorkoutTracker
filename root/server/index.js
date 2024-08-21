const users = require('./routes/users')
const auth = require('./routes/auth')
const config = require('config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config({ path: "./config.env" })

mongoose.connect('mongodb://localhost/tracker')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error('Could not connect to MongoDB...', err))

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.')
  process.exit(1)
}

app.use(cors())
app.use(express.json())

app.use('/api/users', users)
app.use('/api/auth', auth)
app.get('/', (req, res) => (
    res.send('Hello World')
))

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}...`))

