# Code Quality Improvements Roadmap

This document outlines prioritized technical tasks to elevate the Global Algo IT codebase from "Prototype" to "Production".

## Priority 1: High Impact / Medium Difficulty
**Goal: Real Data Integration**

1.  **API Client Wrapper:**
    *   Create a `services/api.ts` using `fetch` or `axios` that handles base URLs, auth headers (Bearer tokens from `authService`), and 401 intercepts.
    *   *Why:* To standardize how the frontend talks to the backend.

2.  **Migrate Mock Data to Backend:**
    *   Move `MOCK_LEADS` (MyLeads), `MOCK_TASKS` (TasksToday), and `MOCK_PIPELINE_LEADS` (Pipeline) into the SQLite database in `backend/`.
    *   Create REST endpoints in Fastify to serve this data.
    *   *Why:* The app cannot go live with hardcoded arrays.

3.  **Connect Auth:**
    *   Update `services/authService.ts` to actually call `POST /api/auth/login` on the backend instead of using local mock users.
    *   *Why:* Security. Currently, auth is entirely client-side simulation.

## Priority 2: High Impact / High Difficulty
**Goal: Reliability & Testing**

4.  **Setup Jest/Vitest:**
    *   Install Vitest (since we use Vite).
    *   Write unit tests for `utils/index.ts` (formatters) and `services/authService.ts`.
    *   *Why:* Establish a safety net for core logic.

5.  **Component Testing:**
    *   Add tests for critical UI components: `ProtectedRoute`, `ReviewQueue`, and `LiveCall`.
    *   Verify that "Approved" leads actually move to the correct state locally.

## Priority 3: Medium Impact / Low Difficulty
**Goal: Developer Experience (DX) & Safety**

6.  **Strict Typing:**
    *   Audit `tsconfig.json` in the root. Ensure `noImplicitAny` is `true`.
    *   Refactor `pages/AdminToolsPage.tsx` component map to remove `React.FC<any>` usage.
    *   *Why:* Catch bugs at compile time.

7.  **Zod Schema Validation:**
    *   Introduce `zod` for validating forms (Login, Lead Editing) and API responses.
    *   *Why:* Remove manual `if (!value)` checks and ensure type safety at runtime boundaries.

## Priority 4: Backend Hardening
**Goal: Scalability**

8.  **PostgreSQL Migration:**
    *   Replace `better-sqlite3` with PostgreSQL (using Prisma or Drizzle ORM).
    *   *Why:* SQLite will not scale for a CRM with concurrent writes (WhatsApp logs + Agent updates).

9.  **Secure Secrets:**
    *   Remove default secrets from `server.ts`. Ensure the app crashes if `SESSION_SECRET` is not in environment variables.

10. **Separate Worker Process:**
    *   Update `package.json` to have separate scripts for `start:api` and `start:worker`.
    *   *Why:* Prevent long-running queue jobs from blocking HTTP requests.
