const express = require("express");
const logger = require('morgan');
const path = require("node:path");
require('dotenv').config();
const  pool = require("./config/db.js");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const { insertMessage, getMessages } = require("./data/message.js");
const {  validatePartialMessage } = require("./verify/verify.js");

const port = process.env.PORT

const app = express();
// static files
app.use(express.static(path.join(__dirname, '..', 'public')));

const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {}
})




io.on("connection", async (socket) => {
    console.log('a user has connected');

    socket.on("disconnect", () => {
        console.log("an user has disconnected");

    })

    socket.on("chat message", async (msg) => {
        let result
        const username = socket.handshake.auth.username ?? 'anonymous'
        try {
            const verify =  validatePartialMessage({ msg: msg})
            if (!verify.success) {
                
            return
            }
            else{
                result = await pool.query(insertMessage, [msg, username])
            }
        } catch (e) {
            console.error(e);
            return
        }
                

        io.emit("chat message", msg, result, username);
    })



    if (!socket.recovered) { // <- recuperar los mensajes sin conexion
        try {
            const result = await pool.query(getMessages,[socket.handshake.auth.serverOffset ?? 0])

            result.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user)
            })
        } catch (e) {
            console.error(e);
        }
    }
})
app.use(logger('dev'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
})