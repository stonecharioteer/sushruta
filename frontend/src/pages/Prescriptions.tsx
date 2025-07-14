import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Trash2, User, Pill, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { prescriptionsApi } from '@/services/api';
import { Prescription } from '@/types/api';

const Prescriptions: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingPrescription, setDeletingPrescription] = useState<string | null>(null);

  const { data: prescriptions, isLoading, error } = useQuery(
    ['prescriptions'],
    () => prescriptionsApi.getAll()
  );

  const deleteMutation = useMutation(
    prescriptionsApi.delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['prescriptions']);
        setDeletingPrescription(null);
      },
      onError: (error) => {
        console.error('Error deleting prescription:', error);
        setDeletingPrescription(null);
      }
    }
  );

  const deactivateMutation = useMutation(
    prescriptionsApi.deactivate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['prescriptions']);
      },
      onError: (error) => {
        console.error('Error deactivating prescription:', error);
      }
    }
  );

  const handleDelete = (prescription: Prescription) => {
    if (window.confirm(`Are you sure you want to delete the prescription for ${prescription.familyMember.name}?`)) {
      setDeletingPrescription(prescription.id);
      deleteMutation.mutate(prescription.id);
    }
  };

  const handleToggleActive = (prescription: Prescription) => {
    if (prescription.active) {
      deactivateMutation.mutate(prescription.id);
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
          Error loading prescriptions. Please try again.
        </div>
      </div>
    );
  }

  const activePrescriptions = prescriptions?.filter(p => p.active) || [];
  const inactivePrescriptions = prescriptions?.filter(p => !p.active) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Prescriptions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage prescriptions for family members
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link to="/prescriptions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Prescription
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Prescriptions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Pill className="h-5 w-5 mr-2 text-green-600" />
          Active Prescriptions ({activePrescriptions.length})
        </h2>
        {activePrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No active prescriptions yet.</p>
              <Link to="/prescriptions/new">
                <Button variant="outline">Add First Prescription</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {prescription.familyMember.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {prescription.medication.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleActive(prescription)}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(prescription)}
                        loading={deletingPrescription === prescription.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">
                      <p><strong>Dosage:</strong> {prescription.medication.dosage}</p>
                      <p><strong>Frequency:</strong> {prescription.medication.frequency}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Started: {new Date(prescription.startDate).toLocaleDateString()}
                    {prescription.endDate && (
                      <span className="ml-2">
                        - Ends: {new Date(prescription.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Prescriptions */}
      {inactivePrescriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-gray-400" />
            Inactive Prescriptions ({inactivePrescriptions.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactivePrescriptions.map((prescription) => (
              <Card key={prescription.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {prescription.familyMember.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {prescription.medication.name}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(prescription)}
                      loading={deletingPrescription === prescription.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">
                      <p><strong>Dosage:</strong> {prescription.medication.dosage}</p>
                      <p><strong>Frequency:</strong> {prescription.medication.frequency}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Started: {new Date(prescription.startDate).toLocaleDateString()}
                    {prescription.endDate && (
                      <span className="ml-2">
                        - Ended: {new Date(prescription.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {prescriptions?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total Prescriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activePrescriptions.length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {inactivePrescriptions.length}
              </div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prescriptions;