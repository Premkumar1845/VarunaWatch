'use client';

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 38,
  className = '',
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${
        glow ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="VarunaWatch Shield Logo"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
};
