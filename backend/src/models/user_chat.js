const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User_chat = new Schema({
    id_user: { type: String },
    id_cus: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('User_chat', User_chat);