# Campus Marketplace

A full-stack web app where verified college students can buy, sell, and trade items (textbooks, dorm furniture, electronics, and more) within their own campus community. Sign-up is restricted to campus email addresses, and users can browse listings, save favorites, message sellers, and manage their own posts. Admins get a moderation dashboard.

## Features

- **Campus-verified accounts**: signup restricted to an allowed email domain, with email verification and a resend-link flow
- **Secure authentication**: short-lived JWT access tokens (kept in memory) plus refresh tokens in httpOnly cookies, with silent refresh on expiry
- **Listings**: create, edit, delete, and mark as sold; multi-photo upload; search, category/price/condition filters, sorting, and pagination
- **Favorites**: save and unsave listings, with duplicates prevented at the database level
- **Messaging**: private buyer-seller conversations tied to a listing, with unread counts and near-real-time updates via polling
- **Profile page** for each user
- **Admin dashboard**: site stats, user suspension, forced listing removal, and a reports review queue (role-based access)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, plain CSS with theme variables (light/dark) |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JSON Web Tokens, bcrypt |
| Validation | Zod |
| File uploads | Multer (local disk storage) |
| Email | Nodemailer (SMTP) |

## Architecture

```
React SPA  ──HTTP/JSON──▶  Express REST API  ──Mongoose──▶  MongoDB Atlas
(client/)                    (server/)
```

The client never talks to the database directly. Every request goes through the API, which handles authentication, validation, and authorization before touching data. Messaging uses short-interval polling (every 4 seconds) rather than WebSockets.

## Project Structure

```
campus-marketplace/
├── client/                     # React frontend
│   └── src/
│       ├── api/                # axios client + API functions
│       ├── components/         # layout, listings, chat, etc.
│       ├── context/            # AuthContext
│       ├── hooks/              # useAuth
│       └── pages/              # route-level pages
└── server/                     # Express backend
    ├── uploads/listings/       # uploaded listing photos
    └── src/
        ├── config/             # db connection, multer config
        ├── controllers/        # request logic
        ├── middleware/         # authenticate, requireAdmin, validate
        ├── models/             # Mongoose schemas
        ├── routes/             # route definitions
        ├── services/           # auth + email helpers
        ├── utils/              # file cleanup helper
        └── validators/         # Zod schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (the free tier works)
- An SMTP account for verification emails (e.g. Gmail with an App Password)

### 1. Clone and install

```bash
git clone https://github.com/sophistri/campus-marketplace.git
cd campus-marketplace

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`**

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campus-marketplace?appName=campus-marketplace

JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<a different long random string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

ALLOWED_EMAIL_DOMAINS=yourcollege.edu
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your email>
SMTP_PASS=<app password>
SMTP_FROM="Campus Marketplace <no-reply@campusmarketplace.com>"
```

Generate the two JWT secrets with `openssl rand -hex 32`.

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

The app runs at `http://localhost:5173`, and the API at `http://localhost:5000`.

### 4. Create your first admin

There's no admin by default. Sign up and verify an account, then in MongoDB Atlas open the `users` collection and change your document's `role` from `"user"` to `"admin"`. Log out and back in, and an **Admin** link appears in the sidebar.

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `verify-email`, `resend-verification`, `login`, `refresh`, `logout`; `GET /api/auth/me` |
| Listings | `GET /api/listings` (search/filter/sort/page), `GET /api/listings/mine`, `GET /api/listings/:id`, `POST /api/listings`, `PATCH /api/listings/:id`, `PATCH /api/listings/:id/status`, `DELETE /api/listings/:id` |
| Favorites | `/api/favorites` (add, remove, list) |
| Conversations | `GET/POST /api/conversations`, `GET/POST /api/conversations/:id/messages` |
| Admin | `GET /api/admin/stats`, `users`, `listings`, `reports`; `PATCH /api/admin/users/:id/suspend`, `listings/:id/status`, `reports/:id`; `DELETE /api/admin/listings/:id` |

Protected routes expect an `Authorization: Bearer <accessToken>` header. Admin routes additionally require the `admin` role.

## Security Notes

- Passwords are hashed with bcrypt and never stored in plain text
- Refresh tokens are stored in httpOnly cookies and only a hash is kept server-side, so logging out invalidates them
- Access tokens live in memory only, never in `localStorage`
- Login and resend-verification responses avoid revealing whether an email is registered
- Conversations and messages are scoped to the logged-in user's ID on the server

## Known Limitations and Future Scope

- Messaging uses polling instead of WebSockets
- Photos are stored on the local server disk, so a production deployment would need S3 or similar
- No in-app way yet for users to file reports (the admin review queue is built)
- No automated test suite
- Possible additions: payment escrow, campus map for meetup spots, push notifications

## Contributors

Jyothika Raj, Kaitlyn Anna, Liya Joshy, Meera Shibu, Naomi Veliath, Ishitha Miriam
