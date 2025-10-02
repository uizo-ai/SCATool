// components/Logo.tsx
"use client";
import { useState } from "react";

interface LogoProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function Logo({ src, alt, className = "w-8 h-8 object-contain", fallbackIcon }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        {fallbackIcon || (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
