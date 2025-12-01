
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const BusinessHoursBadge: React.FC = () => {
    const [isBusinessHours, setIsBusinessHours] = React.useState(false);

    React.useEffect(() => {
        const checkHours = () => {
            const now = new Date();
            const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const hours = istTime.getHours();
            const day = istTime.getDay(); // Sunday - 0, Saturday - 6
            setIsBusinessHours(hours >= 9 && hours < 17 && day > 0 && day < 6);
        };
        checkHours();
        const interval = setInterval(checkHours, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center space-x-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isBusinessHours ? 'bg-green-400' : 'bg-red-500'}`}></span>
            <span className="text-xs text-gray-300 hidden sm:inline">
                {isBusinessHours ? 'Business Hours' : 'Outside Hours'} (IST)
            </span>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
    const { user, logout } = useAuth();

    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-800 shadow-md">
            <button
                className="px-4 border-r border-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-light md:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex items-center">
                   <BusinessHoursBadge />
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                    <div className="text-right mr-4">
                        <p className="text-sm font-medium text-white">{user?.username}</p>
                        <p className="text-xs text-gray-400">{user?.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        aria-label="Logout"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
