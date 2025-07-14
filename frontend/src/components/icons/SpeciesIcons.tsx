import React from 'react';
import { Species } from '@/types/api';

interface SpeciesIconProps {
  species: Species;
  size?: number;
  className?: string;
}

export const CatIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`text-orange-500 ${className}`}
  >
    {/* Cat head */}
    <path 
      d="M12 4c-4 0-7 2.5-7 6 0 2 1 3.5 2.5 4.5L6 18h12l-1.5-3.5C18 13.5 19 12 19 10c0-3.5-3-6-7-6z" 
      fill="currentColor"
    />
    {/* Cat ears */}
    <path 
      d="M8 4l-2-2 1.5-1L10 3.5M16 4l2-2-1.5-1L14 3.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Cat eyes */}
    <circle cx="10" cy="8" r="1" fill="white" />
    <circle cx="14" cy="8" r="1" fill="white" />
    {/* Cat nose */}
    <path 
      d="M12 10l-1 1h2l-1-1z" 
      fill="white"
    />
    {/* Cat mouth */}
    <path 
      d="M12 11c-1 0-1.5 0.5-1.5 1M12 11c1 0 1.5 0.5 1.5 1" 
      stroke="white" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
    {/* Whiskers */}
    <path 
      d="M6 9h2M6 10h2M18 9h-2M18 10h-2" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
  </svg>
);

export const DogIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`text-amber-600 ${className}`}
  >
    {/* Dog head */}
    <path 
      d="M12 4c-4 0-7 2.5-7 6 0 2 1 3.5 2.5 4.5L6 18h12l-1.5-3.5C18 13.5 19 12 19 10c0-3.5-3-6-7-6z" 
      fill="currentColor"
    />
    {/* Dog ears - floppy */}
    <path 
      d="M8 4c-1 0-2 1-2 2v3c0 1 1 2 2 2M16 4c1 0 2 1 2 2v3c0 1-1 2-2 2" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Dog eyes */}
    <circle cx="10" cy="8" r="1" fill="white" />
    <circle cx="14" cy="8" r="1" fill="white" />
    {/* Dog nose */}
    <circle cx="12" cy="10" r="1" fill="black" />
    {/* Dog mouth */}
    <path 
      d="M12 11v2M10 13c1 1 2 1 3 0" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Dog tongue */}
    <path 
      d="M12 13c0 1 0 2 0 3" 
      stroke="pink" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

export const SpeciesIcon: React.FC<SpeciesIconProps> = ({ species, size = 20, className = '' }) => {
  switch (species) {
    case Species.CAT:
      return <CatIcon size={size} className={className} />;
    case Species.DOG:
      return <DogIcon size={size} className={className} />;
    default:
      return null;
  }
};