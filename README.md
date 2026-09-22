# ERP System - HKT-VZG

An enterprise resource planning (ERP) system backend built with NestJS, Prisma ORM, and PostgreSQL.

---

## 🛠️ Tech Stack

- **Backend Framework:** NestJS (Node.js & TypeScript)
- **Database & ORM:** PostgreSQL & Prisma ORM
- **Authentication & Security:** JWT (Passport-JWT), Bcrypt, Role/Permission-based Guards
- **Validation:** Class-Validator & Class-Transformer

---

## 🚀 Getting Started & Setup Guide

### 1. Prerequisites
Ensure you have installed:
- [Node.js](https://nodejs.org/) (v18+ or v20+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) database running locally or hosted

---

### 2. Backend Setup

#### a. Navigate to the backend directory:
```bash
cd backend
```

#### b. Install dependencies:
```bash
npm install
```

#### c. Configure Environment Variables:
Copy `.env.example` to create your `.env` file:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL database credentials and JWT Secret:
```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DATABASE_NAME>?schema=public"
JWT_SECRET="your_custom_jwt_secret_key"
PORT=3001
```

#### d. Run Database Migrations & Generate Prisma Client:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
*(Optional) To view/manage your database via Prisma Studio:*
```bash
npx prisma studio
```

---

### 3. Running the Application

```bash
# Start in development mode (with hot reload)
npm run start:dev

# Start in production mode
npm run build
npm run start:prod
```

The server will be running at `http://localhost:3001`.

---

## 📂 Project Structure

```
Erp_System/
├── backend/
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── auth/           # Authentication, JWT strategies & guards
│   │   ├── offerings/      # Offerings module, service & controller
│   │   ├── prisma/         # Prisma service & database module
│   │   ├── app.module.ts   # Root application module
│   │   └── main.ts         # Application bootstrap entry point
│   ├── .env.example        # Environment template
│   └── package.json        # Dependencies & scripts
└── frontend/               # Frontend client application
```
