require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product  = require('../models/Product');

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion',     slug: 'fashion'     },
  { name: 'Home',        slug: 'home'        },
  { name: 'Sports',      slug: 'sports'      },
  { name: 'Beauty',      slug: 'beauty'      },
];

const productData = [
  { name:'Wireless Noise-Cancelling Headphones', desc:'Premium sound quality with active noise cancellation. 30-hour battery life and foldable design.', price:129.99, stock:15, img:'🎧', cat:'electronics', rating:4.8, reviews:342 },
  { name:'Smart Watch Pro X',                    desc:'Track fitness, receive notifications, monitor health 24/7. Water-resistant with GPS and heart rate monitor.', price:249.99, stock:8, img:'⌚', cat:'electronics', rating:4.6, reviews:218 },
  { name:'Premium Leather Jacket',               desc:'Genuine leather slim-fit jacket. Multiple pockets and durable YKK zipper. Perfect for all seasons.', price:189.99, stock:20, img:'🧥', cat:'fashion', rating:4.7, reviews:156 },
  { name:'Running Shoes Ultra',                  desc:'Lightweight breathable running shoes with cushioned soles. Ideal for marathon training and everyday use.', price:94.99, stock:35, img:'👟', cat:'sports', rating:4.5, reviews:431 },
  { name:'Organic Face Serum',                   desc:'100% organic vitamin C serum. Reduces fine lines, brightens skin, deep hydration for all skin types.', price:49.99, stock:50, img:'🧴', cat:'beauty', rating:4.9, reviews:89  },
  { name:'Minimalist Desk Lamp',                 desc:'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port built-in.', price:39.99, stock:22, img:'💡', cat:'home', rating:4.4, reviews:175 },
  { name:'Bluetooth Speaker',                    desc:'360° surround sound with deep bass. IPX7 waterproof, 12-hour playtime.', price:79.99, stock:18, img:'🔊', cat:'electronics', rating:4.6, reviews:293 },
  { name:'Yoga Mat Premium',                     desc:'6mm thick non-slip eco-friendly TPE yoga mat. Extra wide with alignment lines for perfect posture.', price:34.99, stock:40, img:'🧘', cat:'sports', rating:4.7, reviews:512 },
  { name:'Scented Candle Set',                   desc:'Set of 4 hand-poured soy wax candles: lavender, vanilla, sandalwood, eucalyptus. 40-hour burn each.', price:28.99, stock:30, img:'🕯️', cat:'home', rating:4.8, reviews:67  },
  { name:'Sunglasses Classic',                   desc:'UV400 protection with polarized lenses. Lightweight titanium frame. Comes with hard case and cloth.', price:59.99, stock:25, img:'🕶️', cat:'fashion', rating:4.5, reviews:203 },
  { name:'Mechanical Keyboard',                  desc:'Tactile mechanical switches with RGB backlighting. Compact tenkeyless layout with N-key rollover.', price:114.99, stock:12, img:'⌨️', cat:'electronics', rating:4.7, reviews:388 },
  { name:'Protein Powder Vanilla',               desc:'25g protein per serving from whey isolate. No artificial sweeteners. Mixes easily with great taste.', price:44.99, stock:55, img:'🥛', cat:'sports', rating:4.6, reviews:674 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    await Category.deleteMany();
    await Product.deleteMany();

    const createdCats = await Category.insertMany(categories);
    console.log(`✅ ${createdCats.length} categories seeded`);

    const catMap = {};
    createdCats.forEach(c => { catMap[c.slug] = c._id; });

    const products = productData.map(p => ({
      name:          p.name,
      description:   p.desc,
      price:         p.price,
      stock:         p.stock,
      image_emoji:   p.img,
      category:      catMap[p.cat],
      rating:        p.rating,
      reviews_count: p.reviews,
    }));

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products seeded`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();