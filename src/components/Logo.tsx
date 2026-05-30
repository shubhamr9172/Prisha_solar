import React from 'react';

interface LogoProps {
  lightMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ lightMode = true, size = 'md' }: LogoProps) {
  // Height sizing based on prop
  const height = size === 'sm' ? 44 : size === 'lg' ? 110 : 76;

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        userSelect: 'none' 
      }}
    >
      <img 
        src={lightMode ? "/logo.png" : "/logo_dark.png"} 
        alt="Prisha Enterprises Logo" 
        style={{ 
          height: `${height}px`,
          width: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
}
