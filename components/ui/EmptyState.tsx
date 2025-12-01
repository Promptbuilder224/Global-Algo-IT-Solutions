import React from 'react';
import { ClipboardListIcon } from './Icons';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    action?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'small';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
    title, 
    description, 
    icon: Icon = ClipboardListIcon, 
    action, 
    className = '',
    variant = 'default'
}) => {
    const isSmall = variant === 'small';

    return (
        <div className={`flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/30 ${className}`}>
            <div className={`bg-gray-800 rounded-full ${isSmall ? 'p-2' : 'p-4'} mb-3`}>
                <Icon className={`${isSmall ? 'h-6 w-6' : 'h-10 w-10'} text-gray-500`} />
            </div>
            <h3 className={`${isSmall ? 'text-sm' : 'text-lg'} font-medium text-white`}>{title}</h3>
            {description && (
                <p className={`mt-1 text-gray-400 ${isSmall ? 'text-xs' : 'text-sm'} max-w-sm`}>
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};