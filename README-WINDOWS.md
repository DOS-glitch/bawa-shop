# BAWA SHOP — Windows Quickstart

## 1) Install tools
- Node.js 18+
- pnpm: `npm i -g pnpm`
- PostgreSQL (install and make sure it is running)

## 2) Create database (once)
Use PgAdmin or run in `psql`:
```sql
\i scripts/setup/create_db.sql
```

## 3) Environment
Copy `.env.example` to `.env` and update values:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/bawashop
SESSION_SECRET=supersecret123
```

## 4) Install and migrate
```bash
pnpm install
pnpm migrate   # same as: pnpm drizzle-kit push
```

## 5) (Optional) Seed an admin
```bash
pnpm seed
```
The seed tries to create an admin `admin@bawashop.local` with password `admin1234`.
If it fails (due to hashing differences), use the `/login` and `/register` flows in the UI.

## 6) Run
```bash
pnpm dev
```
If PowerShell shows an env error, we already use `cross-env` in scripts, so it should work.

## URLs
- Login: http://localhost:5173/login
- Admin Dashboard: http://localhost:5173/admin2/dashboard
- Shop: http://localhost:5173/
