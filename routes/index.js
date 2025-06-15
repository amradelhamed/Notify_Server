module.exports = (app) => {
    app.use("/user", require("./user_router"))
    app.use("/note", require("./note_router"))
    app.use("/sharedNote", require("./sharedNote_router"))
    app.use("/log", require("./log_router"))
}