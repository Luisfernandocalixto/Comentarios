const express = require("express");
const logger = require('morgan');
const path = require("node:path");
require('dotenv').config();
const  pool = require("./config/db.js");
const { Server } = require("socket.io");
const { createServer } = require("node:http");

const port = process.env.PORT

const app = express();

app.use(express.static(path.join(__dirname, '../public')));

const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {}
})

// async function db() {
//     await pool.query(`
//        CREATE TABLE IF NOT EXISTS messages (
//            id INTEGER PRIMARY KEY AUTO_INCREMENT,
//            content TEXT,
//            user TEXT 
//        )
//        `);
// }

// db();



io.on("connection", async (socket) => {
    console.log('a user has connected');

    socket.on("disconnect", () => {
        console.log("an user has disconnected");

    })

    socket.on("chat message", async (msg) => {
        let result
        const username = socket.handshake.auth.username ?? 'anonymous'
        console.log({ username });
        try {
            if (!msg || msg.trim() === '') return
            result = await pool.query('INSERT INTO messages (content, user) VALUES (? , ?)', [msg, username])
        } catch (e) {
            console.error(e);
            return
        }

        io.emit("chat message", msg, result, username);
    })



    if (!socket.recovered) { // <- recuperar los mensajes sin conexion
        try {
            const result = await pool.query('SELECT id, content, user FROM messages WHERE id > ?',[socket.handshake.auth.serverOffset ?? 0])

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