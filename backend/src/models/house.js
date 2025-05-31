const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const House = new Schema({
  id_user: { type: String, required: true },
  demand: { type: String, required: true },
  category: { type: String, required: true }, 
  land_area: { type: String, required: true },
  price: { type: Number, required: true },
  price_unit: { type: String, required: true }, // ✅ thêm đơn vị giá

  bedroom: { type: Number, required: true },
  bathroom: { type: Number, required: true },
  floor: { type: Number, required: true },
  list_images: [{ type: String }], 

  address: { type: String, required: true }, 
  title: { type: String, required: true },
  title_normalized: { type: String, required: true }, 
  description: { type: String, required: true },

  phone_number: { type: String, required: true }, // ✅ thêm số điện thoại

  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('House', House);
