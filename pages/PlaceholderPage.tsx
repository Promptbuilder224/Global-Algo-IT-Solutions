
import React from 'react';
import { useParams } from 'react-router-dom';

const PlaceholderPage: React.FC = () => {
    const { page } = useParams<{ page: string }>();

    const formatTitle = (slug: string = '') => {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="text-center py-20 px-4">
            <h1 className="text-4xl font-bold text-white mb-4">
                {formatTitle(page)}
            </h1>
            <p className="text-lg text-gray-400">
                This page is currently under construction.
            </p>
            <div className="mt-8">
                 <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>
    );
};

export default PlaceholderPage;
