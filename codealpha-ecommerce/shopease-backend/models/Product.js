const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  stock:        { type: Number, required: true, default: 0, min: 0 },
  image_emoji:  { type: String, default: '📦' },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  reviews_count:{ type: Number, default: 0 },
  is_active:    { type: Boolean, default: true },
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);