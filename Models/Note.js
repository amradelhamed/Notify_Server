// Recall needed modules of node.js
const mongoose = require("mongoose")

// Making user schema
const noteSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
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
const Note = mongoose.model("note", noteSchema)



module.exports = Note