"use client";

export default function LogoAnimation() {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center overflow-visible">
            {/* Main Pin Container with subtle breathe animation */}
            <div className="relative animate-bounce-subtle">
                {/* SVG Logo */}
                <svg width="36" height="36" viewBox="0 0 100 100" className="drop-shadow-lg">
                    {/* Outer Glow */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background Circle/Glow */}
                    <circle
                        cx="50" cy="80" r="15"
                        fill="#1877F2"
                        fillOpacity="0.2"
                        className="animate-pulse"
                    />

                    {/* Pin Shape */}
                    <path
                        d="M50 10 C30 10, 15 25, 15 45 C15 65, 50 90, 50 90 C50 90, 85 65, 85 45 C85 25, 70 10, 50 10 Z"
                        fill="#1877F2"
                        stroke="#fff"
                        strokeWidth="3"
                        filter="url(#glow)"
                        className="transition-all duration-500 group-hover:fill-[#1c90ff]"
                    />

                    {/* Inner Content - House Symbol */}
                    <path
                        d="M35 45 L50 32 L65 45 V65 H35 V45 Z"
                        fill="white"
                        className="drop-shadow-sm"
                    />

                    {/* Window/Detail on house */}
                    <rect x="46" y="50" width="8" height="10" fill="#1877F2" rx="1" />
                </svg>
            </div>

            {/* Additional floating particles for depth */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full animate-[spin_10s_linear_infinite] opacity-30">
                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full" />
                </div>
            </div>
        </div>
    );
}
