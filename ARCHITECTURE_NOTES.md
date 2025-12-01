# Project Architecture Refactor

This project has been refactored to follow a clean, scalable React architecture.

## Directory Structure

*   **`src/components/`**: UI building blocks.
    *   **`layouts/`**: Page wrappers (e.g., `DashboardLayout`).
    *   **`ui/`**: Reusable primitives (Icons, Buttons, specialized Widgets).
    *   **`features/`**: Domain-specific business components, grouped by role (Admin, Agent, TeamLead) or function.
*   **`src/pages/`**: Route entry points. These are now thin wrappers that compose features.
*   **`src/services/`**: Business logic and API abstraction.
    *   `auth.ts`: Authentication logic and user storage.
    *   `ai.ts`: Google GenAI integration.
*   **`src/hooks/`**: Custom React hooks (e.g., `useAuth`).
*   **`src/utils/`**: Pure utility functions (formatting, helpers) and centralized mock data.
*   **`src/types.ts`**: Global type definitions.
*   **`src/constants.ts`**: Application configuration and constants.

## Key Changes

1.  **Component Extraction**: Huge "ToolsPage" files have been broken down. Sub-components (like `WhatsAppConnector`, `LiveCall`, `UserAdmin`) now live in `components/features/`.
2.  **Service Layer**: Auth logic moved from the hook to `services/auth.ts`. AI logic moved to `services/ai.ts`.
3.  **Mock Data**: Centralized where appropriate or co-located with the relevant feature component for better maintainability.
