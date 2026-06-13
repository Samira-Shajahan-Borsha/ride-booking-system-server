# Ride Booking System Backend

Ride Booking System Backend is a production-ready REST API for operating a ride-booking platform. It provides role-based access control, secure JWT authentication with refresh tokens, driver and rider workflows, admin tooling for user and driver management, and modular services ready for payments and analytics.

---

## 🎯 Project Overview

A production-ready backend API for a ride-booking platform, featuring a modular service-oriented structure and clear operational workflows. The server boots in `src/server.ts`, mounts API routes under `/api/v1` from `src/app/routes`, and performs environment validation from `src/app/config/env.ts`.

Key capabilities:

- Role-based access control with four roles (`SUPER_ADMIN`, `ADMIN`, `DRIVER`, `RIDER`) and status checks enforced by `checkAuth` middleware.
- Secure authentication using JWT access and refresh tokens, HTTP-only cookies, and helpers in `src/app/utils/jwt.ts` and `src/app/utils/setCookie.ts`.
- Seedable super-admin account via `src/app/utils/seedSuperAdmin.ts` for quick local setup.
- Driver workflows: availability toggling, vehicle info, earnings, and approval/suspension endpoints.
- Rider workflows: create/ cancel ride requests, view current and historical rides, and receive fare calculations and status updates.
- Ride lifecycle management: request → accept → pickup/in-transit → complete/cancel with transactional updates handled in services.
- Structured validation and error handling via `zod` validators (module-level `*.validation.ts` files) and `globalErrorHandler` / `notFound` middlewares.
- Pagination, filtering and sorting support through a shared `QueryBuilder` utility for list endpoints (users, drivers, rides).

The codebase follows a controller → service → model pattern (`src/app/modules/*`) so business logic is testable and separated from HTTP concerns. Routes are grouped by feature (`/users`, `/auth`, `/drivers`, `/rides`, `/stats`, `/contacts`) for clear API organization.

---

## 🌐 Live API & Repository

- **Server Live API:** [https://backend-ride-booking-system-ecru.vercel.app/](https://backend-ride-booking-system-ecru.vercel.app/)
- **Frontend Live:** [https://frontend-ride-booking-system.vercel.app/](https://frontend-ride-booking-system.vercel.app/)
- **Frontend Repository:** [https://github.com/Samira-Shajahan-Borsha/ride-booking-system-frontend](https://github.com/Samira-Shajahan-Borsha/ride-booking-system-frontend)

---

## 🔐 Test Credentials (for local/dev testing)

| Role        | Email           | Password  |
| ----------- | --------------- | --------- |
| Super Admin | super@gmail.com | 12345678  |
| Driver      | arif@gmail.com  | 1234@Arif |
| Rider       | ayon@gmail.com  | 1234@Ayon |

---

## 🔐 Authenticated & Protected Routes

All sensitive API endpoints are protected using JWT-based authentication and strict role-based authorization. The `checkAuth` middleware enforces the following security checks for every protected route:

- **JWT Authentication:**  
  Requires a valid JWT access token in the `Authorization` header. If the token is missing or invalid, access is denied.

- **User Existence:**  
  The user ID from the token is checked against the database. If the user does not exist, access is denied.

- **Account Status:**
    - Riders and Drivers with a status of `BLOCKED` are denied access.
    - Deleted users are denied access to all routes.
    - Drivers with a status of `SUSPEND` are denied access and prompted to contact support.

- **Role-Based Authorization:**  
  Only users whose role matches the allowed roles for the route can proceed. If the user's role is not permitted, access is denied.

- **Token Injection:**  
  On successful verification, the decoded token is attached to `req.user` for use in downstream controllers.

This layered approach ensures that only authenticated, active, and authorized users can access protected resources, maintaining the security and integrity of the system.

### 🗂️ Protected Route Tables

#### User Routes

| Endpoint       | Method | Roles Allowed                           | Description         |
| -------------- | ------ | --------------------------------------- | ------------------- |
| `/register`    | POST   | Public                                  | Register a new user |
| `/all-users`   | GET    | ADMIN, SUPER_ADMIN                      | View all users      |
| `/all-riders`  | GET    | ADMIN, SUPER_ADMIN                      | View all riders     |
| `/me`          | GET    | All (RIDER, DRIVER, ADMIN, SUPER_ADMIN) | View own profile    |
| `/block/:id`   | PATCH  | ADMIN, SUPER_ADMIN                      | Block a rider       |
| `/unblock/:id` | PATCH  | ADMIN, SUPER_ADMIN                      | Unblock a rider     |
| `/:id`         | GET    | ADMIN, SUPER_ADMIN                      | View user by ID     |
| `/:id`         | PATCH  | All (RIDER, DRIVER, ADMIN, SUPER_ADMIN) | Update user by ID   |

#### Auth Routes

| Endpoint           | Method | Roles Allowed                           | Description       |
| ------------------ | ------ | --------------------------------------- | ----------------- |
| `/login`           | POST   | Public                                  | User login        |
| `/refresh-token`   | POST   | Authenticated User                      | Refresh JWT token |
| `/logout`          | POST   | Public                                  | User logout       |
| `/change-password` | POST   | All (RIDER, DRIVER, ADMIN, SUPER_ADMIN) | Change password   |

#### Ride Routes

| Endpoint        | Method | Roles Allowed      | Description        |
| --------------- | ------ | ------------------ | ------------------ |
| `/request`      | POST   | RIDER              | Request a new ride |
| `/all-rides`    | GET    | ADMIN, SUPER_ADMIN | View all rides     |
| `/me`           | GET    | RIDER, DRIVER      | View own rides     |
| `/accept/:id`   | PATCH  | DRIVER             | Accept a ride      |
| `/status/:id`   | PATCH  | DRIVER             | Update ride status |
| `/complete/:id` | PATCH  | DRIVER             | Complete a ride    |
| `/cancel/:id`   | PATCH  | RIDER, DRIVER      | Cancel a ride      |
| `/:id`          | GET    | ADMIN, SUPER_ADMIN | View ride by ID    |

#### Driver Routes

| Endpoint                | Method | Roles Allowed      | Description                  |
| ----------------------- | ------ | ------------------ | ---------------------------- |
| `/all-drivers`          | GET    | ADMIN, SUPER_ADMIN | View all drivers             |
| `/me`                   | GET    | DRIVER             | View own driver profile      |
| `/earnings`             | GET    | DRIVER             | View own earnings            |
| `/approve/:id`          | PATCH  | ADMIN, SUPER_ADMIN | Approve a driver             |
| `/suspend/:id`          | PATCH  | ADMIN, SUPER_ADMIN | Suspend a driver             |
| `/vehicle`              | PATCH  | DRIVER             | Update vehicle information   |
| `/available-status/:id` | POST   | DRIVER             | Update online/offline status |
| `/:id`                  | GET    | ADMIN, SUPER_ADMIN | View driver by ID            |

#### Stats Routes

| Endpoint     | Method | Roles Allowed      | Description                         |
| ------------ | ------ | ------------------ | ----------------------------------- |
| `/user`      | GET    | ADMIN, SUPER_ADMIN | View user statistics                |
| `/driver`    | GET    | ADMIN, SUPER_ADMIN | View driver statistics              |
| `/ride`      | GET    | ADMIN, SUPER_ADMIN | View ride statistics                |
| `/driver/me` | GET    | DRIVER             | View own driver earnings statistics |

#### Contact Routes

| Endpoint   | Method | Roles Allowed | Description              |
| ---------- | ------ | ------------- | ------------------------ |
| `/message` | POST   | Public        | Submit a contact message |

---

## 🔑 Auth Logic

The authentication logic ensures secure access to the system using JWT tokens and enforces password security and account status checks.

### 1. User Login

- **Who:** All users (Rider, Driver, Admin, Super Admin)
- **How:**
    - Users log in with email and password.
    - Passwords are securely hashed and compared using bcrypt.
    - On successful login, access and refresh tokens are generated and set as HTTP-only cookies.
    - Blocked, suspended, or deleted users are denied access.

### 2. Token Refresh

- **Who:** All users
- **How:**
    - Users can refresh their access token using a valid refresh token (from cookies).
    - The system verifies the refresh token and user status before issuing a new access token.

### 3. Logout

- **Who:** All users
- **How:**
    - Users can log out, which clears the access and refresh tokens from cookies.

### 4. Change Password

- **Who:** All authenticated users
- **How:**
    - Users provide their old and new passwords.
    - The system verifies the old password and updates it with a securely hashed new password.

---

## 👤 User Logic

The user management logic handles registration, profile management, and user status, ensuring only authorized actions are allowed for each role.

### 1. Registration

- **Who:** All users (public endpoint)
- **How:**
    - Users register with required fields (name, email, password, role).
    - Passwords are hashed before storage.
    - For drivers, a linked driver profile is created with pending approval status.

### 2. Profile Retrieval

- **Who:** All authenticated users
- **How:**
    - Users can retrieve their own profile via a protected endpoint.
    - Admins and Super Admins can view any user’s profile.

### 3. User Listing

- **Who:** Admins, Super Admins
- **How:**
    - Admins can view all users with filtering, searching, sorting, and pagination.

### 4. User Update

- **Who:** All authenticated users (with restrictions)
- **How:**
    - Users can update their own profile.
    - Only Admins and Super Admins can update roles or status fields.
    - Drivers and Riders cannot update their own role, email or status, nor update other users.

---

## 🚗 Ride Logic Overview

The ride management logic is central to the platform, ensuring secure, fair, and efficient handling of ride requests, assignments, status updates, and history. Below is a breakdown of how ride operations are handled in the system:

### 1. Ride Request

- **Who:** Riders
- **How:**
    - Riders submit a ride request with pickup and destination addresses, and distance.
    - The system checks if the rider already has an active ride (`REQUESTED`, `ACCEPTED`, `PICKED_UP`, or `IN_TRANSIT`). If so, new requests are blocked.
    - Fare is calculated based on distance and a base rate.
    - Ride is created with status `REQUESTED` and timestamps the request.

### 2. Ride Acceptance

- **Who:** Drivers
- **How:**
    - Drivers can view and accept pending ride requests if:
        - They are approved and not suspended.
        - They do not have another active ride.
        - They are marked as `ONLINE`.
    - Upon acceptance:
        - Ride status updates to `ACCEPTED`.
        - Driver’s `currentRide` is set.
        - Acceptance is handled in a transaction for data consistency.

### 3. Ride Status Updates

- **Who:** Assigned Driver (and optionally Admin)
- **How:**
    - Drivers update ride status as the trip progresses:
        - `PICKED_UP` → `IN_TRANSIT` → `COMPLETED`
    - Each status change records a timestamp.
    - Only the assigned driver can update their ride’s status.

### 4. Ride Completion

- **Who:** Assigned Driver
- **How:**
    - On completion, status is set to `COMPLETED` and completion time is logged.
    - Driver’s earnings are updated.
    - Driver’s `currentRide` is cleared, allowing new ride acceptance.

### 5. Ride Cancellation

- **Who:** Rider (before acceptance), Driver (after acceptance)
- **How:**
    - Riders can cancel only before a driver accepts.
    - Drivers can cancel after acceptance.
    - On cancellation:
        - Status is set to `CANCELED`.
        - The canceling party is recorded.
        - Driver’s `currentRide` is cleared if applicable.

### 6. Ride Retrieval & History

- **Riders:** Can view all their rides and ride history.
- **Drivers:** Can view their rides and earnings.
- **Admins:** Can view, filter, and manage all rides.

### 7. Business Rules & Validations

- Only one active ride per rider or driver at a time.
- Suspended/unapproved drivers cannot accept or update rides.

---

## 👨‍✈️ Driver Logic

The driver management logic ensures that only eligible, approved, and available drivers can participate in the ride booking process, while also providing admins with tools to manage the driver pool.

### 1. Driver Registration & Profile

- **Who:** Drivers
- **How:**
    - Drivers are linked to a user account and have additional fields such as approval status, availability, total earnings, vehicle info and rating.
    - Drivers can view their own profile and earnings via protected endpoints.

### 2. Approval & Suspension

- **Who:** Admins
- **How:**
    - Admins can approve or suspend drivers through dedicated endpoints.
    - Only approved drivers can accept rides or update their availability.
    - Suspended or pending drivers are restricted from ride operations.

### 3. Availability Management

- **Who:** Drivers
- **How:**
    - Drivers can set their status to `ONLINE` or `OFFLINE` using a protected endpoint.
    - Only drivers marked as `APPROVED` and available status is `ONLINE` are eligible to accept ride requests.
    - Attempting to set the same status repeatedly is prevented with clear feedback.

### 4. Ride Assignment & Restrictions

- **Who:** Drivers
- **How:**
    - Each driver can have only one active ride at a time (`currentRide`).
    - Drivers cannot accept new rides if they are already on an active ride or if their status is not `ONLINE` and `APPROVED`.

### 5. Earnings & Ratings

- **Who:** Drivers (view), System (update)
- **How:**
    - Drivers’ earnings are updated automatically upon ride completion.
    - Drivers can view their total earnings via a protected endpoint.
    - Ratings can be stored and updated for each driver (if implemented).

### 6. Admin Controls

- **Who:** Admins
- **How:**
    - Admins can view all drivers, approve/suspend them, and access individual driver profiles.
    - Admins can block or unblock riders to manage account status and compliance.
    - All driver-related and rider management actions are protected by role-based authentication and authorization.

---

## 🛠️ Getting Started

1. Clone the repository

```bash
git clone <repo-url>
cd backend-ride-booking-system
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the project root (or copy `.env.example`) and set these variables:

```env
PORT=4000
DB_URL=mongodb://localhost:27017/ride-booking
NODE_ENV=development
BCRYPT_SALT_ROUND=10
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_REFRESH_TOKEN_EXPIRES=7d
SUPER_ADMIN_EMAIL=super@gmail.com
SUPER_ADMIN_PASSWORD=12345678
FRONTEND_URL=http://localhost:3000
```

Required env keys are validated at startup (see `src/app/config/env.ts`).

4. Run in development

```bash
npm run dev
```

5. Build & run in production

```bash
npm run build
NODE_ENV=production npm start
```

Notes:

- `npm run build` compiles TypeScript into `./dist`.
- `npm start` runs `node ./dist/server.js` so ensure production env variables and DB access are configured.

---

## 🧰 Technology Stack

Runtime & Framework

- 🟢 **Node.js:** Runtime for the server.
- 🚂 **Express:** Lightweight web framework for routing and middleware.

Language & Tooling

- 🔷 **TypeScript:** Static typing and better DX.
- 🧹 **ESLint (@eslint/js):** Linting and code quality.

Database & ORM

- 🍃 **MongoDB:** Primary document database.
- 📦 **Mongoose:** ODM for schemas and models.

Authentication & Security

- 🔑 **jsonwebtoken:** JWT access and refresh token handling.
- 🔒 **bcryptjs:** Password hashing and verification.
- 🍪 **cookie-parser:** HTTP cookie parsing for auth tokens.

Validation & Errors

- 🧪 **zod:** Input validation and parsing.
- 📫 **http-status-codes:** Standardized HTTP status codes.

Utilities & Networking

- 🌐 **cors:** Cross-origin resource sharing.
- 🔧 **dotenv:** Environment variable loader.

Dev & Deployment

- ⚡ **ts-node-dev:** Dev server with TypeScript auto-reload.
- 🧰 **Vercel:** Optional hosting/deployment platform for demos.
- 🧪 **Postman:** API testing collection provided.

If you want, I can also add a `.env.example` file to the repo with these keys.

---

## 📁 Project Folder Structure

```
backend-ride-booking-system/
├── src/
│   ├── app.ts                          # Express app initialization
│   ├── server.ts                       # Server startup & port configuration
│   ├── app/
│   │   ├── constant.ts                 # Application-wide constants
│   │   ├── config/
│   │   │   └── env.ts                  # Environment variable validation & loading
│   │   ├── errorHelpers/               # Centralized error handling utilities
│   │   │   ├── AppError.ts             # Custom error class
│   │   │   ├── handleCastError.ts      # MongoDB cast error handler
│   │   │   ├── handleValidationError.ts # Mongoose validation error handler
│   │   │   └── handleZodError.ts       # Zod validation error handler
│   │   ├── middlewares/                # Express middlewares
│   │   │   ├── checkAuth.ts            # JWT & role-based authorization middleware
│   │   │   ├── globalErrorHandler.ts   # Global error handling middleware
│   │   │   ├── notFound.ts             # 404 not found middleware
│   │   │   └── validateRequest.ts      # Request body validation middleware
│   │   ├── modules/                    # Feature modules (MVC pattern)
│   │   │   ├── auth/                   # Authentication module
│   │   │   │   ├── auth.controller.ts  # Login, logout, refresh token handlers
│   │   │   │   ├── auth.route.ts       # Auth route definitions
│   │   │   │   └── auth.service.ts     # Auth business logic
│   │   │   ├── user/                   # User management module
│   │   │   │   ├── user.controller.ts  # User CRUD handlers
│   │   │   │   ├── user.interface.ts   # TypeScript interfaces for user
│   │   │   │   ├── user.model.ts       # Mongoose user schema
│   │   │   │   ├── user.route.ts       # User route definitions
│   │   │   │   ├── user.service.ts     # User business logic
│   │   │   │   ├── user.validation.ts  # Zod validation schemas
│   │   │   │   └── user.constant.ts    # User-related constants
│   │   │   ├── driver/                 # Driver management module
│   │   │   │   ├── driver.controller.ts # Driver CRUD & approval handlers
│   │   │   │   ├── driver.interface.ts # TypeScript interfaces for driver
│   │   │   │   ├── driver.model.ts     # Mongoose driver schema
│   │   │   │   ├── driver.route.ts     # Driver route definitions
│   │   │   │   ├── driver.service.ts   # Driver business logic
│   │   │   │   └── driver.validation.ts # Zod validation schemas
│   │   │   ├── ride/                   # Ride management module
│   │   │   │   ├── ride.controller.ts  # Ride request, accept, status handlers
│   │   │   │   ├── ride.interface.ts   # TypeScript interfaces for ride
│   │   │   │   ├── ride.model.ts       # Mongoose ride schema
│   │   │   │   ├── ride.route.ts       # Ride route definitions
│   │   │   │   ├── ride.service.ts     # Ride business logic & fare calculation
│   │   │   │   ├── ride.validation.ts  # Zod validation schemas
│   │   │   │   └── ride.constant.ts    # Ride statuses & constants
│   │   │   ├── stats/                  # Statistics & analytics module
│   │   │   │   ├── stats.controller.ts # Stats aggregation handlers
│   │   │   │   ├── stats.route.ts      # Stats route definitions
│   │   │   │   └── stats.service.ts    # Stats calculation logic
│   │   │   └── contact/                # Contact/messaging module
│   │   │       ├── contact.controller.ts # Contact form handlers
│   │   │       ├── contact.interface.ts # TypeScript interfaces
│   │   │       ├── contact.model.ts    # Mongoose contact schema
│   │   │       ├── contact.route.ts    # Contact route definitions
│   │   │       └── contact.service.ts  # Contact message logic
│   │   ├── routes/
│   │   │   └── index.ts                # Central route aggregator
│   │   ├── types/
│   │   │   ├── error.type.ts           # Custom error types
│   │   │   └── express.d.ts            # Express type augmentation (req.user)
│   │   └── utils/                      # Shared utilities
│   │       ├── catchAsync.ts           # Async error wrapper for controllers
│   │       ├── jwt.ts                  # JWT token generation & verification
│   │       ├── QueryBuilder.ts         # Pagination, filtering, sorting utility
│   │       ├── seedSuperAdmin.ts       # Super admin account seeding
│   │       ├── sendResponse.ts         # Standardized response formatter
│   │       ├── setCookie.ts            # HTTP cookie setter for auth tokens
│   │       └── usertokens.ts           # User token helpers
├── .env                                # Environment variables (not in git)
├── .env.dev                            # Development environment variables
├── .env.example                        # Example environment template
├── .gitignore                          # Git ignore rules
├── .vercel/                            # Vercel deployment config
├── eslint.config.mjs                   # ESLint configuration
├── package.json                        # Dependencies & scripts
├── readme.md                           # This file
├── tsconfig.json                       # TypeScript configuration
├── vercel.json                         # Vercel deployment settings
└── Ride Booking System.postman_collection.json  # Postman API collection

```

### 🗂️ Folder Organization Breakdown

| Folder | Purpose |
| --- | --- |
| **src/** | Root source directory |
| **app/config/** | Configuration loaders (env validation) |
| **app/errorHelpers/** | Centralized error handling & formatting |
| **app/middlewares/** | Express middleware (auth, validation, error handling) |
| **app/modules/** | Feature modules (auth, user, driver, ride, stats, contact) |
| **app/routes/** | Route aggregation & mounting |
| **app/types/** | TypeScript type definitions & augmentations |
| **app/utils/** | Reusable helper functions (JWT, response, QueryBuilder, etc.) |

### 📋 Module Structure Pattern

Each feature module follows the **Controller → Service → Model** pattern:

- **`*.controller.ts`** – HTTP request handlers
- **`*.service.ts`** – Business logic & database operations
- **`*.model.ts`** – Mongoose schemas & models
- **`*.route.ts`** – Express route definitions
- **`*.validation.ts`** – Zod input validation schemas
- **`*.interface.ts`** – TypeScript type definitions

This architecture ensures separation of concerns, testability, and maintainability across all features.
