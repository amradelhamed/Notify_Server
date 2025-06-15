// Recall express.js and make app var
const express = require("express")
const app = express()
// Recall another modules of node.js
const cors = require("cors")
// Another modules
const { DB_Url, DB_Path, accepted_Urls } = require("./important")
// Another vars
const port = 5000

// Connect with DB
const mongoose = require("mongoose")
mongoose.connect(`${DB_Url}/${DB_Path}`)

// Use app.use function
app.use(cors({origin: accepted_Urls}))
app.use(express.json())

// Running all routes
require("./routes")(app)

app.listen(port, () => console.log(`This server runs on url ==> http://localhost:${port}`))