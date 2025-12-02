# Global Algo IT - Backend

A robust Node.js + TypeScript backend supporting the Lead Management System, featuring a modular WhatsApp bulk messaging engine.

## Directory Structure

*   **`src/server.ts`**: Entry point. Handles HTTP routes, Auth, and Audit logging.
*   **`src/whatsapp/`**: Dedicated module for WhatsApp logic.
    *   **`adapter/`**: Third-party providers (Twilio) abstraction.
    *   **`api/`**: REST endpoints for Campaigns and Webhooks.
    *   **`workers/`**: Background worker for processing the message queue (Redis).
*   **`migrations/`**: SQL files for database schema updates.
    *   **`db.ts`**: MongoDB connection and collection helpers.

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
   
3.  **MongoDB** (WhatsApp storage):
    *   Set `MONGO_URI` and `MONGO_DB` in `.env` (defaults to mongodb://localhost:27017 and `global_algo_whatsapp`).
    *   If you have a legacy sqlite DB at `data/whatsapp.db` you can migrate it to MongoDB with:
        ```bash
        npm run migrate:sqlite-to-mongo
        ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *   Runs on `http://localhost:3001`.
    *   Uses MongoDB for WhatsApp storage. Set `MONGO_URI` and `MONGO_DB` in `.env` to point to your database.
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

## Tests

Run the unit/integration tests (they use an in-memory MongoDB instance):

```
npm run test
```

## WhatsApp Integration (Twilio Sandbox)

1.  **Configure Twilio**:
    *   Set `PUBLIC_URL` in `.env` to your public endpoint (e.g., using ngrok).
    *   In Twilio Console, set the WhatsApp Sandbox Webhook to: `${PUBLIC_URL}/api/whatsapp/webhook`.
2.  **Opt-In**:
    *   Users must join your sandbox (e.g., send `join <keyword>` to the sandbox number) before you can message them.
    *   The server will seed a few sample clients into MongoDB on first startup (if the clients collection is empty). Update the `clients` collection with your real sandbox number for testing.

## API Endpoints

*   **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
*   **Campaigns**:
    *   `POST /api/campaigns` (Create draft)
    *   `POST /api/campaigns/:id/start` (Queue messages)
    *   `GET /api/campaigns/:id` (View stats)
