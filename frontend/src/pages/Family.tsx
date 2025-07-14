import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, User, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IconDisplay from '@/components/ui/IconDisplay';
import { familyMembersApi } from '@/services/api';
import { FamilyMember, MemberType } from '@/types/api';

const Family: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingMember, setDeletingMember] = useState<string | null>(null);

  const { data: familyMembers, isLoading, error } = useQuery(
    ['family-members'],
    familyMembersApi.getAll
  );

  const deleteMutation = useMutation(
    familyMembersApi.delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['family-members']);
        setDeletingMember(null);
      },
      onError: (error) => {
        console.error('Error deleting family member:', error);
        setDeletingMember(null);
      }
    }
  );

  const handleDelete = (member: FamilyMember) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      setDeletingMember(member.id);
      deleteMutation.mutate(member.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading family members. Please try again.
        </div>
      </div>
    );
  }

  const humans = familyMembers?.filter(member => member.type === MemberType.HUMAN) || [];
  const pets = familyMembers?.filter(member => member.type === MemberType.PET) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Family Members
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your family members (both humans and pets)
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link to="/family/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Humans Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Humans ({humans.length})
        </h2>
        {humans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No humans added yet.</p>
              <Link to="/family/new" className="mt-4 inline-block">
                <Button variant="outline">Add First Human</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {humans.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                          <IconDisplay familyMember={member} size={16} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {member.dateOfBirth && (
                            <>Born: {new Date(member.dateOfBirth).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Link to={`/family/${member.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(member)}
                        loading={deletingMember === member.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {member.notes && (
                    <p className="mt-3 text-sm text-gray-600">{member.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pets Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-pink-600" />
          Pets ({pets.length})
        </h2>
        {pets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pets added yet.</p>
              <Link to="/family/new" className="mt-4 inline-block">
                <Button variant="outline">Add First Pet</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                          <IconDisplay familyMember={member} size={16} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {member.dateOfBirth && (
                            <>Born: {new Date(member.dateOfBirth).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Link to={`/family/${member.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(member)}
                        loading={deletingMember === member.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {member.notes && (
                    <p className="mt-3 text-sm text-gray-600">{member.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Family;