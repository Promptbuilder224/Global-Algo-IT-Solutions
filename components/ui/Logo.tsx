
import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", showText = true }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg 
                viewBox="0 0 512 512" 
                className="h-full w-auto" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 
                   G LETTERFORM 
                   Stroke is 'currentColor' so it can be Black in Light Mode and White in Dark Mode 
                */}
                <circle
                    cx="256"
                    cy="256"
                    r="200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="64"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <line
                    x1="256"
                    y1="256"
                    x2="416"
                    y2="256"
                    stroke="currentColor"
                    strokeWidth="64"
                    strokeLinecap="butt"
                />

                {/* GLOBE LANDMASSES (Teal #007a80) */}
                <g fill="#007a80">
                    {/* Americas */}
                    <path d="M 225 135 C 205 150, 195 170, 195 190 C 195 205, 198 215, 205 225 C 210 235, 210 245, 205 255 C 200 265, 195 280, 195 295 C 195 315, 205 335, 215 350 C 225 365, 230 380, 230 395 C 230 405, 228 415, 223 425 L 240 435 C 248 420, 252 405, 252 390 C 252 372, 247 355, 238 337 C 230 320, 225 305, 225 292 C 225 280, 230 270, 238 260 C 247 248, 252 236, 252 222 C 252 205, 248 190, 240 175 C 235 165, 230 150, 225 135 Z" />
                    
                    {/* Europe / North Africa */}
                    <path d="M 270 150 C 285 145, 300 145, 315 150 C 330 155, 345 162, 355 172 L 370 180 C 375 186, 378 193, 380 200 C 382 208, 383 215, 380 222 C 375 230, 368 235, 360 238 C 350 242, 340 243, 330 242 C 320 240, 310 238, 300 238 C 292 238, 285 240, 278 242 L 270 230 C 275 222, 278 215, 278 208 C 278 200, 275 192, 270 185 C 268 178, 268 170, 270 162 Z" />
                    
                    {/* Africa */}
                    <path d="M 300 245 C 310 245, 320 247, 330 252 C 342 258, 350 265, 357 275 C 365 287, 370 300, 372 315 C 374 330, 372 345, 365 360 C 360 370, 353 378, 345 385 L 337 395 C 330 402, 323 408, 315 412 C 305 417, 295 420, 285 420 L 275 408 C 285 398, 292 387, 297 375 C 302 363, 305 350, 305 338 C 305 325, 302 313, 297 302 C 293 292, 290 283, 290 275 C 290 265, 295 255, 300 245 Z" />
                    
                    {/* Asia */}
                    <path d="M 345 210 C 360 210, 375 215, 388 223 C 398 230, 405 238, 410 248 C 412 255, 412 262, 410 270 L 398 272 C 392 265, 385 260, 377 257 C 368 255, 360 255, 352 257 L 345 248 C 348 238, 348 230, 345 220 Z" />
                </g>
            </svg>
            
            {/* Brand Name */}
            {showText && (
                <div className="flex flex-col justify-center">
                    <span className="text-2xl font-extrabold tracking-tight leading-none text-current">
                        Global
                    </span>
                    <span className="text-lg font-bold tracking-wide text-brand-primary leading-none">
                        Algo IT
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
