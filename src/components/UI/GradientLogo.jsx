import React from "react";

export default function GradientLogo({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}>
      <svg
        className="w-3/4 h-3/4 text-white drop-shadow-sm"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        {/* TaskFlow Logo - Checkmark + Flow */}
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        <path d="M8 8h8v2H8V8zm0 4h6v2H8v-2z" opacity="0.3" />
      </svg>
    </div>
  );
}
