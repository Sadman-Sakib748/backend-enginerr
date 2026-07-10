// seeders/index.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { OrderItem } from '../models/OrderItem';

dotenv.config();

// Import models


const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Payment.deleteMany({});
    console.log('✅ All data cleared\n');

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'Admin@123',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    });
    console.log(`✅ Admin user created: ${adminUser.email}\n`);

    // Create Regular User
    console.log('👤 Creating regular user...');
    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'User@123',
      name: 'Regular User',
      role: 'user',
      isActive: true,
    });
    console.log(`✅ Regular user created: ${regularUser.email}\n`);

    // Create Categories
    console.log('📂 Creating categories...');
    
    const electronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      isActive: true,
    });

    const smartphones = await Category.create({
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronics._id,
      isActive: true,
    });

    const laptops = await Category.create({
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptop computers and notebooks',
      parentId: electronics._id,
      isActive: true,
    });

    const accessories = await Category.create({
      name: 'Accessories',
      slug: 'accessories',
      description: 'Accessories and peripherals',
      parentId: electronics._id,
      isActive: true,
    });

    const clothing = await Category.create({
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      isActive: true,
    });

    console.log(`✅ ${await Category.countDocuments()} categories created\n`);

    // Create Products
    console.log('📦 Creating products...');

    const products = await Product.insertMany([
      {
        name: 'iPhone 14 Pro',
        sku: 'IP14PR',
        description: 'Latest iPhone with advanced features',
        price: 999.99,
        stock: 50,
        categoryId: smartphones._id,
        status: 'active',
        images: ['https://example.com/iphone14.jpg'],
        tags: ['apple', 'iphone', 'smartphone'],
      },
      {
        name: 'Samsung Galaxy S23',
        sku: 'SG23',
        description: 'Premium Android smartphone',
        price: 899.99,
        stock: 30,
        categoryId: smartphones._id,
        status: 'active',
        images: ['https://example.com/galaxys23.jpg'],
        tags: ['samsung', 'android', 'smartphone'],
      },
      {
        name: 'MacBook Pro 16"',
        sku: 'MBP16',
        description: 'Professional laptop with M2 chip',
        price: 2499.99,
        stock: 20,
        categoryId: laptops._id,
        status: 'active',
        images: ['https://example.com/macbookpro.jpg'],
        tags: ['apple', 'laptop', 'professional'],
      },
      {
        name: 'Dell XPS 15',
        sku: 'XPS15',
        description: 'High-performance Windows laptop',
        price: 1899.99,
        stock: 15,
        categoryId: laptops._id,
        status: 'active',
        images: ['https://example.com/dellxps.jpg'],
        tags: ['dell', 'windows', 'laptop'],
      },
      {
        name: 'AirPods Pro',
        sku: 'APP2',
        description: 'Premium wireless earbuds',
        price: 249.99,
        stock: 100,
        categoryId: accessories._id,
        status: 'active',
        images: ['https://example.com/airpods.jpg'],
        tags: ['apple', 'earbuds', 'wireless'],
      },
    ]);

    console.log(`✅ ${products.length} products created\n`);

    // Create Sample Order
    console.log('📝 Creating sample order...');

    const order = await Order.create({
      userId: regularUser._id,
      totalAmount: (products[0].price * 2) + products[2].price,
      status: 'paid',
      shippingAddress: {
        street: '123 Main Street',
        city: 'Dhaka',
        state: 'Dhaka',
        country: 'Bangladesh',
        zipCode: '1212',
      },
      notes: 'Please deliver before 5 PM',
    });

    await OrderItem.insertMany([
      {
        orderId: order._id,
        productId: products[0]._id,
        quantity: 2,
        price: products[0].price,
        subtotal: products[0].price * 2,
        productName: products[0].name,
        productSku: products[0].sku,
      },
      {
        orderId: order._id,
        productId: products[2]._id,
        quantity: 1,
        price: products[2].price,
        subtotal: products[2].price,
        productName: products[2].name,
        productSku: products[2].sku,
      },
    ]);

    console.log(`✅ Order created: ${order._id}\n`);

    // Create Sample Payment
    console.log('💳 Creating sample payment...');

    await Payment.create({
      orderId: order._id,
      provider: 'stripe',
      transactionId: `pi_${Date.now()}`,
      status: 'success',
      amount: order.totalAmount,
      currency: 'USD',
      rawResponse: {
        paymentIntentId: `pi_${Date.now()}`,
        status: 'succeeded',
        amount: order.totalAmount,
        currency: 'USD',
        created: new Date().toISOString(),
      },
      metadata: {
        seeded: true,
        timestamp: new Date(),
      },
    });

    console.log(`✅ Payment created\n`);

    // Summary
    console.log('='.repeat(50));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(50));
    console.log(`👤 Users: ${await User.countDocuments()}`);
    console.log(`📂 Categories: ${await Category.countDocuments()}`);
    console.log(`📦 Products: ${await Product.countDocuments()}`);
    console.log(`📝 Orders: ${await Order.countDocuments()}`);
    console.log(`📋 Order Items: ${await OrderItem.countDocuments()}`);
    console.log(`💳 Payments: ${await Payment.countDocuments()}`);
    console.log('='.repeat(50));
    console.log('\n✅ Database seeding completed successfully! 🎉\n');

    console.log('🔑 Login Credentials:');
    console.log('------------------------');
    console.log('Admin:');
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: Admin@123`);
    console.log('User:');
    console.log(`  Email: user@example.com`);
    console.log(`  Password: User@123`);
    console.log('------------------------\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();