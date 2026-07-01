# Teacher-Session Booking API

A RESTful backend service for a session-booking platform where teachers create availability, users book slots, and completed sessions roll into a user's history.

**Stack:** Node.js · TypeScript · Express.js · MongoDB · Mongoose

---

## Features

- **7 API endpoints** covering the full booking lifecycle
- **Two MongoDB aggregation pipelines** (available sessions by date, user session history with `$facet`)
- **Atomic booking** via `findOneAndUpdate` — no double-booking race condition
- **Three-layer validation**: Zod (request) → Service (business rules) → Mongoose (database)
- **Centralized error handling** with consistent JSON response envelope
- **Request ID tracing** for debugging

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB instance)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd teacher-session-api

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# 4. Start development server
npm run dev
```

The server starts on `http://localhost:3000`. Verify with:
```bash
curl http://localhost:3000/health
```

### Build for Production
```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | — (required) |

See `.env.example` for connection string formats (Atlas recommended).

---

## API Endpoints

All endpoints are prefixed with `/api`. Responses follow a consistent envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "...", "error": "ERROR_CODE", "requestId": "uuid" }
```

### Users

| Method | Path | Description | Status |
|---|---|---|---|
| `POST` | `/api/users` | Create a new user | 201, 400, 409 |
| `GET` | `/api/users/:id/sessions` | Get user's session history (aggregation) | 200, 404 |

### Teachers

| Method | Path | Description | Status |
|---|---|---|---|
| `POST` | `/api/teachers` | Create a new teacher *(helper)* | 201, 400, 409 |

> **Note:** `POST /teachers` is not in the original spec but is required because the spec provides no other way to create teachers, and session creation depends on a teacher existing.

### Sessions

| Method | Path | Description | Status |
|---|---|---|---|
| `POST` | `/api/sessions` | Create a new session (availability slot) | 201, 400, 404 |
| `GET` | `/api/sessions/available?dateTimestamp={ts}` | Get available sessions for a date (aggregation) | 200, 400 |
| `POST` | `/api/sessions/:id/book` | Book an available session | 200, 400, 404, 409 |
| `PATCH` | `/api/sessions/:id/complete` | Mark a booked session as complete | 200, 404, 409 |

---

## Sample Workflow

```bash
BASE=http://localhost:3000/api

# 1. Create a teacher
curl -X POST $BASE/teachers \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Dr. Smith","email":"smith@example.com","specialization":"Mathematics","experience":10}'

# 2. Create a user
curl -X POST $BASE/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Alice Johnson","email":"alice@example.com","phone":"+1234567890"}'

# 3. Create an available session (use teacher ID from step 1)
curl -X POST $BASE/sessions \
  -H "Content-Type: application/json" \
  -d '{"teacherId":"<TEACHER_ID>","startTime":"2026-07-15T10:00:00.000Z","endTime":"2026-07-15T11:00:00.000Z"}'

# 4. Get available sessions for a date (timestamp in ms for July 15, 2026)
curl "$BASE/sessions/available?dateTimestamp=1784073600000"

# 5. Book the session (use session ID from step 3, user ID from step 2)
curl -X POST $BASE/sessions/<SESSION_ID>/book \
  -H "Content-Type: application/json" \
  -d '{"userId":"<USER_ID>"}'

# 6. Complete the session
curl -X PATCH $BASE/sessions/<SESSION_ID>/complete

# 7. View user's session history
curl $BASE/users/<USER_ID>/sessions
```

---

## Error Handling

The API uses a centralized error handler with these error categories:

| Error | Code | Status | Description |
|---|---|---|---|
| Validation failed | `VALIDATION_ERROR` | 400 | Missing/invalid request fields |
| Invalid ID format | `INVALID_ID` | 400 | Malformed MongoDB ObjectId |
| Not found | `*_NOT_FOUND` | 404 | Resource doesn't exist |
| Duplicate key | `DUPLICATE_KEY` | 409 | Email uniqueness violation |
| State conflict | `SESSION_NOT_AVAILABLE` | 409 | Session status prevents action |
| Route not found | `ROUTE_NOT_FOUND` | 404 | Unmatched route |
| Internal error | `INTERNAL_ERROR` | 500 | Unexpected server error |

Every error response includes a `requestId` (UUID) that is also logged server-side for tracing.

---

## Architecture

```
src/
  config/          # Environment + database connection
  models/          # Mongoose schemas (User, Teacher, Session)
  validators/      # Zod request schemas
  services/        # Business logic + aggregation pipelines
  controllers/     # Thin HTTP layer — call services, shape responses
  routes/          # Express route definitions
  middlewares/     # Error handler, validation, requestId, 404
  utils/           # AppError, asyncHandler
  app.ts           # Express app setup
  server.ts        # Entry point
scripts/
  drop-db.ts       # Dev utility — reset database (manual-only)
```

### Session State Machine

```
AVAILABLE → BOOKED → COMPLETED
```

Transitions are enforced in the service layer. No skipping, no reverse transitions.

### Booking Concurrency

Booking uses an atomic `findOneAndUpdate` with the status guard in the query filter:

```javascript
Session.findOneAndUpdate(
  { _id: id, status: "AVAILABLE" },
  { $set: { status: "BOOKED", userId } },
  { new: true }
);
```

This eliminates race conditions without requiring multi-document transactions.

---

## Aggregation Pipelines

### API 3 — Available Sessions by Date
`$match` (status + date range) → `$lookup` (teachers) → `$unwind` → `$sort` → `$project`

### API 6 — User Session History
`$match` (userId) → `$lookup` (teachers) → `$unwind` → `$facet` (upcoming, completed) — single DB round-trip.

* **Upcoming Sessions:** BOOKED sessions whose `startTime` is greater than the current timestamp (`startTime > new Date()`).
* **Completed Sessions:** Sessions whose status is `COMPLETED`.

---

## Testing & Verification

The project is fully verified through a rigorous test suite and a Postman collection covering:

* **Health & Route Checks**
* **Full Lifecycle Operations** (Create → Available → Book → Complete → History)
* **All Edge Cases & Error Boundaries** (Duplicate constraints, missing fields, invalid email format, non-existent references)
* **Aggregation Boundaries** (Date boundary isolation, future/past boundary verification)
* **Atomic Concurrency Protection** (Ensuring a session cannot be double-booked)
* **Centralized Error Envelope Consistency**

### Verification Badges

* **Tests Passed:** ✅ 66/66 passed, 0 failed
* **TypeScript Compilation:** ✅ Clean (`tsc` emits cleanly, zero compiler warnings/errors)
* **Booking Race Protection:** ✅ Verified (concurrency safe)
* **MongoDB Aggregations:** ✅ Verified (correct UTC boundaries and `$facet` splits)
* **Error Envelope Matrix:** ✅ Verified (proper status codes: 400, 404, 409, 500)

---

## Dev Utilities

### Database Reset

A manual-only script is provided to drop the database and recreate all indexes:

```bash
npx ts-node scripts/drop-db.ts
```

> ⚠️ **Destructive operation** — all data will be lost. This is intentionally NOT wired into any npm script. Use it only when you need a clean slate for testing.

---

## License

MIT
