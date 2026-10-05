# ApparelFlow ERP Execution System

A full-stack ERP execution system for garment production, focused on production batch verification and the sewing queue gate.

## Live Application

https://apparelflow-kappa.vercel.app/

## GitHub Repository

https://github.com/Heerthana23/apparelflow

## Tech Stack

* Next.js 16
* TypeScript
* Prisma ORM
* PostgreSQL (Neon)
* JWT Authentication
* bcryptjs
* Tailwind CSS
* REST API
* Vitest

## Main Module

Production Batch Verification & Sewing Queue Gate.

The system supports three roles:

* Cutting Supervisor
* Cutting Verifier
* Sewing Supervisor

## Workflow

1. Cutting Supervisor creates a cutting order.
2. The order enters `PENDING_VERIFICATION`.
3. Cutting Verifier checks every component.
4. Components are classified as:

   * GREEN – sufficient quantity
   * YELLOW – shortage
   * RED – missing/not counted
5. A batch can only be approved when all required components are fully counted.
6. Approved batches become `VERIFIED`.
7. Only verified batches appear in the Sewing Queue.
8. Rejected batches require a rejection reason.

## RBAC

| Action                         | Cutting Supervisor | Cutting Verifier | Sewing Supervisor |
| ------------------------------ | ------------------ | ---------------- | ----------------- |
| Create cutting order           | Yes                | No               | No                |
| View verification orders       | Yes                | Yes              | No                |
| Update verification quantities | No                 | Yes              | No                |
| Approve batch                  | No                 | Yes              | No                |
| Reject batch                   | No                 | Yes              | No                |
| View sewing queue              | No                 | No               | Yes               |

Role permissions are enforced on the backend API, not only in the frontend.

## Security Rules

### RED Component

A batch containing a RED verification item cannot be approved.

The backend returns:

`422 Unprocessable Entity`

### Missing Quantity

If:

`actualQty < expectedQty`

approval is rejected by the backend.

### Rejection Reason

A rejected batch must contain a non-empty rejection reason.

Otherwise the API returns:

`400 Bad Request`

### Role Protection

Only `CUTTING_VERIFIER` can approve or reject batches.

Other roles receive:

`403 Forbidden`

### Sewing Queue Gate

The Sewing Queue API only returns orders with:

`status = VERIFIED`

Therefore, unapproved or rejected batches cannot enter the sewing queue.

## Recipes

### Casual Blouse

* Recipe Code: `REC-BL01`
* Category: Blouse
* Standard Fabric: 1.8 yards/piece
* Wastage Cap: 5.0%

Components:

* Front Body Panel — 1
* Back Body Panel — 1
* Sleeves (Left & Right) — 2
* Collar & Stand — 1
* Sleeve Cuffs — 2

### Crop Top

* Recipe Code: `REC-CT02`
* Category: Crop Top
* Standard Fabric: 1.1 yards/piece
* Wastage Cap: 8.0%

Components:

* Front Chest Panel — 1
* Back Support Panel — 1
* Neck Binding Strip — 1
* Hem Elastic Casing — 1
* Side Strap Accents — 2

## API Endpoints

### Authentication

`POST /api/auth/login`

### Cutting Orders

`POST /api/cutting-orders`

Creates a new cutting order.

`GET /api/cutting-orders`

Returns cutting orders available to authorized users.

### Verification

`POST /api/verification`

Approves or rejects a cutting order.

`PATCH /api/verification/items`

Updates the actual quantity of a verification item.

### Sewing Queue

`GET /api/sewing-queue`

Returns only verified production batches.

## Demo Accounts

All demo accounts use:

`Password123!`

### Cutting Supervisor

`cutting.supervisor@apparelflow.local`

### Cutting Verifier

`cutting.verifier@apparelflow.local`

### Sewing Supervisor

`sewing.supervisor@apparelflow.local`

## Running Locally

Install dependencies:

```bash
npm install
```

Create a `.env` file containing:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Push the database schema:

```bash
npx prisma db push
```

Seed the demo data:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

Open:

`http://localhost:3000`

## Testing

Run the automated test suite:

```bash
npm test
```

The tests cover:

1. Successful approval when all components are GREEN.
2. RED component approval blocking.
3. Shortage approval blocking.
4. Rejection without a reason.
5. Non-verifier approval attempts returning `403`.
6. Only VERIFIED orders entering the Sewing Queue.
7. Approval blocked when required components are missing.

## Production Deployment

The application is deployed on Vercel with a Neon PostgreSQL database.

Production state is persisted in the cloud database and remains available after page refreshes and new sessions.

## AI Usage

AI tools were used during development for assistance with implementation, debugging, documentation, and test development.

All generated suggestions were reviewed, tested, and modified by the developer.

Detailed AI usage, flawed examples, human refactoring, and defensive engineering decisions are documented in:

`AI_OPTIMIZATION_REPORT.md`

## Project Structure

```text
app/
  api/
    auth/
    cutting-orders/
    recipes/
    verification/
    sewing-queue/

lib/
  auth.ts
  prisma.ts
  require-role.ts
  verification-rules.ts

prisma/
  schema.prisma
  seed.ts

tests/
  domain.test.ts

AI_OPTIMIZATION_REPORT.md
README.md
package.json
```
