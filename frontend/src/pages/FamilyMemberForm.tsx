import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyMembersApi } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import type { CreateFamilyMemberRequest } from '@/types/api';
import { MemberType } from '@/types/api';

const FamilyMemberForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: MemberType.HUMAN,
    dateOfBirth: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing data if editing
  const { isLoading } = useQuery(
    ['family-member', id],
    () => familyMembersApi.getById(id!),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          type: data.type || MemberType.HUMAN,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          notes: data.notes || ''
        });
      }
    }
  );

  const createMutation = useMutation(familyMembersApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['family-members']);
      navigate('/family');
    },
    onError: (error: Error) => {
      console.error('Error creating family member:', error.message);
      setErrors({ submit: 'Failed to create family member' });
    }
  });

  const updateMutation = useMutation(
    (data: Partial<CreateFamilyMemberRequest>) => familyMembersApi.update(id!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['family-members']);
        queryClient.invalidateQueries(['family-member', id]);
        navigate('/family');
      },
      onError: (error: Error) => {
        console.error('Error updating family member:', error.message);
        setErrors({ submit: 'Failed to update family member' });
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be less than 255 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (formData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter a valid date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      name: formData.name.trim(),
      type: formData.type,
      ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
      ...(formData.notes.trim() && { notes: formData.notes.trim() })
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Family Member' : 'Add Family Member'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEditing ? 'Update family member information' : 'Add a new family member or pet'}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                  errors.type ? 'border-red-500' : ''
                }`}
              >
                <option value="human">Human</option>
                <option value="pet">Pet</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes (optional)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/family')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isLoading || updateMutation.isLoading}
              >
                {isEditing ? 'Update Family Member' : 'Add Family Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyMemberForm;