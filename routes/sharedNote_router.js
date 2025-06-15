// Recall main modules of node.js
const express = require("express")
const router = express.Router()
// Recall another modules
const SharedNote = require("../Models/SharedNote")
const Note = require("../Models/Note")
const User = require("../Models/User")
const { sample: choice, random } = require("lodash")


// ----------- Make routes -----------
// Get shared note
router.get("/public/:code", async (req, res) => {
    const { code } = req.params

    const d = new Date()
    const time =  [d.getDate(), d.getMonth(), d.getFullYear()]

    const publicNote = await SharedNote.findOne({code, time})
    if (!publicNote) {
        return res.status(404).send("Sorry, this link is not working!")
    }

    await Note.updateOne({_id: publicNote.note}, {$inc: {views: 0.5}})

    let username = ((await User.findOne({_id: publicNote.user})).username)

    let note = await Note.findOne({_id: publicNote.note}, {user: 0, _id: 0, time: 0, views: 0})

    const send = {note, username}

    return res.status(200).send(send)
})

// Get public notes
router.get("/public", async (req, res) => {
    const d = new Date()
    const time = [d.getDate(), d.getMonth(), d.getFullYear()]

    let send = []

    let notes = []
    let users = []

    const publicNotes = await SharedNote.find({time}, {user: 0, time: 0, _id: 0})
    for (let i = 0; i < publicNotes.length; i++) {
        let n = publicNotes[i]
        n.note = (await Note.findOne({_id: n.note}))
        let user = n.note.slice(n.note.indexOf("user: '")+7, -1).split("',")[0]
        users.push((await User.findOne({_id: user})).username)
    
        let noteArr = n.note.replace("{\n", "").replace("\n}", "").split(",\n  ")
    
        let note = {_id: "", title: "", content: "", views: 0, time: []}
    
        for (let i = 0; i < noteArr.length; i++) {
            if (noteArr[i].includes("_id:")) {
                note = {...note, _id: noteArr[i].replace("  _id: new ObjectId('", "").replace("')", "")}
            } else if (noteArr[i].includes("views:")) {
                note = {...note, [noteArr[i].split(": ")[0]]: Number(noteArr[i].split(": ")[1].replaceAll("'", ""))}
            } else if (noteArr[i].includes("time:")) {
                note = {...note, [noteArr[i].split(": ")[0]]: (noteArr[i].split(": ")[1].replace("[ ", "").replace(" ]", "").split(", ").map(e => Number(e)))}
            } else {
                note = {...note, [noteArr[i].split(": ")[0]]: (noteArr[i].split(": ")[1].replaceAll("'", ""))}
            }
        }

        notes.push(note)
    }

    for (let i = 0; i < notes.length; i++) {
        send.push({note: notes[i], code: publicNotes[i].code, username: users[i]})
    }

    return res.status(200).send(send)
})

// Make shared note
router.post("/make/:_id", async (req, res) => {
    const { _id } = req.params
    const { user } = req.body

    const note = await Note.findOne({_id})
    if (!note) {
        return res.status(404).send("This note is not found!")
    }

    const userFound = await User.findOne({_id: user})
    if (!userFound) {
        return res.status(404).send("Please, log-in your account. Then, share your note!")
    }

    if (note.user != user) {
        return res.status(404).send("Sorry, you are not allowed to make link to share this note!")
    }

    const d = new Date()
    const time =  [d.getDate(), d.getMonth(), d.getFullYear()]
    const sharedNote = await SharedNote.findOne({note: _id, user, time})

    if (sharedNote) {
        return res.status(404).send("You already shared this note!")
    }

    let code = ""
    let state = true

    while (state) {
        let char = () => choice(
            ["q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m"]
        )
        let number = () => random(10)
    
        for (let i = 0; i < random(20)+10; i++) {
            code += choice(
                [
                    char().toLowerCase(),
                    char().toUpperCase(),
                    number().toString()
                ]
            )
        }
    
        const sharedNotes = await SharedNote.find({code})
    
        if (sharedNotes.length == 0) {
            state = false
            const shared = new SharedNote({note: _id, user, code})
            const sharedNote = await shared.save()
            return res.status(200).send(sharedNote.code)
        }
    }
})

// Get my shared notes
router.get("/mySharedNotes/:user", async (req, res) => {
    const { user } = req.params
    const d = new Date()
    const time = [d.getDate(), d.getMonth(), d.getFullYear()]

    let send = []

    let notes = []

    const sharedNotes = await SharedNote.find({user, time}, {user: 0, time: 0, _id: 0})
    for (let i = 0; i < sharedNotes.length; i++) {
        let n = sharedNotes[i]
        n.note = (await Note.findOne({_id: n.note}))
    
        let noteArr = n.note.replace("{\n", "").replace("\n}", "").split(",\n  ")
    
        let note = {_id: "", title: "", content: "", views: 0, time: []}
    
        for (let i = 0; i < noteArr.length; i++) {
            if (noteArr[i].includes("_id:")) {
                note = {...note, _id: noteArr[i].replace("  _id: new ObjectId('", "").replace("')", "")}
            } else if (noteArr[i].includes("views:")) {
                note = {...note, [noteArr[i].split(": ")[0]]: Number(noteArr[i].split(": ")[1].replaceAll("'", ""))}
            } else if (noteArr[i].includes("time:")) {
                note = {...note, [noteArr[i].split(": ")[0]]: (noteArr[i].split(": ")[1].replace("[ ", "").replace(" ]", "").split(", ").map(e => Number(e)))}
            } else {
                note = {...note, [noteArr[i].split(": ")[0]]: (noteArr[i].split(": ")[1].replaceAll("'", ""))}
            }
        }

        notes.push(note)
    }

    for (let i = 0; i < notes.length; i++) {
        send.push({note: notes[i], code: sharedNotes[i].code})
    }

    return res.status(200).send(send)
})

// Cancle Sharing Note
router.get("/cancle/:note", async (req, res) => {
    const { note } = req.params

    await SharedNote.deleteMany({note})

    return res.status(200).send("success")
})



module.exports = router