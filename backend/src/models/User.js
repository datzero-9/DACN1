const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    id_user: { type: String },
    name: { type: String },
    image_url: { type: String },
    email: { type: String },
    checkCode: { type: Number, default: 0 },
    turn: { type: Number, default: 3 },  // Thêm trường turn với mặc định 3
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', User);
