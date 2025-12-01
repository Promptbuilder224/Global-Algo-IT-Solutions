# Environment Configuration

This project requires specific environment variables to function correctly in a production environment.

## Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` | Google GenAI API Key for AI features (Co-pilot, Summarization, content generation). | Yes |

*Note: The application expects `process.env.API_KEY` to be available. In Vite, you may need to configure `define` in `vite.config.ts` or ensure your deployment platform injects this into the global scope.*

## Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Port for the backend server. | No | `3001` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for WhatsApp messaging. | Yes | - |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token. | Yes | - |
| `TWILIO_WHATSAPP_NUMBER`| The sender number (e.g., `whatsapp:+14155238886`). | Yes | - |
| `PUBLIC_URL` | The public URL of the backend (for Webhooks). | Yes | - |
| `REDIS_HOST` | Hostname for the Redis server (queue). | Yes | `localhost` |
| `REDIS_PORT` | Port for the Redis server. | No | `6379` |
| `ENABLE_WORKER` | Set to `true` to run the background worker in the same process (dev only). | No | `false` |

## Setup Instructions

1.  **Frontend**: Create a `.env` file in the root directory.
2.  **Backend**: Create a `.env` file in the `backend/` directory (copy from `backend/.env.example`).
