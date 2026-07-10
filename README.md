# 🛒 E-Commerce Ordering & Payment System

A production-ready **E-Commerce Backend API** built with **Node.js, Express.js, TypeScript, MongoDB, Redis, and Docker**. This project demonstrates scalable backend architecture, Object-Oriented Programming (OOP), Strategy Design Pattern for multiple payment providers, DFS-based category traversal, Redis caching, and secure RESTful APIs.

---

## 🚀 Live API

**Base URL**

> https://backend-enginerr.vercel.app

### Authentication

| Endpoint | URL |
|----------|-----|
| Register | https://backend-enginerr.vercel.app/api/auth/register |
| Login | https://backend-enginerr.vercel.app/api/auth/login |
| Profile | https://backend-enginerr.vercel.app/api/auth/profile |

---

## 📌 Features

### 🔐 Authentication

- JWT Authentication
- User Registration
- User Login
- Profile Management
- Password Hashing (bcrypt)

### 📦 Product Management

- Create Product
- Update Product
- Delete Product
- Get Product
- Get All Products
- Pagination
- Search & Filtering

### 📂 Category Management

- Create Category
- Update Category
- Delete Category
- Category Tree
- DFS Traversal
- Redis Cache

### 🛍 Order Management

- Create Order
- Order History
- Order Status Update
- Automatic Stock Update

### 💳 Payment System

- Stripe Integration
- bKash Integration
- Strategy Design Pattern
- Payment Verification
- Payment History
- Webhook Support

### ⚡ Performance

- Redis Caching
- Optimized Queries
- Clean Service Layer
- Error Handling

### 🔒 Security

- Helmet
- CORS
- Rate Limiting
- JWT Authentication
- Password Encryption
- Environment Variables

---

# 🏗️ Tech Stack

| Technology | Version |
|------------|----------|
| Node.js | 22.x |
| Express.js | 4.x |
| TypeScript | 5.x |
| MongoDB | Latest |
| Mongoose | 7.x |
| Redis | Latest |
| JWT | 9.x |
| Stripe | Latest |
| Docker | Latest |

---

# 📂 Project Structure

```text
src
│
├── config
├── controllers
├── interfaces
├── middlewares
├── models
├── routes
├── services
│   ├── payment
│   │      ├── PaymentStrategy.ts
│   │      ├── StripeStrategy.ts
│   │      ├── BkashStrategy.ts
│   │      └── PaymentContext.ts
│   │
│   ├── category
│   └── order
│
├── utils
├── validations
├── app.ts
└── server.ts
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Sadman-Sakib748/your-repository-name.git
```

```bash
cd your-repository-name
```

## Install Dependencies

```bash
npm install
```

## Configure Environment

```bash
cp .env.example .env
```

Update the values inside `.env`.

## Start Development Server

```bash
npm run dev
```

## Build Project

```bash
npm run build
```

## Start Production

```bash
npm start
```

---

# 🐳 Docker

Run Docker

```bash
docker-compose up -d
```

Stop Docker

```bash
docker-compose down
```

---

# 📦 Environment Variables

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_USER=default

JWT_SECRET=your_secret
JWT_EXPIRE=7d

STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_CALLBACK_URL=http://localhost:5000/api/payments/webhook/bkash

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

---

# 📖 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/profile |
| PUT | /api/auth/profile |

---

## Products

| Method | Endpoint |
|---------|----------|
| POST | /api/products |
| GET | /api/products |
| GET | /api/products/:id |
| PUT | /api/products/:id |
| DELETE | /api/products/:id |

---

## Categories

| Method | Endpoint |
|---------|----------|
| POST | /api/categories |
| GET | /api/categories |
| GET | /api/categories/tree |
| GET | /api/categories/:id/recommendations |
| PUT | /api/categories/:id |
| DELETE | /api/categories/:id |

---

## Orders

| Method | Endpoint |
|---------|----------|
| POST | /api/orders |
| GET | /api/orders |
| GET | /api/orders/:id |
| PUT | /api/orders/:id/status |

---

## Payments

| Method | Endpoint |
|---------|----------|
| POST | /api/payments/initiate |
| POST | /api/payments/webhook/:provider |
| GET | /api/payments/verify/:provider/:transactionId |
| GET | /api/payments/history |

---

# 💳 Payment Providers

## Stripe

- Payment Intent
- Secure Checkout
- Webhooks
- Payment Verification

## bKash

- Tokenized Checkout
- Callback Support
- Sandbox Integration
- Payment Verification

The payment module follows the **Strategy Design Pattern**, allowing seamless switching between payment providers.

---

# 🌳 DFS Category Tree

```text
Electronics
├── Laptop
│   ├── Gaming
│   └── Business
└── Mobile
    ├── Android
    └── iPhone
```

DFS is used for:

- Category Tree Generation
- Child Category Traversal
- Product Recommendation
- Recursive Search

---

# ⚡ Redis Caching

Redis is used for:

- Category Tree Cache
- Product Recommendations
- Frequently Accessed Data
- Improved API Performance

---

# 🎯 Design Patterns

This project follows modern backend architecture with:

- Strategy Pattern
- Service Layer Pattern
- Dependency Injection Friendly Structure
- Repository-style Separation
- Object-Oriented Programming (OOP)

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Helmet
- CORS
- Rate Limiting
- Environment Variables
- Request Validation
- Secure Payment Webhooks

---

# 🧪 Testing

Run Unit Tests

```bash
npm test
```

Integration Tests

```bash
npm run test:integration
```

Coverage

```bash
npm run test:coverage
```

---

# 📈 Future Improvements

- Email Verification
- Refresh Token
- Wishlist
- Coupon System
- Inventory Dashboard
- ElasticSearch
- RabbitMQ
- Kubernetes Deployment

---

# 👨‍💻 Author

**Sadman Sakib**

Frontend & MERN Stack Developer

📧 Email: sadman.sakib34523@gmail.com

🌐 Live API  
https://backend-enginerr.vercel.app

🐙 GitHub  
https://github.com/Sadman-Sakib748

💼 LinkedIn  
https://linkedin.com/in/sadman-sakib-442804372

---

# 📄 License

This project was developed as part of the **Raco AI Backend Engineer Technical Assessment**.

Feel free to use this project for learning and portfolio purposes.