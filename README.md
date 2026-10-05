# ApparelFlow ERP Execution System

A full-stack ERP execution system for garment production, focused on production batch verification and the sewing queue gate.

## Tech Stack

- Next.js 16
- TypeScript
- Prisma ORM
- SQLite
- JWT Authentication
- bcryptjs
- Tailwind CSS
- REST API

## Main Module

Production Batch Verification & Sewing Queue Gate.

The system supports three roles:

- Cutting Supervisor
- Cutting Verifier
- Sewing Supervisor

## Workflow

1. Cutting Supervisor creates a cutting order.
2. The order enters `PENDING_VERIFICATION`.
3. Cutting Verifier checks every component.
4. Components are classified as:
   - GREEN – sufficient quantity
   - YELLOW – shortage
   - RED – missing/not counted
5. A batch can only be approved when all required components are fully counted.
6. Approved batches become `VERIFIED`.
7. Only verified batches appear in the Sewing Queue.
8. Rejected batches require a rejection reason.

## RBAC

| Action | Cutting Supervisor | Cutting Verifier | Sewing Supervisor |
|---|---|---|---|
| Create cutting order | Yes | No | No |
| View verification orders | Yes | Yes | No |
| Update verification quantities | No | Yes | No |
| Approve batch | No | Yes | No |
| Reject batch | No | Yes | No |
| View sewing queue | No | No | Yes |

Role permissions are enforced on the backend API, not only in the frontend.

## Security Rules

### RED component

A batch containing a RED verification item cannot be approved.

The backend returns:

`422 Unprocessable Entity`

### Missing quantity

If:

`actualQty < expectedQty`

approval is rejected by the backend.

### Rejection reason

A rejected batch must contain a non-empty rejection reason.

Otherwise the API returns:

`400 Bad Request`

### Role protection

Only `CUTTING_VERIFIER` can approve or reject batches.

Other roles receive:

`403 Forbidden`

### Sewing queue gate

The Sewing Queue API only returns orders with:

`status = VERIFIED`

Therefore unapproved or rejected batches cannot enter the sewing queue.

## API Endpoints

### Authentication

`POST /api/auth/login`

### Cutting Orders

`POST /api/cutting-orders`

Creates a new cutting order.

`GET /api/cutting-orders`

Returns orders waiting for verification.

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