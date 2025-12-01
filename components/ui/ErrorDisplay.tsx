import React, { useState } from 'react';

interface ErrorDisplayProps {
    message: string;
    details?: string | object;
    onRetry?: () => void;
    className?: string;
    title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, details, onRetry, className = '', title = 'Error' }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`bg-red-900/20 border border-red-700/50 rounded-lg p-4 ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 w-full">
                    <h3 className="text-sm font-medium text-red-300">{title}</h3>
                    <div className="mt-1 text-sm text-red-200">
                        {message}
                    </div>
                    {details && (
                        <div className="mt-2">
                            <button 
                                onClick={() => setExpanded(!expanded)} 
                                className="text-xs text-red-300 hover:text-red-100 underline focus:outline-none"
                            >
                                {expanded ? 'Hide Details' : 'Show Details'}
                            </button>
                            {expanded && (
                                <div className="mt-2 bg-red-950/50 p-2 rounded text-xs font-mono text-red-200 overflow-auto max-h-40">
                                    {typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
                                </div>
                            )}
                        </div>
                    )}
                    {onRetry && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={onRetry}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-200 bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};