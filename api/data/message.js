const insertMessage = 'INSERT INTO messages (content, user) VALUES (? , ?)';
const getMessages = 'SELECT id, content, user FROM messages WHERE id > ?';

module.exports = {
    insertMessage,
    getMessages
};
