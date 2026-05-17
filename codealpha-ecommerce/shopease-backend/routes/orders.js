const express     = require('express');
const mongoose    = require('mongoose');
const Order       = require('../models/Order');
const { protect } = require('../middleware/auth');
const router      = express.Router();

// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, full_name, email, address, city, zip_code, country } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: 'Order must contain at least one item.' });

    if (!full_name || !email || !address || !city || !zip_code || !country)
      return res.status(400).json({ error: 'All shipping fields are required.' });

    // Build order items directly from what frontend sends
    // (no DB product lookup needed since products live in frontend)
    let subtotal = 0;
    const resolvedItems = items.map(item => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      return {
        product_id: item.product_id,   // store as plain string
        name:       item.name,
        emoji:      item.emoji || '',
        quantity:   item.quantity,
        price:      item.price,
      };
    });

    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax      = parseFloat((subtotal * 0.08).toFixed(2));
    const total    = parseFloat((subtotal + shipping + tax).toFixed(2));

    const order = await Order.create({
      user:      req.user._id,
      items:     resolvedItems,
      subtotal,
      shipping,
      tax,
      total,
      full_name,
      email,
      address,
      city,
      zip_code,
      country,
    });

    res.status(201).json({
      message:  'Order placed successfully!',
      order_id: order._id,
      total:    total.toFixed(2),
    });
  } catch (err) {
    console.error('Order error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders — user's order history
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

module.exports = router;