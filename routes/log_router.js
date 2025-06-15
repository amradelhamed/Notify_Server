// Recall main modules of node.js
const express = require("express")
const router = express.Router()
// Recall another modules
const User = require("../Models/User")
const Log = require("../Models/Log")



// ----------- Make routes -----------
// Get logs 
router.get("/:_id", async (req, res) => {
    const { _id } = req.params

    const user = await User.findOne({_id})
    if (!user) {
        return res.status(404).send("This user is not found!")
    }

    const logs = await Log.find({userId: _id})

    return res.status(200).send(logs)
})

// Delete logs
router.get("/delete/:_id", async (req, res) => {
    const { _id } = req.params

    const user = await User.findOne({_id})
    if (!user) {
        return res.status(404).send("This user is not found!")
    }

    await Log.deleteMany({userId: _id})

    return res.status(200).send("success")
})

// Delete log
router.get("/delete_log/:_id/:logID", async (req, res) => {
    const { _id, logID } = req.params

    const user = await User.findOne({_id})
    if (!user) {
        return res.status(404).send("This user is not found!")
    }

    await Log.deleteOne({userId: _id, _id: logID})

    return res.status(200).send("success")
})


module.exports = router