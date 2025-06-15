// Recall main modules of node.js
const express = require("express")
const router = express.Router()
// Recall another modules
const { sample: choice, random } = require("lodash")
const User = require("../Models/User")
const Log = require("../Models/Log")



// ----------- Make routes -----------
// Get user 
router.get("/:_id", async (req, res) => {
    const { _id } = req.params

    const user = await User.findOne({_id}, {password: 0})

    if (!user) {
        return res.status(404).send("You should make a new account, because this user is not found!")
    }

    return res.status(200).send(user)
})

///////////////////////////////////////////////////////////
// Register route
router.post("/register", async (req, res) => {
    const { username, password } = req.body
    const { ip } = req
    const device = req.headers["sec-ch-ua-platform"].replaceAll('"',"")

    const logType = "register"

    const registers = await Log.find({ip, device, logType})

    if (registers && registers.length >= 3) {
        return res.status(404).send("You can't make any accounts for ever.")
    }

    if(!username || !password){
        return res.status(404).send("Please send all credintials!")
    }
    if (username.includes(" ")) {
        return res.status(404).send("Username should not include any spaces!")
    }
    if (password.length < 8) {
        return res.status(404).send("Password should include 8 chars or more!")
    }
    if (password.includes(" ")) {
        return res.status(404).send("Password should not include any spaces!")
    }
    if (!password.match(/[^\w\s]/g)) {
        return res.status(404).send("Password should include special char one or more!")
    }
    if (password == password.toUpperCase() || password == password.toLowerCase()) {
        return res.status(404).send("Password should include upper and lower char or more!")
    }

    let nums = [0,1,2,3,4,5,6,7,8,9]
    let passwordNumbers = 0
    for (let i = 0; i < password.length; i++) {
        if (nums.includes(Number(password[i]))) {
            passwordNumbers += 1
        }
    }

    if (passwordNumbers == 0) {
        return res.status(404).send("Password should include number or more.")
    }

    const searchUser = await User.findOne({username})
    if (searchUser) {
        return res.status(404).send("User is already registered!")
    }

    const cryptedPassword = User.cryptPassword(password)
    const user = new User({username, password: cryptedPassword})
    const savedUser = await user.save()    

    try {
        const register = new Log({ip, device, logType, userId: savedUser._id})
        await register.save()
    } catch (err) {
        return res.status(500).send("There is an error in server2!")
    }

    return res.status(200).send(savedUser._id)
})

///////////////////////////////////////////////////////////
// Login route
router.post("/login", async (req, res) => {
    const { username, password } = req.body
    const { ip } = req
    const device = req.headers["sec-ch-ua-platform"].replaceAll('"',"")

    const logType = "log-in"

    const d = new Date()
    const time = [d.getDate(), d.getMonth(), d.getFullYear()]

    const logins = await Log.find({ip, time, device, logType})

    if (logins && logins.length >= 3) {
        return res.status(404).send("Please, try to login later.")
    }

    if (!username || !password) {
        return res.status(404).send("Please send all credintials!")
    }

    const user = await User.findOne({username})

    if (!user) {
        return res.status(404).send("User not found! Please try to register.")
    } 

    const comparsonPassword = User.comparePassword(password, user.password)

    if (!comparsonPassword) {
        return res.status(404).send("Password is not correct!")
    }

    try {
        const login = new Log({ip, device, logType, userId: user._id})
        await login.save()
    } catch (err) {
        return res.status(500).send("There is an error in server!")
    }

    console.log("req")

    return res.status(200).send(user._id)
})

///////////////////////////////////////////////////////////
// Log-Out route
router.post("/log-out", async (req, res) => {
    const { ip } = req
    const { userId } = req.body
    const device = req.headers["sec-ch-ua-platform"].replaceAll('"',"")

    const logType = "log-out"

    try {
        const logOut = new Log({ip, device, logType, userId})
        await logOut.save()
    } catch (err) {
        return res.status(500).send("There is an error in server!")
    }

    return res.status(200).send("success")
})

///////////////////////////////////////////////////////////
// Generate password route
router.post("/generate-password", async (req, res) => {
    let char = () => choice(
        ["q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m"]
    )
    let special = () => choice(
        ["~","!","$","%","^","&","(",")","{","}","[","]",":",";","<",">",",",".","/","?","|"]
    )
    let number = () => random(10)
    let password = ""

    for (let i = 0; i < random(7)+8; i++) {
        password += choice(
            [
                choice(
                    [
                        char().toUpperCase(), 
                        char().toLowerCase()
                    ]
                ),
                special(),
                number().toString()
            ]
        )
    }

    if (password == password.toUpperCase()) password += char().toLowerCase()
    if (password == password.toLowerCase()) password += char().toUpperCase()
    if (!password.match(/[^\w\s]/g)) password += special()

    password += number().toString()

    return res.status(200).send(password)
})

///////////////////////////////////////////////////////////
// Edit info of user
router.post("/edit/:_id", async (req, res) => {
    const { _id } = req.params
    const { username, password, newPassword } = req.body

    if (!_id) {
        return res.status(404).send("Please, Login firstly. Then, You can edit your info.")
    }

    if (!username || username == "" || !password || password == "" || !newPassword || newPassword == "") {
        return res.status(404).send("Please, Send all credintials. Every field must to be defined!")
    }
    if (username.includes(" ")) {
        return res.status(404).send("Username should not include any spaces!")
    }
    if (newPassword.length < 8) {
        return res.status(404).send("New password should include 8 chars or more!")
    }
    if (newPassword.includes(" ")) {
        return res.status(404).send("New password should not include any spaces!")
    }
    if (!newPassword.match(/[^\w\s]/g)) {
        return res.status(404).send("New password should include special char one or more!")
    }
    if (newPassword == newPassword.toUpperCase() || newPassword == newPassword.toLowerCase()) {
        return res.status(404).send("New password should include upper and lower char or more!")
    }

    let nums = [0,1,2,3,4,5,6,7,8,9]
    let passwordNumbers = 0
    for (let i = 0; i < newPassword.length; i++) {
        if (nums.includes(Number(newPassword[i]))) {
            passwordNumbers += 1
        }
    }

    if (passwordNumbers == 0) {
        return res.status(404).send("Password should include number or more.")
    }

    const user = await User.findOne({_id})
    if (!user) {
        return res.status(404).send("Please, Login firstly. Then, You can edit your info.")
    }

    if (username != user.username) {
        const users = await User.find({username})
        if (users || users.length !== 0) {
            return res.status(404).send("This username is already used!")
        }
    }

    const comparedPassword = User.comparePassword(password, user.password)
    if (!comparedPassword) {
        return res.status(404).send("Password is not correct!")
    }

    const cryptedPassword = User.cryptPassword(newPassword)
    await User.updateOne({_id}, {username, password: cryptedPassword})

    return res.status(200).send("success")
})



module.exports = router