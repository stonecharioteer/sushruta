import React from 'react';
import { Gender } from '@/types/api';

interface GenderIconProps {
  gender: Gender;
  size?: number;
  className?: string;
}

export const MaleIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`text-blue-500 ${className}`}
  >
    <path 
      d="M10 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
      fill="currentColor"
    />
    <path 
      d="M15.5 8.5L19 5m0 0h-3m3 0v3" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const FemaleIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`text-pink-500 ${className}`}
  >
    <path 
      d="M12 2a4 4 0 100 8 4 4 0 000-8zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
      fill="currentColor"
    />
    <path 
      d="M12 14v6m-2-2h4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const GenderIcon: React.FC<GenderIconProps> = ({ gender, size = 20, className = '' }) => {
  switch (gender) {
    case Gender.MALE:
      return <MaleIcon size={size} className={className} />;
    case Gender.FEMALE:
      return <FemaleIcon size={size} className={className} />;
    default:
      return null;
  }
};