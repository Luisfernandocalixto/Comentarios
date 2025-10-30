
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
import { validatePartialMessage } from "/js/verify/verify.js";

const getUsername = async () => {
    const username = localStorage.getItem('username');
    if (username) return username;


    const res = await fetch('https://fake-json-api.mock.beeceptor.com/users/1');
    const { username: randomUsername } = await res.json();


    localStorage.setItem('username', randomUsername);
    return randomUsername;
}

const socket = io({
    auth: {
        username: await getUsername(),
        serverOffset: 0
    }
});

const form = document.getElementById('form');
const button = document.querySelector('button[name="button"]');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const classes = document.querySelector('.isShow').classList;
const chat = document.querySelectorAll('.isShow');

button.addEventListener('click', function () {
    const result = classes.toggle('show');
    result ? Array.from(chat).forEach(e => e.classList.remove("isShow")) : Array.from(chat).forEach(e => e.classList.add("isShow"));
});

socket.on('chat message', (msg, serverOffset, username) => {
    const item = `
            <li>
             <p>${msg}</p> 
             <small>${username}</small> 
            </li>`;
    messages.insertAdjacentHTML('beforeend', item);
    socket.auth.serverOffset = serverOffset;
    // scroll to bottom of messages
    messages.scrollTop = messages.scrollHeight;
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const verify = validatePartialMessage({ msg: input.value });
    if (!verify.success) {
        return;
    }
    else {
        socket.emit('chat message', input.value);
        input.value = '';
    }


})

