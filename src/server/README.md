# Blastbound Auth Proxy

A lightweight Express server that proxies Vorld authentication APIs for the Blastbound client. It centralises credential handling, exposes clean endpoints for the client app, and adds middleware for verification, role checks, and per-user rate limiting.

## Features

- Email/password login with optional OTP challenge
- Refresh, verify, logout, and profile proxy endpoints
- Middleware for authentication, role-based checks, and rate limiting
- Input validation powered by Zod
- Helmet, CORS, and request logging hardening

## Getting started

1. Copy the `.env.example` file and populate your credentials:

   ```bash
   cd server
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   The server defaults to `http://localhost:4000`.

## Available scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `npm run dev` | Start the server with live reload    |
| `npm run build` | Emit production-ready JavaScript  |
| `npm run start` | Run the compiled server            |

## API overview

| Method | Path                | Description                     |
| ------ | -------------------- | ------------------------------- |
| POST   | `/api/auth/login`    | Authenticate by email/password  |
| POST   | `/api/auth/verify-otp` | Confirm OTP challenge        |
| POST   | `/api/auth/refresh`  | Exchange refresh token          |
| GET    | `/api/auth/verify`   | Validate access token           |
| POST   | `/api/auth/logout`   | Invalidate current session      |
| GET    | `/api/user/profile`  | Fetch profile (auth required)   |

Requests and responses mirror the Vorld API, with consistent error shapes.

## Deployment notes

- Configure `CLIENT_ORIGIN` with a comma-separated list of trusted origins.
- Keep `VORLD_APP_SECRET` private—never expose it to the frontend.
- Consider running behind HTTPS and adding production logging/metrics.
