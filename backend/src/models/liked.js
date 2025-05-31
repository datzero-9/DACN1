const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Liked = new Schema({
    id_user: { type: String },
    id_house: { type: String },
    image: [],
    title: { type: String },
    price: { type: Number },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Liked', Liked);