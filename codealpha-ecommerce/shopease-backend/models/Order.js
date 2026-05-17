const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true },  // plain string ID
  name:       { type: String, required: true },
  emoji:      { type: String, default: '' },
  quantity:   { type: Number, required: true, min: 1 },
  price:      { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:     [orderItemSchema],
  status:    { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
  subtotal:  { type: Number, required: true },
  shipping:  { type: Number, default: 0 },
  tax:       { type: Number, default: 0 },
  total:     { type: Number, required: true },
  full_name: { type: String, required: true },
  email:     { type: String, required: true },
  address:   { type: String, required: true },
  city:      { type: String, required: true },
  zip_code:  { type: String, required: true },
  country:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);