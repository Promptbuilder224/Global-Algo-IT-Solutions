
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" className="text-brand-light" />
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white tracking-wide">Global Algo IT</h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">System Loading</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
