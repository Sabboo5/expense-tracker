# Expense Tracker — Full-Stack Web Application

A production-ready full-stack expense tracking application built with **React + TypeScript** (frontend) and **Node.js + Express + TypeScript** (backend), backed by **MongoDB Atlas** and secured with **JWT authentication**.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Recharts | Analytics charts |
| React Hook Form + Zod | Form handling & validation |
| Axios | HTTP client with interceptors |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express + TypeScript | API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (access + refresh tokens) | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| express-rate-limit | Rate limiting |
| Helmet + CORS | Security |
| Morgan | HTTP request logging |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization |
| Vercel | Frontend deployment |
| Render / Railway | Backend deployment |
| MongoDB Atlas | Managed database |

---

## Features

- **JWT Authentication** — Access tokens (15min) + refresh tokens (7d) via HTTP-only cookies with automatic rotation
- **Password Security** — bcrypt hashing (12 rounds), password strength validation
- **Transaction CRUD** — Create, read, update, delete income/expense transactions
- **Advanced Filtering** — Filter by type, category, date range, amount range, search query
- **Sorting & Pagination** — Server-side sorting and pagination with metadata
- **Dashboard Analytics** — Monthly income/expense area chart, category pie/donut chart, summary stats
- **Dark/Light Mode** — System preference detection + manual toggle, persisted to localStorage
- **Responsive Design** — Mobile-first responsive layout with collapsible sidebar
- **Form Validation** — Zod schemas on both frontend (React Hook Form) and backend
- **Global Error Handling** — Centralized error handler with proper HTTP status codes
- **Rate Limiting** — Global (100 req/15min) + auth-specific (20 req/15min) limiters
- **Token Interceptors** — Axios interceptor with queue-based refresh token retry logic
- **Unit Tests** — Jest + ts-jest (backend), Vitest + React Testing Library (frontend)

---

## Project Structure

```
expense-tracker/
├── backend/                    # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/             # DB connection, environment config
│   │   ├── controllers/        # Route handlers (auth, transactions, user)
│   │   ├── middleware/         # auth, error handler, validate, asyncHandler
│   │   ├── models/             # Mongoose models (User, Transaction, RefreshToken)
│   │   ├── routes/             # Express routers
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # JWT helpers, API response builders
│   │   └── __tests__/          # Jest unit tests
│   ├── Dockerfile
│   ├── render.yaml             # Render deployment config
│   └── package.json
│
├── frontend/                   # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # LoginForm, RegisterForm
│   │   │   ├── dashboard/      # MonthlyChart, CategoryChart
│   │   │   ├── layout/         # Layout, Navbar, Sidebar
│   │   │   ├── transactions/   # TransactionCard, TransactionForm, TransactionList, Filters
│   │   │   └── ui/             # Button, Input, Select, Modal, Pagination, StatsCard
│   │   ├── hooks/              # useAuth, useTransactions
│   │   ├── pages/              # DashboardPage, TransactionsPage, ProfilePage, Login, Register
│   │   ├── services/           # api.ts (Axios + interceptors), authService, transactionService
│   │   ├── store/              # Redux slices (auth, transactions, theme)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # formatters (currency, date, categories)
│   │   └── __tests__/          # Vitest + React Testing Library
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── package.json
│
├── docker-compose.yml          # Production compose (mongo + backend + frontend)
├── docker-compose.dev.yml      # Development compose override
└── .gitignore
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas URI)
- npm or pnpm

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm run dev
# API running at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
# App running at http://localhost:5173
```

### 3. Docker (full stack)

```bash
cp .env.example .env
# Edit .env with your secrets
docker-compose up -d
# App at http://localhost, API at http://localhost:5000
```

---

## API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | No | Logout (clear cookie) |
| POST | `/api/auth/logout-all` | Bearer | Logout all devices |
| GET | `/api/auth/me` | Bearer | Get current user |

### Transaction Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/transactions` | Bearer | List transactions (filter/sort/paginate) |
| POST | `/api/transactions` | Bearer | Create transaction |
| GET | `/api/transactions/:id` | Bearer | Get transaction by ID |
| PUT | `/api/transactions/:id` | Bearer | Update transaction |
| DELETE | `/api/transactions/:id` | Bearer | Delete transaction |
| GET | `/api/transactions/analytics` | Bearer | Dashboard analytics |

#### Query Parameters for GET /api/transactions

| Param | Type | Description |
|-------|------|-------------|
| `type` | `income\|expense` | Filter by type |
| `category` | string | Filter by category |
| `startDate` | ISO date | Filter from date |
| `endDate` | ISO date | Filter to date |
| `search` | string | Search in description |
| `minAmount` | number | Minimum amount |
| `maxAmount` | number | Maximum amount |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `sortBy` | `date\|amount\|category\|createdAt` | Sort field |
| `sortOrder` | `asc\|desc` | Sort direction |

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/users/profile` | Bearer | Update name/currency |
| PUT | `/api/users/change-password` | Bearer | Change password |
| DELETE | `/api/users/account` | Bearer | Delete account |

---

## Transaction Categories

**Income:** `salary`, `freelance`, `investment`, `gift`, `other_income`

**Expense:** `food`, `transport`, `housing`, `utilities`, `healthcare`, `education`, `entertainment`, `shopping`, `personal`, `travel`, `subscriptions`, `other_expense`

---

## Running Tests

```bash
# Backend tests
cd backend && npm test

# Backend with coverage
cd backend && npm run test:coverage

# Frontend tests
cd frontend && npm test

# Frontend with UI
cd frontend && npm run test:ui
```

---

## Deployment

### Frontend → Vercel

1. Connect your repo to Vercel
2. Set root directory to `frontend/`
3. Set environment variable: `VITE_API_URL=https://your-api.render.com/api`
4. Deploy (Vite auto-detected)

### Backend → Render

1. Create a new Web Service on Render
2. Set root directory to `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables from `backend/.env.example`
6. Set `MONGO_URI` to your MongoDB Atlas connection string
7. Set `CORS_ORIGIN` to your Vercel frontend URL

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist IPs (or use 0.0.0.0/0 for Render)
3. Copy your connection string and set it as `MONGO_URI`

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_ACCESS_SECRET=your_32_char_min_access_secret
JWT_REFRESH_SECRET=your_32_char_min_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=20
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Expense Tracker
```

---

## License

MIT
