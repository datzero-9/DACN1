const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Messages_chat = new Schema({
    id_user_chat: { type: String },
    from: { type: String },
    text: { type: String },
    images: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Messages_chat', Messages_chat);