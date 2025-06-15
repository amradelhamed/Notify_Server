// Recall needed modules of node.js
const mongoose = require("mongoose")

// Making user schema
const sharedNoteSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    code: {
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

// Making User model
const SharedNote = mongoose.model("sharedNote", sharedNoteSchema)



module.exports = SharedNote