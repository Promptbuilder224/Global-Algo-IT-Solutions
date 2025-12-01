
import { User } from '../types';
import { apiService } from './api';
import { logError } from '../utils/errorHandler';

interface AuthResponse {
    user: User;
}

export const authService = {
    async login(username: string, password: string): Promise<User | null> {
        try {
            const response = await apiService.post<AuthResponse>('/auth/login', { username, password });
            return response.user;
        } catch (error: any) {
            logError(error, 'AuthService:login');
            // Re-throw so the UI knows it failed (e.g. invalid credentials)
            throw error;
        }
    },

    async logout(): Promise<void> {
        try {
            await apiService.post('/auth/logout');
        } catch (error) {
            logError(error, 'AuthService:logout');
        }
    },

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await apiService.get<AuthResponse>('/auth/me');
            return response.user;
        } catch (error) {
            // 401 Unauthorized or network error is expected if no session exists
            return null;
        }
    }
};
