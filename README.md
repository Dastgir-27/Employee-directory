# Employee Directory Management System

A full-stack CRUD application for managing employee records.

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express, TypeScript, mysql2
- **Database:** MySQL / MariaDB

Features: add, view, edit and delete employees, validation on both the client and the server, search by name,
server-side pagination, loading / empty / error states, toast notifications, and an accessible responsive layout.

> There is no authentication. Treat this as a demo or internal prototype and do not expose it publicly
> with real employee data until access controls are added.

## Project structure

```
employee-directory/
├── client/              React + TypeScript + Vite app
│   └── src/
│       ├── components/  UI components
│       ├── hooks/       useToasts
│       ├── services/    Axios service and API error parsing
│       ├── types/       Shared TypeScript types
│       └── utils/       Validation and formatting helpers
├── server/              Express API
│   ├── src/
│   │   ├── config/      Database pool
│   │   ├── controllers/ Request handlers
│   │   ├── middleware/  Validation, async wrapper, error handling
│   │   ├── routes/      Route definitions
│   │   └── services/    SQL and business rules
│   └── tests/           Unit, route and integration tests
├── database/schema.sql
└── README.md
```

## Prerequisites

- Node.js 20 or newer
- MySQL 5.7+ or MariaDB 10.3+ (XAMPP works)

## Setup

### 1. Database

Run `database/schema.sql` in phpMyAdmin or the MySQL CLI:

```bash
mysql -u root -p < database/schema.sql
```

It creates the `dastgir_db` database and the `employees` table.

### 2. Server

```bash
cd server
npm install
cp .env.example .env      # Windows cmd: copy .env.example .env
```

Edit `.env` and set `DB_USER` and `DB_PASSWORD` (and `DB_NAME` if you changed it). Then:

```bash
npm run dev
```

The API runs on `http://localhost:5000`. Check `http://localhost:5000/api/health`, which should return
`{"status":"ok","database":"up"}`.

### 3. Client

```bash
cd client
npm install
cp .env.example .env      # optional, the same URL is the default
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

**server/.env**

| Variable | Purpose | Default / example |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `DB_HOST`, `DB_PORT` | Database location | `localhost`, `3306` |
| `DB_USER`, `DB_PASSWORD` | Database credentials | none |
| `DB_NAME` | Database name | `dastgir_db` |
| `DB_NAME_TEST` | Disposable database for `npm test` | `dastgir_db_test` |

**client/.env**

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API base URL | `http://localhost:5000/api` |

Never put database credentials in the client environment. Anything prefixed `VITE_` is visible in the browser.

## API

Base URL: `http://localhost:5000/api`. Bodies are JSON.

| Method | Endpoint | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/employees?search=&page=&limit=` | List employees | 200 |
| POST | `/employees` | Create an employee | 201 |
| PUT | `/employees/:id` | Replace an employee's editable fields | 200 |
| DELETE | `/employees/:id` | Delete an employee | 204 |
| GET | `/health` | Health check, includes a database ping | 200 / 503 |

Employee body: `{ "name": "...", "email": "...", "role": "..." }`

- `name` and `role`: 2 to 100 characters after trimming.
- `email`: valid format, at most 254 characters. It is lowercased, and uniqueness is case-insensitive.

The list response always includes pagination (default 10 per page, maximum 100):

```json
{
  "data": [{ "id": 1, "name": "Alex Morgan", "email": "alex@example.com", "role": "Engineer", "created_at": "2026-10-14T08:00:00.000Z" }],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

Errors use one format:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Please correct the invalid fields.", "details": { "email": "Enter a valid email address." } } }
```

| Status | Codes |
| --- | --- |
| 400 | `VALIDATION_ERROR`, `INVALID_ID`, `INVALID_JSON` |
| 404 | `NOT_FOUND` |
| 409 | `EMAIL_EXISTS` |
| 413 | `PAYLOAD_TOO_LARGE` |
| 500 | `INTERNAL_ERROR` (no SQL or stack traces are exposed) |
| 503 | `DATABASE_UNAVAILABLE` (health check only) |

## Tests

```bash
cd server && npm test      # 64 tests
cd client && npm test      # 12 tests
```

Server tests come in three groups:

1. **Validation unit tests** run anywhere.
2. **Route tests** mock the service layer and database, so they also run without MySQL.
3. **Integration tests** run the real API against a real database. They check case-insensitive unique emails,
   pagination, search (including `%` and `_` treated literally), `created_at` being preserved on update,
   404 and 409 behavior, and emoji / accented names.

The integration tests run only when `DB_NAME_TEST` is set. First create the disposable database:

```sql
CREATE DATABASE dastgir_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**The tests empty the `employees` table in `DB_NAME_TEST`.** For safety the suite refuses to start unless that name
ends in `_test` and differs from `DB_NAME`. The tests create the table themselves. Without `DB_NAME_TEST`, the
integration tests are skipped.

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| server | `npm run dev` | Start with auto-reload (tsx watch) |
| server | `npm run build` / `npm start` | Compile to `dist/` and run it |
| server | `npm run typecheck` | Type check without emitting |
| client | `npm run dev` | Start the Vite dev server |
| client | `npm run build` | Type check and build for production |

## Notes and decisions

- Emails are lowercased before saving, and the database collation (`utf8mb4_unicode_ci`) enforces case-insensitive uniqueness.
- Update checks that the employee exists before writing, because an unchanged update reports zero affected rows in MySQL.
- All queries use `?` placeholders. The list query uses `pool.query` for `LIMIT` / `OFFSET`, because MySQL 8 rejects numeric
  values for those in prepared statements. The driver still escapes every value.
- New employees sort last (by ID). After adding one, the UI jumps to the page that contains it.
- Before production: add authentication and authorization, restrict `CLIENT_ORIGIN`, and serve over HTTPS.
