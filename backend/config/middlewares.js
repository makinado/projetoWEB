const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(cors())
    app.use('/uploads', express.static('uploads'));

    app.use(function (error, req, res, next) {
        // Any request to this server will get here, and will send an HTTP
        // response with the error message 'woops'
        res.json({ message: error.message });
    });
}