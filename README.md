# Campus Marketplace

[![CI](https://github.com/sophistri/campus-marketplace/actions/workflows/ci.yml/badge.svg)](https://github.com/sophistri/campus-marketplace/actions/workflows/ci.yml)

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
| Database | MongoDB (Atlas, or a local container with Docker), Mongoose |
| Auth | JSON Web Tokens, bcrypt |
| Validation | Zod |
| File uploads | Multer (local disk storage) |
| Email | Nodemailer (SMTP); Mailpit as a local inbox in Docker |
| Containers | Docker, Docker Compose, nginx (serves the built client) |
| CI | GitHub Actions |

## Architecture

```
React SPA  ──HTTP/JSON──▶  Express REST API  ──Mongoose──▶  MongoDB Atlas
(client/)                    (server/)
```

The client never talks to the database directly. Every request goes through the API, which handles authentication, validation, and authorization before touching data. Messaging uses short-interval polling (every 4 seconds) rather than WebSockets.

## Project Structure

```
campus-marketplace/
├── .github/workflows/ci.yml    # GitHub Actions pipeline
├── compose.yml                 # runs client, server, MongoDB and Mailpit
├── .env.example                # secrets that compose.yml needs
├── client/                     # React frontend (Dockerfile + nginx config)
│   └── src/
│       ├── api/                # axios client + API functions
│       ├── components/         # layout, listings, chat, etc.
│       ├── context/            # AuthContext
│       ├── hooks/              # useAuth
│       └── pages/              # route-level pages
└── server/                     # Express backend (Dockerfile)
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

### Option A: Docker (quickest)

You need Docker with the Compose plugin. Nothing else is required: MongoDB and a local mail inbox are included.

```bash
git clone https://github.com/sophistri/campus-marketplace.git
cd campus-marketplace

cp .env.example .env
# open .env and set JWT_SECRET and JWT_REFRESH_SECRET to two different values:
#   openssl rand -hex 32

docker compose up --build
```

| What | Where |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:5000 |
| Mail inbox (verification emails) | http://localhost:8025 |

In Docker, signup accepts `@example.edu` addresses (set by `ALLOWED_EMAIL_DOMAINS` in `compose.yml`). Sign up with any address on that domain, then open the mail inbox to find the verification link. Data persists in Docker volumes; `docker compose down -v` wipes it.

### Option B: run locally without Docker

**Prerequisites**

- Node.js 24 (the version the Dockerfiles and CI use)
- A MongoDB database: an Atlas cluster (the free tier works) or a local instance
- An SMTP account for verification emails (e.g. Gmail with an App Password), or Mailpit for a local inbox

**1. Clone and install**

```bash
git clone https://github.com/sophistri/campus-marketplace.git
cd campus-marketplace

cd server && npm install
cd ../client && npm install
```

**2. Configure environment variables**

Copy the examples, then fill in the values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` (Atlas and Gmail shown as examples):

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

Generate the two JWT secrets with `openssl rand -hex 32`. `ALLOWED_EMAIL_DOMAINS` must be set: if it is empty, every signup is rejected.

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

**3. Run**

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

The app runs at `http://localhost:5173`, and the API at `http://localhost:5000`.

### Create your first admin

There's no admin by default. Sign up and verify an account, then change that user's `role` from `"user"` to `"admin"`:

- **Atlas:** open the `users` collection and edit your document's `role`.
- **Docker:**

  ```bash
  docker compose exec database mongosh campus-marketplace \
    --eval 'db.users.updateOne({ email: "you@example.edu" }, { $set: { role: "admin" } })'
  ```

Log out and back in, and an **Admin** link appears in the sidebar.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

- **Client:** `npm ci`, lint (oxlint) and a production build
- **Server:** `npm ci`

There is no automated test suite yet, so CI does not run tests.

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
- Login, signup, email verification and resend-verification are rate limited
- Upload file extensions come from the validated MIME type, not the client's filename
- Ids and query parameters are validated before they reach the database

## Known Limitations and Future Scope

- Messaging uses polling instead of WebSockets
- Photos are stored on the local server disk, so a production deployment would need S3 or similar
- No in-app way yet for users to file reports (the admin review queue is built)
- No automated test suite
- Possible additions: payment escrow, campus map for meetup spots, push notifications

## Contributors

Jyothika Raj, Kaitlyn Anna, Liya Joshy, Meera Shibu, Naomi Veliath, Ishitha Miriam
