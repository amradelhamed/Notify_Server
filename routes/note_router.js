// Recall main modules of node.js
const express = require("express")
const router = express.Router()
// Recall another modules
const Note = require("../Models/Note")
const User = require("../Models/User")
const SharedNote = require("../Models/SharedNote")



// ----------- Make routes -----------
// Get note
router.get("/:_id/:user", async (req, res) => {
    const { _id, user } = req.params

    const note = await Note.findOne({_id}, {time: 0})

    if (!note) {
        return res.status(404).send("You should make a new note, because this note is not found!")
    }
    if (note.user != user) {
        return res.status(404).send("You are not allowed to see this note!")
    }

    return res.status(200).send(note)
})

// Get my notes
router.get("/:user", async (req, res) => {
    const { user } = req.params

    const notes = await Note.find({user}, {user: 0})

    return res.status(200).send(notes)
})

// Make note
router.post("/make", async (req, res) => {
    const {user, title, content} = req.body

    if (!user) {
        return res.status(404).send("Sorry, log in your account fristly. Then, you can make new note!")
    }
    if (!title || title == "" || !content || content == "") {
        return res.status(404).send("Please, send all credintials!")
    }

    const userFound = await User.findOne({_id: user})
    if (!userFound) {
        return res.status(404).send("Sorry, this account is not found. So, log-in or make new account!")
    }

    const n = new Note({user, title, content})
    const note = await n.save()

    return res.status(200).send(note._id)
})

// Update note
router.post("/update/:_id", async (req, res) => {
    const { title, content, user } = req.body
    const { _id } = req.params

    if (!user) {
        return res.status(404).send("Sorry, log in your account fristly. Then, you can make new note!")
    }
    if (!title || title == "" || !content || content == "") {
        return res.status(404).send("Please, send all credintials!")
    }

    const userFound = await User.findOne({_id: user})
    if (!userFound) {
        return res.status(404).send("Sorry, this account is not found. So, log-in or make new account!")
    }

    const noteFound = await Note.findOne({_id})
    if (!noteFound) {
        return res.status(404).send("Sorry, this note is not found. So, make new note or update another one!")
    }
    if (noteFound.user != user) {
        return res.status(404).send("Sorry, you are not allowed to update this note!")
    }
    if (noteFound.title == title && noteFound.content == content) {
        return res.status(404).send("Please, send new title or new content to update it!")
    }

    await Note.updateOne({_id}, {$set: {title, content}})
    const note = await Note.findOne({_id}, {time: 0})

    return res.status(200).send(note)
})

// Delete note
router.post("/delete/:_id", async (req, res) => {
    const { _id } = req.params
    const { user } = req.body

    if (!user) {
        return res.status(404).send("Sorry, log-in your account fristly. Then, you can delete this note!")
    }

    const userFound = await User.findOne({_id: user})
    if (!userFound) {
        return res.status(404).send("Sorry, this account is not found. So, log-in or make new account!")
    }

    const noteFound = await Note.findOne({_id})
    if (!noteFound) {
        return res.status(404).send("Sorry, this note is not found. So, make new note or delete another one!")
    }
    if (noteFound.user != user) {
        return res.status(404).send("Sorry, you are not allowed to delete this note!")
    }

    await Note.deleteOne({_id})
    await SharedNote.deleteMany({note: _id})

    return res.status(200).send("success")
})



module.exports = router