# Ride Booking System Backend

A secure, scalable, and role-based backend API for a ride booking system, built with **Express.js** and **Mongoose**.

---

## 🎯 Project Overview

This backend system enables seamless ride booking and management for riders, drivers, and administrators. It is designed with security, modularity, and scalability in mind, ensuring robust authentication, role-based access, and a clean codebase for future growth.

-   **Riders** can request and cancel rides, and view their ride history.
-   **Drivers** can accept/reject ride requests, update ride statuses, manage their availability, and view earnings.
-   **Admins** can manage users, approve or suspend drivers, block/unblock accounts, and oversee all rides.

---

## 🔗 Links & API Testing

-   **Live Server:** [https://backend-ride-booking-system-ecru.vercel.app](https://https://backend-ride-booking-system-ecru.vercel.app/)

**Super Admin Test Credentials:**

```
Email: super@gmail.com
Password: 12345678
```

---

## 🔐 Authenticated & Protected Routes

All sensitive API endpoints are protected using JWT-based authentication and strict role-based authorization. The `checkAuth` middleware enforces the following security checks for every protected route:

-   **JWT Authentication:**  
    Requires a valid JWT access token in the `Authorization` header. If the token is missing or invalid, access is denied.

-   **User Existence:**  
    The user ID from the token is checked against the database. If the user does not exist, access is denied.

-   **Account Status:**

    -   Riders and Drivers with a status of `BLOCKED` are denied access.
    -   Deleted users are denied access to all routes.
    -   Drivers with a status of `SUSPEND` are denied access and prompted to contact support.

-   **Role-Based Authorization:**  
    Only users whose role matches the allowed roles for the route can proceed. If the user's role is not permitted, access is denied.

-   **Token Injection:**  
    On successful verification, the decoded token is attached to `req.user` for use in downstream controllers.

This layered approach ensures that only authenticated, active, and authorized users can access protected resources, maintaining the security and integrity of the system.

### 🗂️ Protected Route Tables

#### User Routes

| Endpoint     | Method | Roles Allowed                           | Description         |
| ------------ | ------ | --------------------------------------- | ------------------- |
| `/register`  | POST   | Public                                  | Register a new user |
| `/all-users` | GET    | ADMIN, SUPER_ADMIN                      | View all users      |
| `/me`        | GET    | All (RIDER, DRIVER, ADMIN, SUPER_ADMIN) | View own profile    |
| `/:id`       | GET    | ADMIN, SUPER_ADMIN                      | View user by ID     |
| `/:id`       | PATCH  | All (RIDER, DRIVER, ADMIN, SUPER_ADMIN) | Update user by ID   |

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
| `/available-status/:id` | POST   | DRIVER             | Update online/offline status |
| `/:id`                  | GET    | ADMIN, SUPER_ADMIN | View driver by ID            |

---

## 🔑 Auth Logic

The authentication logic ensures secure access to the system using JWT tokens and enforces password security and account status checks.

### 1. User Login

-   **Who:** All users (Rider, Driver, Admin, Super Admin)
-   **How:**
    -   Users log in with email and password.
    -   Passwords are securely hashed and compared using bcrypt.
    -   On successful login, access and refresh tokens are generated and set as HTTP-only cookies.
    -   Blocked, suspended, or deleted users are denied access.

### 2. Token Refresh

-   **Who:** All users
-   **How:**
    -   Users can refresh their access token using a valid refresh token (from cookies).
    -   The system verifies the refresh token and user status before issuing a new access token.

### 3. Logout

-   **Who:** All users
-   **How:**
    -   Users can log out, which clears the access and refresh tokens from cookies.

### 4. Change Password

-   **Who:** All authenticated users
-   **How:**
    -   Users provide their old and new passwords.
    -   The system verifies the old password and updates it with a securely hashed new password.

---

## 👤 User Logic

The user management logic handles registration, profile management, and user status, ensuring only authorized actions are allowed for each role.

### 1. Registration

-   **Who:** All users (public endpoint)
-   **How:**
    -   Users register with required fields (name, email, password, role).
    -   Passwords are hashed before storage.
    -   For drivers, a linked driver profile is created with pending approval status.

### 2. Profile Retrieval

-   **Who:** All authenticated users
-   **How:**
    -   Users can retrieve their own profile via a protected endpoint.
    -   Admins and Super Admins can view any user’s profile.

### 3. User Listing

-   **Who:** Admins, Super Admins
-   **How:**
    -   Admins can view all users with filtering, searching, sorting, and pagination.

### 4. User Update

-   **Who:** All authenticated users (with restrictions)
-   **How:**
    -   Users can update their own profile.
    -   Only Admins and Super Admins can update roles or status fields.
    -   Drivers and Riders cannot update their own role or status, nor update other users.

---

## 🚗 Ride Logic Overview

The ride management logic is central to the platform, ensuring secure, fair, and efficient handling of ride requests, assignments, status updates, and history. Below is a breakdown of how ride operations are handled in the system:

### 1. Ride Request

-   **Who:** Riders
-   **How:**
    -   Riders submit a ride request with pickup and destination addresses, and distance.
    -   The system checks if the rider already has an active ride (`REQUESTED`, `ACCEPTED`, `PICKED_UP`, or `IN_TRANSIT`). If so, new requests are blocked.
    -   Fare is calculated based on distance and a base rate.
    -   Ride is created with status `REQUESTED` and timestamps the request.

### 2. Ride Acceptance

-   **Who:** Drivers
-   **How:**
    -   Drivers can view and accept pending ride requests if:
        -   They are approved and not suspended.
        -   They do not have another active ride.
    -   Upon acceptance:
        -   Ride status updates to `ACCEPTED`.
        -   Driver’s `currentRide` is set.
        -   Acceptance is handled in a transaction for data consistency.

### 3. Ride Status Updates

-   **Who:** Assigned Driver (and optionally Admin)
-   **How:**
    -   Drivers update ride status as the trip progresses:
        -   `PICKED_UP` → `IN_TRANSIT` → `COMPLETED`
    -   Each status change records a timestamp.
    -   Only the assigned driver can update their ride’s status.

### 4. Ride Completion

-   **Who:** Assigned Driver
-   **How:**
    -   On completion, status is set to `COMPLETED` and completion time is logged.
    -   Driver’s earnings are updated.
    -   Driver’s `currentRide` is cleared, allowing new ride acceptance.

### 5. Ride Cancellation

-   **Who:** Rider (before acceptance), Driver (after acceptance)
-   **How:**
    -   Riders can cancel only before a driver accepts.
    -   Drivers can cancel after acceptance.
    -   On cancellation:
        -   Status is set to `CANCELED`.
        -   The canceling party is recorded.
        -   Driver’s `currentRide` is cleared if applicable.

### 6. Ride Retrieval & History

-   **Riders:** Can view all their rides and ride history.
-   **Drivers:** Can view their rides and earnings.
-   **Admins:** Can view, filter, and manage all rides.

### 7. Business Rules & Validations

-   Only one active ride per rider or driver at a time.
-   Suspended/unapproved drivers cannot accept or update rides.
-   All actions are protected by JWT authentication and role-based authorization.
-   Proper error handling and status codes for all edge cases.

This ride logic ensures a robust, scalable, and fair experience for all users, supporting the core business requirements of a modern ride booking platform.

---

## 👨‍✈️ Driver Logic

The driver management logic ensures that only eligible, approved, and available drivers can participate in the ride booking process, while also providing admins with tools to manage the driver pool.

### 1. Driver Registration & Profile

-   **Who:** Drivers
-   **How:**
    -   Drivers are linked to a user account and have additional fields such as approval status, availability, total earnings, vehicle info and rating.
    -   Drivers can view their own profile and earnings via protected endpoints.

### 2. Approval & Suspension

-   **Who:** Admins
-   **How:**
    -   Admins can approve or suspend drivers through dedicated endpoints.
    -   Only approved drivers can accept rides or update their availability.
    -   Suspended or pending drivers are restricted from ride operations.

### 3. Availability Management

-   **Who:** Drivers
-   **How:**
    -   Drivers can set their status to `ONLINE` or `OFFLINE` using a protected endpoint.
    -   Only drivers marked as `APPROVED` are eligible to accept ride requests.
    -   Attempting to set the same status repeatedly is prevented with clear feedback.

### 4. Ride Assignment & Restrictions

-   **Who:** Drivers
-   **How:**
    -   Each driver can have only one active ride at a time (`currentRide`).
    -   Drivers cannot accept new rides if they are already on an active ride or if their status is not `ONLINE` and `APPROVED`.

### 5. Earnings & Ratings

-   **Who:** Drivers (view), System (update)
-   **How:**
    -   Drivers’ earnings are updated automatically upon ride completion.
    -   Drivers can view their total earnings via a protected endpoint.
    -   Ratings can be stored and updated for each driver (if implemented).

### 6. Admin Controls

-   **Who:** Admins
-   **How:**
    -   Admins can view all drivers, approve/suspend them, and access individual driver profiles.
    -   All driver-related actions are protected by role-based authentication and authorization.

---

## 🗂️ Project Structure

```
src/
│
├── app/
│   ├── modules/
│   │   ├── auth/           # Authentication & authorization logic
│   │   ├── user/           # User management (rider, driver, admin)
│   │   ├── driver/         # Driver-specific logic
│   │   ├── ride/           # Ride management logic
│   ├── middlewares/        # Auth, role, error, and validation middlewares
│   ├── utils/
│   │   ├── catchAsync.ts       # Async error handling wrapper
│   │   ├── jwt.ts              # JWT token utilities
│   │   ├── QueryBuilder.ts     # Advanced query builder for filtering/sorting
│   │   ├── seedSuperAdmin.ts   # Utility for seeding super admin
│   │   ├── sendResponse.ts     # Standardized API response utility
│   │   ├── setCookie.ts        # Cookie management utility
│   │   └── usertokens.ts       # User token management helpers
│   ├── config/             # Environment and app configuration
│   ├── types/              # TypeScript types and interfaces
│   └── routes/             # API route definitions
│
├── server.ts               # Starts server, DB connection, seeds super admin, handles process events
└── app.ts                  # Initializes Express app, middleware, routes, error handling
```

---

## 🛠️ Getting Started

1. **Clone the repository**
2. **Install dependencies**
    ```sh
    npm install
    ```
3. **Configure environment variables**
    - Copy `.env.example` to `.env` and fill in the required values.
4. **Run the development server**
    ```sh
    npm run dev
    ```

---

## 🛠️ Technology Used

-   **Node.js** & **Express.js** — Backend runtime and web framework
-   **TypeScript** — Type-safe JavaScript
-   **MongoDB** & **Mongoose** — NoSQL database and ODM
-   **JWT** — Authentication and authorization
-   **Bcrypt** — Password hashing
-   **Zod** — Request validation
-   **ESLint** — Linting and code quality
-   **Vercel** — Deployment (if used)
-   **Postman** — API testing
