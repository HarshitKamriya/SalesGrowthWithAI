import { Product, ProductCategory, User, CustomerProfile, Order, Campaign } from '@ai-commerce/shared';
import { getMongoDb, getInMemoryStore, connectMongo } from '../config/db.js';

export const seededCategories: ProductCategory[] = [
  { categoryId: 'cat_laptops', name: 'Laptops', slug: 'laptops', description: 'High-performance laptops for ML, gaming, and development' },
  { categoryId: 'cat_phones', name: 'Smartphones', slug: 'smartphones', description: 'Flagship & budget mobile phones' },
  { categoryId: 'cat_monitors', name: 'Monitors', slug: 'monitors', description: 'Ultra-wide & high-refresh rate displays' },
  { categoryId: 'cat_keyboards', name: 'Keyboards', slug: 'keyboards', description: 'Mechanical & ergonomic keyboards' },
  { categoryId: 'cat_mice', name: 'Mice & Trackpads', slug: 'mice', description: 'Precision gaming & productivity mice' },
  { categoryId: 'cat_headphones', name: 'Headphones', slug: 'headphones', description: 'Noise-cancelling headsets & earbuds' },
  { categoryId: 'cat_hubs', name: 'USB-C Hubs & Docks', slug: 'hubs', description: 'Multi-port USB-C adapters & Thunderbolt docks' },
  { categoryId: 'cat_bags', name: 'Laptop Bags', slug: 'bags', description: 'Waterproof protective sleeves & backpacks' },
  { categoryId: 'cat_chargers', name: 'Chargers & Power Banks', slug: 'chargers', description: 'Fast GaN chargers & high capacity power banks' },
  { categoryId: 'cat_accessories', name: 'Accessories', slug: 'accessories', description: 'Stands, cables, and desk mats' }
];

export function generate100Products(): Product[] {
  const products: Product[] = [];
  
  // 1. Core Laptops (15 items)
  const laptopSpecs = [
    { name: 'MacBook Pro 16 M3 Max', price: 249999, tag: 'ml', specs: { RAM: '36GB', Storage: '1TB SSD', Chip: 'M3 Max' } },
    { name: 'Dell XPS 15 AI Edition', price: 189999, tag: 'ml', specs: { RAM: '32GB', Storage: '1TB SSD', GPU: 'NVIDIA RTX 4070' } },
    { name: 'Lenovo ThinkPad P1 Gen 6', price: 175000, tag: 'ml', specs: { RAM: '32GB', Storage: '1TB SSD', GPU: 'NVIDIA RTX 2000 Ada' } },
    { name: 'ASUS ROG Zephyrus G16', price: 164999, tag: 'gaming', specs: { RAM: '32GB', Storage: '1TB SSD', GPU: 'NVIDIA RTX 4080' } },
    { name: 'MacBook Air 15 M3', price: 134900, tag: 'productivity', specs: { RAM: '16GB', Storage: '512GB SSD', Chip: 'M3' } },
    { name: 'HP Omen 16 Gaming Laptop', price: 115000, tag: 'gaming', specs: { RAM: '16GB', Storage: '1TB SSD', GPU: 'NVIDIA RTX 4060' } },
    { name: 'Acer Predator Helios 16', price: 109999, tag: 'gaming', specs: { RAM: '16GB', Storage: '1TB SSD', GPU: 'NVIDIA RTX 4060' } },
    { name: 'ASUS TUF Gaming A15', price: 79999, tag: 'ml', specs: { RAM: '16GB', Storage: '512GB SSD', GPU: 'NVIDIA RTX 4050' } },
    { name: 'Lenovo Legion Slim 5', price: 78999, tag: 'ml', specs: { RAM: '16GB', Storage: '512GB SSD', GPU: 'NVIDIA RTX 4050' } },
    { name: 'MSI Cyborg 15 AI Laptop', price: 74999, tag: 'ml', specs: { RAM: '16GB', Storage: '512GB SSD', GPU: 'NVIDIA RTX 3050' } },
    { name: 'Dell G15 Gaming Laptop', price: 72999, tag: 'coding', specs: { RAM: '16GB', Storage: '512GB SSD', GPU: 'NVIDIA RTX 3050' } },
    { name: 'HP Victus 15 Core i5', price: 68999, tag: 'coding', specs: { RAM: '16GB', Storage: '512GB SSD', GPU: 'NVIDIA GTX 1650' } },
    { name: 'Acer Aspire 7 Developer Edition', price: 58999, tag: 'coding', specs: { RAM: '16GB', Storage: '512GB SSD', GPU: 'RTX 2050' } },
    { name: 'ASUS Vivobook 16', price: 54999, tag: 'general', specs: { RAM: '16GB', Storage: '512GB SSD', CPU: 'Core i5' } },
    { name: 'Lenovo IdeaPad Slim 3', price: 44999, tag: 'budget', specs: { RAM: '8GB', Storage: '512GB SSD', CPU: 'Core i3' } }
  ];

  laptopSpecs.forEach((l, i) => {
    products.push({
      productId: `prod_laptop_${i + 1}`,
      name: l.name,
      slug: l.name.toLowerCase().replace(/ /g, '-'),
      description: `High performance notebook optimized for ${l.tag}, heavy computations, deep learning and multi-tasking.`,
      category: 'Laptops',
      brand: l.name.split(' ')[0],
      price: l.price,
      inventory: 25 + i * 2,
      rating: 4.5 + (i % 5) * 0.1,
      tags: [l.tag, 'laptop', 'developer', 'hardware'],
      specifications: l.specs as unknown as Record<string, string>,
      compatibility: {
        compatibleProductIds: ['prod_hub_1', 'prod_bag_1', 'prod_mouse_1', 'prod_stand_1'],
        useCases: ['machine learning', 'data science', 'software engineering', 'gaming']
      },
      frequentlyBoughtWith: ['prod_hub_1', 'prod_bag_1'],
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // 2. USB-C Hubs & Docks (10 items)
  for (let i = 1; i <= 10; i++) {
    products.push({
      productId: `prod_hub_${i}`,
      name: i === 1 ? 'Anker 7-in-1 USB-C Hub Ultra 4K HDMI' : `Pro-Connect USB-C Hub Dock V${i}`,
      slug: `usb-c-hub-${i}`,
      description: 'Multi-port USB-C adapter with 4K 60Hz HDMI, 100W Power Delivery, SD Card Reader, and USB 3.2 10Gbps ports.',
      category: 'USB-C Hubs & Docks',
      brand: i % 2 === 0 ? 'Anker' : 'Belkin',
      price: 1299 + i * 250,
      inventory: 150,
      rating: 4.7,
      tags: ['hub', 'usb-c', 'dock', 'accessory', 'laptop-accessory'],
      specifications: { Ports: '7-in-1', HDMI: '4K@60Hz', PD: '100W' },
      compatibility: {
        compatibleProductIds: products.slice(0, 15).map(p => p.productId),
        useCases: ['laptop expansion', 'multi-monitor setup']
      },
      frequentlyBoughtWith: ['prod_laptop_8', 'prod_laptop_9'],
      imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 3. Laptop Bags & Sleeves (10 items)
  for (let i = 1; i <= 10; i++) {
    products.push({
      productId: `prod_bag_${i}`,
      name: i === 1 ? 'Peak Design Everyday Laptop Backpack 20L' : `ProProtect Waterproof Laptop Bag 15.6" V${i}`,
      slug: `laptop-bag-${i}`,
      description: 'Shockproof waterproof laptop backpack with cushioned compartments and anti-theft zipper lock.',
      category: 'Laptop Bags',
      brand: i % 2 === 0 ? 'Targus' : 'Peak Design',
      price: 1299 + i * 300,
      inventory: 120,
      rating: 4.8,
      tags: ['bag', 'backpack', 'travel', 'protection'],
      specifications: { Material: 'Nylon Waterproof', FitsSize: 'Up to 16 inch' },
      compatibility: {
        compatibleProductIds: products.slice(0, 15).map(p => p.productId),
        useCases: ['commuting', 'travel', 'protection']
      },
      frequentlyBoughtWith: ['prod_laptop_8', 'prod_hub_1'],
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 4. Keyboards & Mice (20 items)
  for (let i = 1; i <= 10; i++) {
    products.push({
      productId: `prod_keyboard_${i}`,
      name: `Keychron K2 Wireless Mechanical Keyboard V${i}`,
      slug: `mechanical-keyboard-${i}`,
      description: '75% Layout wireless mechanical keyboard with hot-swappable tactile switches and RGB backlighting.',
      category: 'Keyboards',
      brand: 'Keychron',
      price: 4999 + i * 400,
      inventory: 80,
      rating: 4.9,
      tags: ['keyboard', 'mechanical', 'wireless', 'coding'],
      specifications: { Switch: 'Brown Tactile', Connectivity: 'Bluetooth 5.1 / Type-C' },
      compatibility: { compatibleProductIds: [], useCases: ['coding', 'gaming'] },
      frequentlyBoughtWith: [`prod_mouse_${i}`],
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  for (let i = 1; i <= 10; i++) {
    products.push({
      productId: `prod_mouse_${i}`,
      name: i === 1 ? 'Logitech MX Master 3S Wireless Mouse' : `Logitech Precision Ergonomic Mouse V${i}`,
      slug: `ergonomic-mouse-${i}`,
      description: 'Ergonomic wireless mouse with 8K DPI sensor and quiet click switches.',
      category: 'Mice & Trackpads',
      brand: 'Logitech',
      price: 1499 + i * 500,
      inventory: 95,
      rating: 4.8,
      tags: ['mouse', 'ergonomic', 'productivity'],
      specifications: { DPI: '8000', Battery: '70 Days' },
      compatibility: { compatibleProductIds: [], useCases: ['productivity', 'design'] },
      frequentlyBoughtWith: ['prod_hub_1'],
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 5. Monitors & Headphones & Accessories (45 items)
  for (let i = 1; i <= 15; i++) {
    products.push({
      productId: `prod_monitor_${i}`,
      name: `Dell UltraSharp 27" 4K Monitor U2724D V${i}`,
      slug: `4k-monitor-${i}`,
      description: '27-inch 4K IPS display with 99% sRGB, Type-C 90W power delivery, and daisy-chaining support.',
      category: 'Monitors',
      brand: 'Dell',
      price: 28999 + i * 1500,
      inventory: 40,
      rating: 4.7,
      tags: ['monitor', '4k', 'display', 'workspace'],
      specifications: { Resolution: '3840x2160', RefreshRate: '75Hz' },
      compatibility: { compatibleProductIds: [], useCases: ['coding', 'design', 'video editing'] },
      frequentlyBoughtWith: ['prod_hub_1'],
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  for (let i = 1; i <= 15; i++) {
    products.push({
      productId: `prod_headphone_${i}`,
      name: i === 1 ? 'Sony WH-1000XM5 Noise Cancelling Headset' : `ProSound ANC Wireless Headphones V${i}`,
      slug: `anc-headphones-${i}`,
      description: 'Industry-leading noise canceling headphones with crystal clear call quality and 30-hour battery life.',
      category: 'Headphones',
      brand: i % 2 === 0 ? 'Sony' : 'Bose',
      price: 9999 + i * 1000,
      inventory: 60,
      rating: 4.8,
      tags: ['headphones', 'anc', 'audio', 'focus'],
      specifications: { ANC: 'Active Dual Processor', Battery: '30 hours' },
      compatibility: { compatibleProductIds: [], useCases: ['work', 'travel', 'focus'] },
      frequentlyBoughtWith: [],
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  for (let i = 1; i <= 15; i++) {
    products.push({
      productId: `prod_stand_${i}`,
      name: `Aluminum Ergonomic Laptop Stand V${i}`,
      slug: `laptop-stand-${i}`,
      description: 'Adjustable aluminum laptop riser with ventilation cutouts and anti-slip silicon pads.',
      category: 'Accessories',
      brand: 'Satechi',
      price: 1499 + i * 200,
      inventory: 200,
      rating: 4.6,
      tags: ['stand', 'desk', 'ergonomic'],
      specifications: { Material: 'CNC Aluminum', MaxWeight: '10kg' },
      compatibility: { compatibleProductIds: products.slice(0, 15).map(p => p.productId), useCases: ['desk setup'] },
      frequentlyBoughtWith: ['prod_hub_1'],
      imageUrl: 'https://images.unsplash.com/photo-1616440342238-01d7a86f7b0e?w=500',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return products;
}

export async function seedMongoDatabase() {
  const db = getMongoDb();
  const memoryStore = getInMemoryStore();
  const products = generate100Products();

  // Populate In-Memory Store
  seededCategories.forEach(c => memoryStore.categories.set(c.categoryId, c));
  products.forEach(p => memoryStore.products.set(p.productId, p));

  // Seed Users
  const defaultCustomer: User = {
    userId: 'cust_demo_101',
    email: 'demo.customer@example.com',
    name: 'Rahul Sharma',
    role: 'CUSTOMER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const defaultMerchant: User = {
    userId: 'merch_demo_1',
    email: 'merchant@razorpay.com',
    name: 'TechStore Electronics',
    role: 'MERCHANT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryStore.users.set(defaultCustomer.userId, defaultCustomer);
  memoryStore.users.set(defaultMerchant.userId, defaultMerchant);

  // Seed 1,000 Historical Orders for Merchant Growth Analytics
  console.log('Generating 1,000 synthetic historical order transactions...');
  for (let i = 1; i <= 1000; i++) {
    const isAiAssisted = i % 3 === 0; // ~33% AI assisted
    const boughtLaptop = i % 2 === 0;
    const boughtAccessory = isAiAssisted || i % 4 === 0;
    
    const items = [];
    let subtotal = 0;
    
    if (boughtLaptop) {
      const laptop = products[i % 15];
      items.push({ productId: laptop.productId, name: laptop.name, price: laptop.price, quantity: 1 });
      subtotal += laptop.price;
    }
    if (boughtAccessory) {
      const accessory = products[15 + (i % 10)]; // USB-C hub
      items.push({ productId: accessory.productId, name: accessory.name, price: accessory.price, quantity: 1 });
      subtotal += accessory.price;
    }
    if (items.length === 0) {
      const p = products[40 + (i % 20)];
      items.push({ productId: p.productId, name: p.name, price: p.price, quantity: 1 });
      subtotal += p.price;
    }

    const order: Order = {
      orderId: `order_hist_${i}`,
      customerId: `cust_${100 + (i % 200)}`,
      merchantId: 'merch_demo_1',
      items,
      subtotal,
      discount: isAiAssisted ? 500 : 0,
      totalAmount: subtotal - (isAiAssisted ? 500 : 0),
      paymentStatus: 'CAPTURED',
      orderStatus: 'COMPLETED',
      razorpayOrderId: `order_rzp_${i}`,
      razorpayPaymentId: `pay_rzp_${i}`,
      isAiAssisted,
      createdAt: new Date(Date.now() - (1000 - i) * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (1000 - i) * 3600 * 1000).toISOString()
    };
    memoryStore.orders.set(order.orderId, order);
  }

  // Seed Campaign
  const initialCampaign: Campaign = {
    campaignId: 'camp_101',
    merchantId: 'merch_demo_1',
    title: 'Laptop Purchaser USB-C Accessories Upsell',
    description: 'Targeted offer for 2,341 customers who purchased high-performance laptops without USB-C hubs.',
    targetSegment: 'Laptop Purchasers Without Accessories',
    targetProductId: 'prod_hub_1',
    offerDiscountPercentage: 10,
    budget: 50000,
    expectedConversionRate: 0.084,
    estimatedRevenue: 1280000,
    actualRevenue: 245000,
    status: 'PENDING_APPROVAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryStore.campaigns.set(initialCampaign.campaignId, initialCampaign);

  // If MongoDB is connected, bulk insert into actual collection
  if (db) {
    try {
      await db.collection('categories').deleteMany({});
      await db.collection('categories').insertMany(seededCategories as any[]);
      
      await db.collection('products').deleteMany({});
      await db.collection('products').insertMany(products as any[]);
      
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany([defaultCustomer, defaultMerchant] as any[]);
      
      await db.collection('orders').deleteMany({});
      await db.collection('orders').insertMany(Array.from(memoryStore.orders.values()));
      
      await db.collection('campaigns').deleteMany({});
      await db.collection('campaigns').insertMany([initialCampaign] as any[]);
      
      console.log('✅ MongoDB database seeded with 100 products & 1000 orders');
    } catch (err) {
      console.warn('⚠️ MongoDB bulk insert warning:', err);
    }
  } else {
    console.log('✅ In-memory database seeded with 100 products & 1000 orders');
  }
}

if (process.argv[1] && process.argv[1].includes('seedMongo')) {
  connectMongo().then(async () => {
    await seedMongoDatabase();
    process.exit(0);
  });
}

