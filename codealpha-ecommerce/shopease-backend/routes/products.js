const express  = require('express');
const Product  = require('../models/Product');
const Category = require('../models/Category');
const router   = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', sort = '', page = 1, limit = 12 } = req.query;

    const query = { is_active: true };

    if (search) query.$text = { $search: search };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    const sortMap = {
      'price-asc':  { price:  1 },
      'price-desc': { price: -1 },
      'rating':     { rating: -1 },
      'newest':     { createdAt: -1 },
    };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOpt)
      .skip(skip)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Products error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/all/categories
router.get('/all/categories', async (req, res) => {
  try {
    const cats = await Category.find();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product || !product.is_active)
      return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    console.error('Product detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

module.exports = router;