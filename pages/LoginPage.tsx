
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { REDIRECTS } from '../constants';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { logError } from '../utils/errorHandler';
import StockMarketBackground from '../components/ui/StockMarketBackground';
import { SunIcon, MoonIcon } from '../components/ui/Icons';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Theme State
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage or system preference on init
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    // Effect to apply theme class to HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(username, password);
            if (user) {
                navigate(REDIRECTS[user.role], { replace: true });
            }
        } catch (err: any) {
            logError(err, 'LoginPage:handleSubmit');
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Animated Background */}
            <StockMarketBackground isDark={isDark} />
            
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700 shadow-lg backdrop-blur-sm transition-all z-20 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                aria-label="Toggle Theme"
            >
                {isDark ? (
                    <SunIcon className="w-6 h-6" />
                ) : (
                    <MoonIcon className="w-6 h-6 text-gray-600" />
                )}
            </button>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-10 space-y-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="flex flex-col items-center justify-center mb-6">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight text-center">
                        Global Algo IT
                    </h1>
                </div>
                
                <h2 className="text-center text-xl font-medium text-gray-600 dark:text-gray-300">
                    Sign in to your account
                </h2>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-lg shadow-sm -space-y-px">
                        <div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm rounded-t-lg transition-all"
                                placeholder="Username (e.g., admin.team)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm rounded-b-lg transition-all"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {error && <ErrorDisplay message={error} className="text-sm bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-200" />}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary shadow-lg transition-all transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" className="text-white" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                    <p>&copy; {new Date().getFullYear()} Global Algo IT. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
