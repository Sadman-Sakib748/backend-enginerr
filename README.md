# 🛒 E-commerce Ordering & Payment System

A production-ready e-commerce backend built with **Node.js, Express.js, TypeScript, MongoDB, Redis, and Docker**. The project demonstrates clean architecture, Object-Oriented Programming (OOP), Strategy Pattern implementation for multiple payment providers, DFS-based category traversal, and Redis caching.

---

## 🚀 Features

### Authentication
- JWT Authentication
- User Registration
- User Login
- Profile Management
- Password Hashing using bcrypt

### Product Management
- Create Product (Admin)
- Update Product
- Delete Product
- Get Single Product
- Get All Products

### Category Management
- Create Category
- Update Category
- Delete Category
- Category Tree
- DFS Tree Traversal
- Redis Cache

### Order Management
- Create Order
- Order Status Update
- Automatic Stock Management
- Order History

### Payment System
- Stripe Payment
- bKash Payment
- Strategy Pattern
- Payment Verification
- Payment History
- Webhook Support

### Security
- Helmet
- CORS
- Rate Limiting
- Environment Variables
- JWT Authentication
- Password Encryption

### Other Features
- Docker Support
- TypeScript
- MongoDB (Mongoose)
- Redis
- Winston Logging
- Error Handling
- Request Validation

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

```
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

Clone the repository

```bash
git clone https://github.com/your-username/ecommerce-backend.git
```

Move into the project

```bash
cd ecommerce-backend
```

Install dependencies

```bash
npm install
```

Copy environment variables

```bash
cp .env.example .env
```

Update the values inside `.env`.

Start development server

```bash
npm run dev
```

Build project

```bash
npm run build
```

Run production build

```bash
npm start
```

---

# 🐳 Docker

Run with Docker Compose

```bash
docker-compose up -d
```

Stop containers

```bash
docker-compose down
```

---

# 📦 Environment Variables

Create a `.env` file and configure the following variables.

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_USER=default

JWT_SECRET=your_secret_key
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
- Webhooks
- Payment Verification
- Secure Checkout

## bKash

- Tokenized Checkout
- Payment Verification
- Callback Support
- Sandbox Integration

The project uses the **Strategy Design Pattern** to switch between multiple payment providers.

---

# 🌳 DFS Category Tree

The Category module supports hierarchical categories using a Depth First Search (DFS) traversal algorithm.

Example

```
Electronics
 ├── Laptop
 │      ├── Gaming
 │      └── Business
 └── Mobile
        ├── Android
        └── iPhone
```

DFS is used for:

- Category Tree
- Product Recommendation
- Child Category Search

---

# ⚡ Redis Caching

Redis is used for

- Category Tree Cache
- Frequently Requested Data
- Product Recommendations

This significantly reduces database queries and improves response time.

---

# 🎯 Design Patterns

This project follows Object-Oriented Programming principles.

Implemented Design Patterns

- Strategy Pattern
- Service Layer Pattern
- Repository-style Separation
- Dependency Injection Friendly Structure

---

# 🔒 Security

- JWT Authentication
- Helmet
- CORS
- Request Validation
- Password Hashing
- Environment Variables
- Secure Webhooks

---

# 🧪 Testing

Run tests

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
- Refresh Token Authentication
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

Email: sadman.sakib34523@gmail.com

GitHub: https://github.com/Sadman-Sakib748

LinkedIn: https://linkedin.com/in/sadman-sakib-442804372

---

# 📄 License

This project is developed as part of the **Raco AI Backend Engineer Technical Assessment**.
