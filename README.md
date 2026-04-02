# E-Commerce Node.js API

This is the backend API for the Makara-Nob E-Commerce platform. It is built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: Built with JWT and secure password hashing.
- **Product & Category Management**: Handle sophisticated catalogs including variants, categories, and brands.
- **Cart & Order System**: Complete checkout flow, order handling, and stock transactions.
- **Payment Integration**: Supports ABA PayWay payments.
- **Push Notifications**: Integrated with Firebase Cloud Messaging (FCM).
- **Admin & Public Facing APIs**: Separated route layers for administration vs public consumption.

## Prerequisites

Before setting up the project, ensure you meet the following requirements:

- [Node.js](https://nodejs.org/en/) (v18.x or higher)
- npm or yarn
- A [MongoDB](https://www.mongodb.com/) database (Local instance or MongoDB Atlas)
- [Firebase Admin](https://firebase.google.com/docs/admin/setup) credentials (for push notifications)
- ABA PayWay integration keys

## Step-by-step Setup

### 1. Clone the Repository

Download the source code or clone the repository to your local machine:

```bash
git clone <repository_url>
cd e-commerce-node-api
```

### 2. Install Dependencies

Install the necessary npm packages using:

```bash
npm install
```

### 3. Environment Variables Configuration

In the root of your project, create a `.env` file. Populate it with the keys required for the project to run. Start by copying the provided configuration template:

```env
PORT=5000
MONGO_URI=<YOUR_MONGO_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRATION=525600m

# ABA PayWay Configuration
ABA_PAYWAY_MERCHANT_ID=<YOUR_ABA_PAYWAY_MERCHANT_ID>
ABA_PAYWAY_API_KEY=<YOUR_ABA_PAYWAY_PUBLIC_KEY>

ABA_RSA_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
ABA_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

ABA_PAYWAY_API_URL=https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase
ABA_RETURN_URL=<YOUR_BACKEND_URL>/api/v1/orders/payway-webhook
ABA_SUCCESS_URL=<YOUR_BACKEND_URL>/api/v1/orders/payway-webhook
ABA_CANCEL_URL=<YOUR_BACKEND_URL>/api/v1/orders/payway-webhook

# Email Configuration
EMAIL_USER=<YOUR_EMAIL_USER>
EMAIL_PASS=<YOUR_EMAIL_PASS>

# Notification Firebase Configuration
FIREBASE_PROJECT_ID="<YOUR_FIREBASE_PROJECT_ID>"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="<YOUR_FIREBASE_CLIENT_EMAIL>"
```

### 4. Running the Application

You can run the API server using any of the following script commands available in `package.json`.

**Development Mode**

Starts the server with auto-reloading using `nodemon` and `ts-node`.

```bash
npm run dev
```

**Production Mode**

Builds the TypeScript code into the `dist/` directory and runs the compiled output.

```bash
npm run build
npm start
```

### 5. Seeding the Database

If you are setting up the project from scratch and require initial dummy data for testing the application:

```bash
npm run seed
```

*Note: Make sure your `MONGO_URI` is correctly set and running before running the seed command.*

## API Documentation

This project uses Swagger for API documentation. 
Once the server is running, you can access the interactive Swagger UI by navigating to:

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

You can also check if the server is healthy by navigating to `/api/health`.

## Directory Structure

- `src/controllers/` - Route handlers for the application.
- `src/models/` - Mongoose database schemas.
- `src/routes/` - Express routing layer.
- `src/config/` - Configuration setups like Swagger.
- `uploads/` - Default directory for handled file uploads.
- `dist/` - Compiled TypeScript code.
