
import React from 'react';

interface Props {
    isDark?: boolean;
}

const StockMarketBackground: React.FC<Props> = ({ isDark = false }) => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-gray-900">
            {/* 
                Video Background 
                Note: Ensure your video file is named 'background.mp4' and placed in the public/ folder.
            */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                src="/background.mp4"
            />
            
            {/* Theme-aware Overlay to ensure text legibility over the busy video */}
            <div 
                className={`absolute inset-0 transition-colors duration-500 ${
                    isDark 
                        ? 'bg-gray-900/75' // Darker overlay for dark mode
                        : 'bg-white/50'    // Lighter overlay for light mode
                }`} 
            />
        </div>
    );
};

export default StockMarketBackground;
