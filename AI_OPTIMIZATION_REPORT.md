# AI Optimization Report

## 1. AI Tools Used

AI assistance was used during development of the ApparelFlow ERP Execution System.

The main AI tool used was ChatGPT.

AI was used for:

* Project planning and task breakdown
* Next.js and TypeScript development guidance
* Prisma database schema design
* API structure and validation
* RBAC implementation guidance
* UI implementation ideas
* Automated test planning
* Debugging dependency and configuration issues
* Documentation and README preparation

AI was used as an engineering assistant rather than as an unattended code generator. Generated suggestions and code were reviewed, executed, tested, and modified before being included in the project.

---

## 2. Example Prompts Used

Examples of prompts used during development included:

### Project Architecture

"Help me design a Next.js full-stack architecture for a production batch verification and sewing queue system with three roles: Cutting Supervisor, Cutting Verifier, and Sewing Supervisor."

### Database Design

"Create a Prisma relational schema for cutting orders, recipes, recipe components, verification items, users, and verification logs."

### RBAC

"Implement server-side role-based access control so only the Cutting Verifier can approve or reject a batch."

### Verification Rules

"Implement a server-side rule where approval is blocked if any component is RED, missing, or below the expected quantity, and return HTTP 422."

### Automated Testing

"Create automated tests for successful approval, RED shortage rejection, missing rejection reason, unauthorized approval, and Sewing Queue filtering."

---

## 3. Flawed AI Example #1 - Dependency Version Issue

During development, an initial AI-assisted setup used the latest Prisma package versions.

The installed Prisma version was incompatible with the project setup and resulted in dependency and configuration problems.

### Human Correction

The dependency versions were reviewed and changed to the compatible Prisma 6 release:

* prisma 6.19.3
* @prisma/client 6.19.3

The Prisma configuration was regenerated and the PostgreSQL schema was successfully synchronized using:

`npx prisma db push`

This demonstrated that AI-generated dependency choices still require validation against the actual project environment.

---

## 4. Flawed AI Example #2 - Vitest Version Conflict

An initial attempt was made to install the latest Vitest version.

This produced an npm dependency resolution error because the selected Vitest version required a newer Node type definition version than the project currently used.

The error was:

"Could not resolve dependency"

because the installed `@types/node` version was 20 while the selected Vitest version required Node types 22 or newer.

### Human Correction

Instead of forcing incompatible dependencies, the project was changed to a compatible Vitest 2 release:

`vitest 2.1.9`

The test configuration was then added through `vitest.config.ts`.

The automated tests subsequently passed successfully.

---

## 5. Human Refactoring and Validation

AI-generated suggestions were not accepted without testing.

The implementation was manually validated using:

* `npm run lint`
* `npm run build`
* `npm test`
* Manual browser testing
* API response validation
* Role-based login testing
* Git review
* Production deployment testing

Examples of human validation included testing that:

* Cutting Supervisor can create cutting orders.
* Cutting Verifier can verify batches.
* Sewing Supervisor can access only the Sewing Queue.
* Non-verifier approval attempts return HTTP 403.
* RED components prevent approval.
* Shortages prevent approval.
* Rejection requires a reason.
* Verified batches appear in the Sewing Queue.
* Pending and rejected batches do not appear in the Sewing Queue.
* Application state persists through the production PostgreSQL database.

### Production Debugging Example

During production deployment, the application initially returned a Prisma datasource validation error because the deployed version still referenced SQLite while the production database used PostgreSQL.

The issue was identified through the Vercel runtime logs.

The Prisma schema was corrected to use PostgreSQL, the change was committed and pushed to GitHub, and Vercel was redeployed.

After the corrected deployment, the application successfully connected to the PostgreSQL database and production login worked.

This demonstrated the importance of checking actual runtime errors instead of relying only on local development results.

---

## 6. Defensive Architecture

The system uses server-side validation instead of relying only on frontend restrictions.

### Server-Side RBAC

Role authorization is checked on API requests.

The approval and rejection endpoints only allow:

`CUTTING_VERIFIER`

Other roles receive HTTP 403.

### Server-Side Verification Hard Stop

Approval is blocked when:

* A component is RED.
* Actual quantity is below expected quantity.
* Required components have not been properly verified.

The server returns HTTP 422 when approval conditions are not satisfied.

### Server-Controlled Verifier Identity

The verifier identity is obtained from the authenticated server token rather than trusting a verifier ID supplied by the client.

### Database-Level Sewing Queue Filtering

The Sewing Queue query filters records using:

`status = VERIFIED`

This prevents unapproved, pending, or rejected batches from being returned to the Sewing Supervisor.

### Input Validation

The application validates quantities and rejects invalid values such as:

* Negative numbers
* Invalid numeric values
* Missing required fields
* Invalid rejection requests

---

## 7. Automated Testing

Vitest was added to provide automated verification of the core business rules.

The automated test suite covers:

1. Successful approval when all components are GREEN and fully counted.
2. Blocking approval when a component is RED.
3. Blocking approval when there is a shortage.
4. Requiring a rejection reason.
5. Allowing approval only for the Cutting Verifier.
6. Allowing only VERIFIED batches into the Sewing Queue.
7. Blocking approval when no components exist.

The test suite currently passes:

**7 tests passed.**

The test command is:

`npm test`

---

## 8. AI Optimization Approach

AI was most useful for accelerating repetitive development tasks and generating initial implementation ideas.

However, the development process followed a human-in-the-loop approach:

1. Define the requirement.
2. Ask AI for an implementation approach.
3. Review the generated solution.
4. Implement or modify the solution.
5. Run the application.
6. Test the behavior.
7. Investigate failures.
8. Refactor when required.
9. Verify the final behavior.
10. Commit the verified implementation.

This approach reduced development time while keeping security, correctness, and business rules under human review.

---

## 9. Human Verification of Assessment Requirements

The final implementation was checked against the major assessment requirements.

### Role-Based Access Control

* Cutting Supervisor can create cutting orders.
* Cutting Verifier can verify and approve/reject batches.
* Sewing Supervisor can access the Sewing Queue.
* Unauthorized role actions are rejected by the backend.

### Verification Hard Stop

* RED components cannot be approved.
* Missing components cannot be approved.
* Short quantities cannot be approved.
* Approval returns an appropriate server-side error.

### Sewing Queue Gate

* Only `VERIFIED` batches are returned.
* Pending batches do not appear.
* Rejected batches do not appear.
* The filtering is enforced at the database query level.

### Persistence

* Production data is stored in PostgreSQL through Neon.
* Data remains available after page refreshes and new sessions.

### Automated Testing

* Core verification and Sewing Queue business rules are covered by automated tests.
* The test suite passes successfully.

---

## 10. Final Assessment

AI assistance improved development speed, but the final implementation was validated against the assessment requirements through manual testing, automated tests, linting, production builds, API testing, runtime debugging, and role-based testing.

The main engineering principle followed was:

> "AI can assist implementation, but application behavior must be verified by the developer."

AI was therefore used as a development assistant while final decisions, implementation changes, testing, debugging, and validation remained under human review.
