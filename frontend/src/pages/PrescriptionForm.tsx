import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { prescriptionsApi, familyMembersApi, medicationsApi } from '@/services/api';
import type { CreatePrescriptionRequest } from '@/types/api';

const PrescriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  // Get query parameters
  const preselectedMedicationId = searchParams.get('medicationId');
  const preselectedFamilyMemberId = searchParams.get('familyMemberId');

  const [formData, setFormData] = useState<CreatePrescriptionRequest>({
    familyMemberId: preselectedFamilyMemberId || '',
    medicationId: preselectedMedicationId || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data for dropdowns
  const { data: familyMembers, isLoading: familyMembersLoading } = useQuery(
    ['family-members'],
    familyMembersApi.getAll
  );

  const { data: medications, isLoading: medicationsLoading } = useQuery(
    ['medications'],
    () => medicationsApi.getAll()
  );

  // Fetch prescription data for editing
  const { data: prescriptionData, isLoading } = useQuery(
    ['prescription', id],
    () => prescriptionsApi.getById(id!),
    {
      enabled: isEditing,
    }
  );

  // Update form data when prescription data is loaded
  React.useEffect(() => {
    if (prescriptionData && isEditing) {
      setFormData({
        familyMemberId: prescriptionData.familyMember.id,
        medicationId: prescriptionData.medication.id,
        startDate: prescriptionData.startDate.split('T')[0],
        endDate: prescriptionData.endDate ? prescriptionData.endDate.split('T')[0] : '',
        active: prescriptionData.active,
      });
    }
  }, [prescriptionData, isEditing]);

  // Debug logging
  React.useEffect(() => {
    console.log('PrescriptionForm Debug:', {
      familyMembers,
      medications,
      familyMembersLoading,
      medicationsLoading,
      familyMembersCount: familyMembers?.length || 0,
      medicationsCount: medications?.length || 0,
      preselectedMedicationId,
      preselectedFamilyMemberId,
      currentFormData: formData,
    });
  }, [familyMembers, medications, familyMembersLoading, medicationsLoading, preselectedMedicationId, preselectedFamilyMemberId, formData]);

  const createMutation = useMutation({
    mutationFn: prescriptionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      navigate('/prescriptions');
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreatePrescriptionRequest>) => prescriptionsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', id] });
      navigate('/prescriptions');
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleInputChange = (field: keyof CreatePrescriptionRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.familyMemberId) {
      newErrors.familyMemberId = 'Family member is required';
    }

    if (!formData.medicationId) {
      newErrors.medicationId = 'Medication is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      endDate: formData.endDate || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {isEditing ? 'Edit Prescription' : 'Add New Prescription'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyMemberId">Family Member *</Label>
                <select
                  id="familyMemberId"
                  value={formData.familyMemberId}
                  onChange={(e) => handleInputChange('familyMemberId', e.target.value)}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    errors.familyMemberId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">
                    {familyMembersLoading ? 'Loading family members...' : 
                     !familyMembers?.length ? 'No family members available' : 
                     'Select family member'}
                  </option>
                  {familyMembers?.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.type})
                    </option>
                  ))}
                </select>
                {errors.familyMemberId && <p className="text-sm text-red-500 mt-1">{errors.familyMemberId}</p>}
              </div>

              <div>
                <Label htmlFor="medicationId">Medication *</Label>
                <select
                  id="medicationId"
                  value={formData.medicationId}
                  onChange={(e) => handleInputChange('medicationId', e.target.value)}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                    errors.medicationId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">
                    {medicationsLoading ? 'Loading medications...' : 
                     !medications?.length ? 'No medications available' : 
                     'Select medication'}
                  </option>
                  {medications && medications.map((medication) => (
                    <option key={medication.id} value={medication.id}>
                      {medication.name} - {medication.dosage}
                    </option>
                  ))}
                </select>
                {errors.medicationId && <p className="text-sm text-red-500 mt-1">{errors.medicationId}</p>}
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="active"
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <Label htmlFor="active" className="ml-2">
                Active prescription
              </Label>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading ? 'Saving...' : isEditing ? 'Update Prescription' : 'Add Prescription'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/prescriptions')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionForm;