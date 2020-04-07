const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(cors())
    app.use('/uploads', express.static('uploads'));
}