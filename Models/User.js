// Recall needed modules of node.js
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Making user schema
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

// Making User model
const User = mongoose.model("user", userSchema)

// Another built-in functions of User model
User.cryptPassword = (p) => bcrypt.hashSync(p, bcrypt.genSaltSync(10))
User.comparePassword = (p, hashed) => bcrypt.compareSync(p, hashed)

module.exports = User