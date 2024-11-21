const winston = require('winston')
require('winston-mongodb')

module.exports = function() {

    winston.exceptions.handle(
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    )

    process.on('uncaughtRejection', (ex) => {
        console.log('WE GOT AN UNHANDLED REJECTION')
        winston.error(ex.message, ex)
    }) 

    process.on('unhandledRejection', (ex) => {
        throw ex
    })

    winston.add(new winston.transports.File({ filename: 'logfile.log' }))
}