import React from 'react';
import { FamilyMember, MemberType } from '@/types/api';
import { GenderIcon, SpeciesIcon } from '@/components/icons';
import { User, Heart } from 'lucide-react';

interface IconDisplayProps {
  familyMember: FamilyMember;
  showLabels?: boolean;
  size?: number;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({ 
  familyMember, 
  showLabels = false,
  size = 20 
}) => {
  const { type, gender, species } = familyMember;

  return (
    <div className="flex items-center gap-2">
      {/* Member Type Icon */}
      <div className="flex items-center gap-1">
        {type === MemberType.HUMAN ? (
          <User size={size} className="text-gray-600" />
        ) : (
          <Heart size={size} className="text-red-500" />
        )}
        {showLabels && (
          <span className="text-sm text-gray-600 capitalize">
            {type}
          </span>
        )}
      </div>

      {/* Gender Icon */}
      {gender && (
        <div className="flex items-center gap-1">
          <GenderIcon gender={gender} size={size} />
          {showLabels && (
            <span className="text-sm text-gray-600 capitalize">
              {gender}
            </span>
          )}
        </div>
      )}

      {/* Species Icon (only for pets) */}
      {type === MemberType.PET && species && (
        <div className="flex items-center gap-1">
          <SpeciesIcon species={species} size={size} />
          {showLabels && (
            <span className="text-sm text-gray-600 capitalize">
              {species}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default IconDisplay;