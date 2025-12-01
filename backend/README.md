# Global Algo IT - Backend

A robust Node.js + TypeScript backend supporting the Lead Management System, featuring a modular WhatsApp bulk messaging engine.

## Directory Structure

*   **`src/server.ts`**: Entry point. Handles HTTP routes, Auth, and Audit logging.
*   **`src/whatsapp/`**: Dedicated module for WhatsApp logic.
    *   **`db.ts`**: SQLite connection and migration runner.
    *   **`adapter/`**: Third-party providers (Twilio) abstraction.
    *   **`api/`**: REST endpoints for Campaigns and Webhooks.
    *   **`workers/`**: Background worker for processing the message queue (Redis).
*   **`migrations/`**: SQL files for database schema updates.
*   **`data/`**: Runtime storage for SQLite DB and Audit logs (ignored by git).

## Setup & Installation

1.  **Dependencies**:
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Configuration**:
    Copy the example file and fill in your details.
    ```bash
    cp .env.example .env
    ```
    *   **Twilio**: Required for sending WhatsApp messages.
    *   **Redis**: Required for the message queue. Ensure Redis is running (`redis-server`).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *   Runs on `http://localhost:3001`.
    *   Automatically runs migrations from `migrations/001_whatsapp.sql`.
    *   Starts the internal background worker (if `ENABLE_WORKER=true`).

## Production Build

1.  **Build**:
    ```bash
    npm run build
    ```
2.  **Start**:
    ```bash
    npm start
    ```
    *   Ensure the `migrations/` folder is present in the working directory when running the build.

## WhatsApp Integration (Twilio Sandbox)

1.  **Configure Twilio**:
    *   Set `PUBLIC_URL` in `.env` to your public endpoint (e.g., using ngrok).
    *   In Twilio Console, set the WhatsApp Sandbox Webhook to: `${PUBLIC_URL}/api/whatsapp/webhook`.
2.  **Opt-In**:
    *   Users must join your sandbox (e.g., send `join <keyword>` to the sandbox number) before you can message them.
    *   The database migration seeds a test user. Update `data/whatsapp.db` -> `clients` table with your real sandbox number for testing.

## API Endpoints

*   **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
*   **Campaigns**:
    *   `POST /api/campaigns` (Create draft)
    *   `POST /api/campaigns/:id/start` (Queue messages)
    *   `GET /api/campaigns/:id` (View stats)
