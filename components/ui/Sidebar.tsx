
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../constants';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const SidebarContent: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    const navItems = NAV_ITEMS[user.role];

    return (
        <div className="h-0 flex-1 flex flex-col overflow-y-auto bg-gray-900 border-r border-gray-800">
            <div className="flex items-center justify-center flex-shrink-0 px-4 h-20 bg-gray-900 border-b border-gray-800">
                <span className="text-xl font-bold text-white tracking-wider">Global Algo IT</span>
            </div>
            <nav className="flex-1 px-3 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path.split('/').length <= 2}
                        className={({ isActive }) =>
                            `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isActive
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon 
                            className={`mr-3 flex-shrink-0 h-6 w-6 transition-colors ${
                                window.location.hash.includes(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-brand-light'
                            }`} 
                            aria-hidden="true" 
                        />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    return (
        <>
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <SidebarContent />
                </div>
                <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-72"> {/* Increased width slightly for logo */}
                    <div className="flex flex-col h-0 flex-1">
                        <SidebarContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
