import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationsApi } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import type { CreateMedicationRequest } from '@/types/api';

const MedicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing data if editing
  const { isLoading } = useQuery(
    ['medication', id],
    () => medicationsApi.getById(id!),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          dosage: data.dosage || '',
          frequency: data.frequency || '',
          instructions: data.instructions || ''
        });
      }
    }
  );

  const createMutation = useMutation(medicationsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      navigate('/medications');
    },
    onError: (error: Error) => {
      console.error('Error creating medication:', error.message);
      setErrors({ submit: 'Failed to create medication' });
    }
  });

  const updateMutation = useMutation(
    (data: Partial<CreateMedicationRequest>) => medicationsApi.update(id!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['medications']);
        queryClient.invalidateQueries(['medication', id]);
        navigate('/medications');
      },
      onError: (error: Error) => {
        console.error('Error updating medication:', error.message);
        setErrors({ submit: 'Failed to update medication' });
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (!formData.frequency.trim()) {
      newErrors.frequency = 'Frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency.trim(),
      ...(formData.instructions.trim() && { instructions: formData.instructions.trim() })
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoading && isEditing) {
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
          {isEditing ? 'Edit Medication' : 'Add Medication'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEditing ? 'Update medication information' : 'Add a new medication to your inventory'}
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
                placeholder="e.g., Ibuprofen"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <Input
                  id="dosage"
                  name="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 200mg"
                  className={errors.dosage ? 'border-red-500' : ''}
                />
                {errors.dosage && (
                  <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
                )}
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <Input
                  id="frequency"
                  name="frequency"
                  type="text"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  placeholder="e.g., Twice daily, Every 8 hours"
                  className={errors.frequency ? 'border-red-500' : ''}
                />
                {errors.frequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="Special instructions for taking this medication (optional)"
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
                onClick={() => navigate('/medications')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isLoading || updateMutation.isLoading}
              >
                {isEditing ? 'Update Medication' : 'Add Medication'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationForm;