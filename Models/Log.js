// Recall needed modules of node.js
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Making login schema
const logSchema = mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    logType: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    time: {
        type: [Number],
        default: [ 
            new Date().getDate(), 
            new Date().getMonth(), 
            new Date().getFullYear()
        ]
    }
})

// Making Login model
const Log = mongoose.model("log", logSchema)

// Another built-in functions of Login model
Log.cryptIP = (ip) => bcrypt.hashSync(ip, bcrypt.genSaltSync(10))

module.exports = Log