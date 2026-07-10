# E-commerce Ordering & Payment System

A production-ready e-commerce backend system built with Node.js, Express, TypeScript, and MongoDB.

## Features

### Core Features
- ✅ User Registration & Authentication (JWT)
- ✅ Product Management (CRUD)
- ✅ Order Management with Stock Control
- ✅ Multi-provider Payment System (Stripe & bKash)
- ✅ Category Management with DFS + Caching
- ✅ Product Recommendations using DFS
- ✅ Webhook Integration for Payments

### Design Patterns & Algorithms
- ✅ Strategy Pattern for Payment Processing
- ✅ DFS for Category Tree Traversal
- ✅ Redis Caching for Category Tree
- ✅ OOP Principles throughout the application
- ✅ Deterministic Algorithms for Calculations

### Technical Features
- ✅ TypeScript for Type Safety
- ✅ MongoDB with Mongoose ODM
- ✅ Redis for Caching
- ✅ Docker & Docker Compose
- ✅ Comprehensive Error Handling
- ✅ Request Validation
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Support
- ✅ Structured Logging (Winston)

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Payment**: Stripe, bKash
- **Testing**: Jest, Supertest
- **Container**: Docker

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB >= 6
- Redis >= 7
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-backend
Install dependencies:

bash
npm install
Set up environment variables:

bash
cp .env.example .env
# Edit .env with your configuration
Build the project:

bash
npm run build
Start the development server:

bash
npm run dev
Seed the database:

bash
npm run seed
Docker Setup
Run with Docker Compose:

bash
docker-compose up -d
API Documentation
Authentication Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/profile	Get user profile
PUT	/api/auth/profile	Update user profile
Product Endpoints
Method	Endpoint	Description
POST	/api/products	Create product (Admin)
GET	/api/products	List products
GET	/api/products/:id	Get product details
PUT	/api/products/:id	Update product (Admin)
DELETE	/api/products/:id	Delete product (Admin)
Order Endpoints
Method	Endpoint	Description
POST	/api/orders	Create order
GET	/api/orders	List user orders
GET	/api/orders/:id	Get order details
PUT	/api/orders/:id/status	Update order status (Admin)
Payment Endpoints
Method	Endpoint	Description
POST	/api/payments/initiate	Initiate payment
POST	/api/payments/webhook/:provider	Payment webhook
GET	/api/payments/verify/:provider/:transactionId	Verify payment
GET	/api/payments/history	Get payment history
Category Endpoints
Method	Endpoint	Description
POST	/api/categories	Create category (Admin)
GET	/api/categories	List categories
GET	/api/categories/tree	Get category tree
GET	/api/categories/:id/recommendations	Get recommended products
PUT	/api/categories/:id	Update category (Admin)
DELETE	/api/categories/:id	Delete category (Admin)
Payment Integration
Stripe
Set up Stripe account

Get API keys from Stripe Dashboard

Configure webhook endpoint

Add webhook signing secret

bKash
Set up bKash merchant account

Get App Key, App Secret

Configure callback URL

Set up bKash API credentials

Testing
Run unit tests:

bash
npm test
Run integration tests:

bash
npm run test:integration
Run with coverage:

bash
npm run test:coverage