
import { logError } from '../utils/errorHandler';

// Default to localhost for development. In production, this should come from env vars.
const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
    /**
     * Generic GET request handler
     * @param endpoint - The API endpoint (e.g., '/modules/team_performance')
     */
    async get<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important: Include cookies for auth
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            logError(error, `API GET ${endpoint}`);
            throw error;
        }
    },

    /**
     * Generic POST request handler
     */
    async post<T>(endpoint: string, body: any = {}): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important: Include cookies for auth
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            logError(error, `API POST ${endpoint}`);
            throw error;
        }
    }
};
