import React from 'react';

export default function Avatar({ name, size = "md" }) {
  // 1. Extract up to 2 initials
  const getInitials = (name) => {
    if (!name) return "U"; // Default to U for Unknown
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // 2. Pick a consistent color from a professional palette based on their name
  const getColorClass = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-[#2C7FFF]', // Your brand blue
      'bg-purple-500', 
      'bg-emerald-500', 
      'bg-orange-500', 
      'bg-pink-500', 
      'bg-teal-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // 3. Handle different sizes depending on where you put it
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-20 h-20 text-3xl",
  };

  return (
    <div className={`${sizeClasses[size]} ${getColorClass(name)} text-white font-bold rounded-full flex items-center justify-center shrink-0 shadow-sm`}>
      {getInitials(name)}
    </div>
  );
}