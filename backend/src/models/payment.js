const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
  id_user: { type: String, required: true },
  name: { type: String },
  image_url: { type: String },
  email: { type: String },
  total_price: { type: Number, required: true },  // tổng tiền
  amount: { type: Number, required: true },       // số lượt mua
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', Payment);
