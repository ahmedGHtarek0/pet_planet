# 🐾 Pet Planet — Backend API

A complete **pet-care + e-commerce management system** backend built with **Node.js + Express + TypeScript + MongoDB (Mongoose)**.

Pet Planet combines two systems in one API:

1. **🐕 Pet Clinic Management** — users, pets, treatments, vitals, and medical images.
2. **🛒 E-Commerce (Pet Shop)** — categories, products, user orders, order lifecycle, and payments via **InstaPay & Vodafone Cash**.

---

## 📦 Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Runtime      | Node.js, TypeScript (ts-node)                |
| Framework    | Express 5                                    |
| Database     | MongoDB via Mongoose 9                       |
| Cache/Session| Redis (stores refresh tokens)                |
| Images       | Cloudinary (pet / product photos)            |
| File upload  | Multer (in-memory)                           |
| Validation   | Zod                                          |
| Auth         | JSON Web Token (JWT) — access + refresh      |
| Dev runner   | Nodemon                                      |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables (`.env`)

Create a `.env` file inside `backend/` with the following keys:

```env
# MongoDB
mongodblocalhostlink=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/pet_planet

# Redis (Upstash / any Redis)
REdisusername=
redispassword=
redishost=

# JWT Secrets (separate for admin & user)
JWT_SECRETForaAdmin=super_secret_admin_key
JWT_SECRETForaUser=super_secret_user_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Run the server

```bash
npm run dev
```

Server starts on **`http://localhost:3001`**. You should see:

```
the pet_planet database connetced
the serevr is connect to the localhost http://localhost:3001
```

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── index.ts                     # App entry — connects DB, Redis, Cloudinary, mounts routers
│   ├── Database/                    # Mongoose models + Zod validators
│   │   ├── Auth.ts                  # User (IdForLogin, role: admin/user)
│   │   ├── User.ts                  # Pet (owner, species, health status)
│   │   ├── TreatmentHistory.ts      # Medical treatments per pet
│   │   ├── VitalThings.ts           # Daily vitals per pet
│   │   ├── Images.ts                # Pet image gallery (Cloudinary refs)
│   │   ├── category.ts              # Shop categories
│   │   ├── PerUnite.ts              # Products / items (unit or by-weight)
│   │   ├── Order.ts                 # Orders + lifecycle status
│   │   └── AdminPayment.ts          # Admin payment numbers (InstaPay / Vodafone)
│   ├── Services/                    # Business logic
│   │   ├── Auth.ts                  # Login + JWT token generation
│   │   ├── AdminE-commrce.ts        # Category CRUD helpers
│   │   └── OrderService.ts          # Order creation / cancellation / queries
│   ├── middlewares/
│   │   ├── Admin.ts                 # JWT guard (role: admin)
│   │   ├── User.ts                  # JWT guard (role: user)
│   │   ├── UploadMiddleware.ts      # Multer — pet images (≤3, 5MB, jpg/png/webp)
│   │   ├── imageforitems.ts         # Multer — product photos (≤3, jpg/png)
│   │   └── UploadToCloudinary.ts    # Cloudinary stream upload helper
│   └── Routes/
│       ├── Auth.ts                  # POST /Auth/login
│       ├── AdminRoutes.ts           # Admin + shop management + orders
│       ├── userroutes.ts            # User pets + product browsing/filters
│       └── OrderRoutes.ts           # User orders + payment info
└── package.json
```

---

## 🔐 Authentication & Roles

Two roles exist: **`admin`** and **`user`**. Both log in with only their **`IdForLogin`** (a simple ID string, no password).

| Login            | Route            | What you get                                  |
|------------------|------------------|-----------------------------------------------|
| Admin / User     | `POST /Auth/login` | `{ access, refresh, IdForLogin, role }`     |

- **Access token** → `Authorization: Bearer <access>` header on protected routes.
- **Refresh token** → stored in an HTTP-only cookie (`refresh`) and mirrored in Redis.

| Guard middleware | Who it identifies |
|------------------|-------------------|
| `adminmilldelwares` | only `role: 'admin'` users |
| `usermiddelwares`   | only `role: 'user'` users |

> User instances are created by the admin (`POST /Admin/addnewuser`), which also creates the linked pet record.

---

## 🐶 Pet Clinic Management (Admin)

All routes below require the **admin** JWT.

### Users & Pets

| Method | Route                        | Description                                   |
|--------|------------------------------|-----------------------------------------------|
| PUT    | `/Admin/updateIdForLogin`    | Update admin's own login ID                    |
| POST   | `/Admin/addnewuser`          | Create a user + their first pet                |
| POST   | `/Admin/addnewpet`           | Add another pet to an existing user            |
| PUT    | `/Admin/updatepet/:id`       | Update a pet                                  |
| DELETE | `/Admin/deletepet/:id`       | Delete a pet                                  |
| DELETE | `/Admin/deletepetanduser/:id`| Delete a pet **and** its owner user           |
| GET    | `/Admin/users`               | List all users                                |
| GET    | `/Admin/users/count`         | Total number of users                         |
| GET    | `/Admin/users/:id`           | User details + their pets (by `IdForLogin`)   |

### Treatments & Vitals

| Method | Route                    | Description                              |
|--------|--------------------------|------------------------------------------|
| POST   | `/Admin/addtreatment`    | Add a treatment to a pet                 |
| PUT    | `/Admin/updatetreatment/:id` | Update a treatment                    |
| DELETE | `/Admin/deletetreatment/:id` | Delete a treatment                     |
| POST   | `/Admin/addvital`        | Add a pet daily-vitals record            |
| PUT    | `/Admin/updatevital/:id` | Update a vitals record                   |
| DELETE | `/Admin/deletevital/:id` | Delete a vitals record                   |

### Pet Images & Analytics

| Method | Route                          | Description                                  |
|--------|--------------------------------|----------------------------------------------|
| POST   | `/Admin/addpetimages`          | Upload 1–3 pet images (→ Cloudinary)         |
| PUT    | `/Admin/updatepetimages/:petId`| Replace pet images                           |
| DELETE | `/Admin/deletepetimages/:petId`| Delete pet images                            |
| GET    | `/Admin/pets/filter`           | Filter pets (`status`, `species`, `sex`, `category`) |
| GET    | `/Admin/pets/statistics`       | Pet counts by status                         |
| GET    | `/Admin/pets/:petId`           | Pet + vitals + treatments + images           |
| POST   | `/Admin/getbackup`             | Download full Excel backup of all data       |

---

## 🛍️ E-Commerce — Categories & Products (Admin)

### Categories

| Method | Route                       | Description                          |
|--------|-----------------------------|--------------------------------------|
| POST   | `/Admin/addcategory`        | Create a category                    |
| POST   | `/Admin/updatecategory/:iD` | Rename a category                    |
| DELETE | `/Admin/deletecategory/:iD` | Delete a category                    |
| GET    | `/Admin/getallcategory`     | List all categories                  |
| GET    | `/Admin/getcategory/:id`    | Get one category                     |
| GET    | `/Admin/getcatgeorysort`    | Categories sorted by `Number` (desc) |

> `getallcategory` and `getcategory/:id` are the **only** category routes that work without the admin token.

### Products / Items

Products are sold either **by unit** or **by weight** (`soldBy: 'unit' | 'weight'`).

| Method | Route                          | Description                              |
|--------|--------------------------------|------------------------------------------|
| POST   | `/Admin/additem`               | Create a product (+1–3 photos)           |
| PUT    | `/Admin/updateitem/:id`        | Update a product                         |
| DELETE | `/Admin/deleteitem/:id`        | Delete a product                         |
| GET    | `/Admin/getallitems`           | All products                             |
| GET    | `/Admin/getitemsbycategory/:category` | Products of one category            |
| GET    | `/Admin/getitemsbysales`       | Products sorted by most-bought           |
| GET    | `/Admin/gettotalmoney`         | Sum of all product prices                |
| GET    | `/Admin/getitem/:id`           | Single product                           |
| GET    | `/Admin/products/filter`       | Filter: category, soldBy, price range, inStock, search, sort |
| GET    | `/Admin/products/per-shop`     | Products grouped **per category/shop** with stock & sales stats |

**Weight rules** (enforced): `minWeight ≥ 0.5kg`, `maxWeight ≤ 100kg`, steps of `0.5kg`, `min ≤ max`.

---

## 🧾 Orders — Lifecycle & Cancel Rules

### Order Status Flow

```
  pending ──▶ confirmed ──▶ shipped ──▶ delivered
     │            │           │
     ▼            ▼           ▼
 cancelled     cancelled   (locked)
     │            │
     ▼            ▼
 rejected      rejected
```

| Status      | Meaning                                   | User can cancel? |
|-------------|-------------------------------------------|------------------|
| `pending`   | Order placed, awaiting admin approval     | ✅ Yes           |
| `confirmed` | Admin approved the order                  | ✅ Yes           |
| `shipped`   | Order is on its way                       | ❌ No            |
| `delivered` | Order delivered to the user               | ❌ No            |
| `cancelled` | Cancelled (by user **or** admin)          | —                |
| `rejected`  | Rejected by admin                         | —                |

> **Rule:** a user can cancel **only while the order is `pending` or `confirmed`**. Once an order becomes `shipped` or `delivered`, cancellation is blocked on the backend (`OrderService.cancelOrder` → status 400).

### Admin → Status transitions (enforced)

```
pending    → confirmed | rejected
confirmed  → shipped   | rejected
shipped    → delivered
delivered  → (nothing)
cancelled  → (nothing)
rejected   → (nothing)
```

---

## 💳 Payments — InstaPay & Vodafone Cash

Payments are **manual/offline**: the user sends money to the **admin's** personal payment number, then places the order with the chosen method + optional payment screenshot.

### Admin payment numbers (set manually by the admin)

Stored once in `AdminPayment` (`GET/PUT /Admin/payment-settings`):

```json
{
  "instapayNumber": "01xxxxxxxxx",
  "instapayName": "Store Name",
  "vodafoneCashNumber": "01xxxxxxxxx",
  "vodafoneCashName": "Store Name",
  "isActive": true
}
```

| Method | Route                      | Who   | Description                        |
|--------|----------------------------|-------|------------------------------------|
| GET    | `/Admin/payment-settings`  | Admin | Read numbers / create default doc  |
| PUT    | `/Admin/payment-settings`  | Admin | **Add/update numbers manually**    |
| GET    | `/User/payment-info`       | User  | See where to send the money        |

Order payment methods accepted by the API: **`instapay`** or **`vodafonecash`**.

---

## 👤 User Routes

Everything under `/User` requires the **user** JWT.

### Pets

| Method | Route          | Description                       |
|--------|----------------|-----------------------------------|
| GET    | `/User/my-pets`| List my pets + vitals + treatments + images |

### Products & Filters

| Method | Route                      | Description                              |
|--------|----------------------------|------------------------------------------|
| GET    | `/User/products`           | Browse products with filters (see below) |
| GET    | `/User/products/per-shop`  | Products grouped **per shop**, only in stock |
| GET    | `/User/products/categories`| All categories                           |
| GET    | `/User/products/:id`       | Single product detail                    |

**`/User/products` filters (all optional query params):**

| Param      | Example                | Effect                        |
|------------|------------------------|-------------------------------|
| `category` | `Food`                 | By category                   |
| `soldBy`   | `unit`/`weight`        | By selling type               |
| `minPrice` | `50`                   | Min price                     |
| `maxPrice` | `500`                  | Max price                     |
| `inStock`  | `true`/`false`         | Stock status                  |
| `search`   | `chicken`              | Text search (name/description)|
| `sortBy`   | `price-asc` / `price-desc` / `name` / `popular` | Sorting |

### Orders

| Method | Route                    | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | `/User/payment-info`     | Show admin's InstaPay / Vodafone numbers |
| POST   | `/User/create-order`     | Place an order                            |
| GET    | `/User/my-orders`        | My orders (optional `?status=` filter)    |
| GET    | `/User/my-orders/:id`    | One order detail                          |
| PUT    | `/User/cancel-order/:id` | Cancel order (**only if pending/confirmed**) |

#### `POST /User/create-order` body

```json
{
  "items": [
    { "productId": "64f...", "quantity": 2 },
    { "productId": "64f...", "quantity": 1, "weight": 1.5 }
  ],
  "paymentMethod": "instapay",
  "paymentScreenshot": "https://.../image.jpg",
  "phone": "01012345678",
  "address": "Cairo, Egypt",
  "notes": "Please deliver after 6pm"
}
```

**What the backend does when creating an order:**

1. Validates each product exists & is `inStock`.
2. For `weight` products, validates the weight is within `[minWeight, maxWeight]`.
3. Computes the `totalPrice` server-side (**never trusts the client**).
4. Creates the order with `status: 'pending'`.
5. Increments `numberOfBuying` on each product (powers the "popular" sort).

---

## 👨‍💼 Admin Order Management

| Method | Route                              | Description                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/Admin/orders`                    | All orders (filter: `status`, `paymentMethod`, `search`) |
| GET    | `/Admin/orders/statistics`         | Order counts per status + total revenue (delivered only) |
| GET    | `/Admin/orders/:id`                | Single order                          |
| PUT    | `/Admin/orders/update-status/:id`  | Move order to next valid status       |
| PUT    | `/Admin/orders/cancel/:id`         | Admin-cancel an order (not delivered) |

**Multi-filter example:**

```
GET /Admin/orders?status=pending&paymentMethod=instapay&search=010
```

---

## 🔗 API Cheat-Sheet (base URL `http://localhost:3001`)

```
Auth
  POST /Auth/login

Admin
  GET  /Admin/payment-settings
  PUT  /Admin/payment-settings
  GET  /Admin/orders
  GET  /Admin/orders/statistics
  GET  /Admin/orders/:id
  PUT  /Admin/orders/update-status/:id
  PUT  /Admin/orders/cancel/:id
  GET  /Admin/products/filter
  GET  /Admin/products/per-shop
  ... (pets, treatments, vitals, images, categories, items)

User
  GET  /User/payment-info
  POST /User/create-order
  GET  /User/my-orders
  GET  /User/my-orders/:id
  PUT  /User/cancel-order/:id
  GET  /User/products
  GET  /User/products/per-shop
  GET  /User/products/categories
  GET  /User/products/:id
  GET  /User/my-pets
```

---

## 🧠 Important Design Notes

- **Server-side pricing** — the total price is always recomputed from the product records, never taken from the request body.
- **State machine guards** — both the user cancel route (`OrderRoutes`) and the admin status-update route (`AdminRoutes`) enforce legal transitions to keep orders consistent.
- **Two auth realms** — admin and user JWTs use **different secrets**, so tokens cannot be exchanged between roles.
- **exactOptionalPropertyTypes** — the TS config is strict; code builds payloads with conditional spreads (`...(x === undefined ? {} : {x})`) so Mongoose accepts them.

---

## 🛠️ Troubleshooting

| Problem                          | Fix                                                              |
|----------------------------------|------------------------------------------------------------------|
| `TSError: Unable to compile`     | Fix the reported type errors (see `npm run dev` output)          |
| `the pet_planet database connetced` missing | Check `mongodblocalhostlink` in `.env`               |
| Redis errors at boot             | Redis is optional for auth flows to error out; verify host/credentials |
| Images fail to upload            | Check `CLOUDINARY_*` keys and file types (jpg/jpeg/png/webp)     |
| `Cancel blocked` (400)           | Expected — order is already `shipped`/`delivered`                |

---

*Project name: **Pet Planet** — one API to run your pet clinic and pet shop from a single backend.*
