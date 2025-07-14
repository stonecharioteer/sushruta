import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Pill, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicationsApi } from '@/services/api';
import { Medication } from '@/types/api';

const Medications: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingMedication, setDeletingMedication] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: medications, isLoading, error } = useQuery(
    ['medications'],
    () => medicationsApi.getAll()
  );

  const deleteMutation = useMutation(
    medicationsApi.delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['medications']);
        setDeletingMedication(null);
      },
      onError: (error) => {
        console.error('Error deleting medication:', error);
        setDeletingMedication(null);
      }
    }
  );

  const handleDelete = (medication: Medication) => {
    if (window.confirm(`Are you sure you want to delete ${medication.name}?`)) {
      setDeletingMedication(medication.id);
      deleteMutation.mutate(medication.id);
    }
  };

  const filteredMedications = medications?.filter(medication =>
    medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.frequency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          Error loading medications. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Medications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your medication inventory
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link to="/medications/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Medications List */}
      {filteredMedications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No medications found matching your search.' : 'No medications added yet.'}
            </p>
            {!searchTerm && (
              <Link to="/medications/new" className="mt-4 inline-block">
                <Button variant="outline">Add First Medication</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMedications.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        {medication.name}
                      </h3>
                      <p className="text-sm text-gray-600">{medication.dosage}</p>
                      <p className="text-xs text-gray-500">{medication.frequency}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link to={`/medications/${medication.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(medication)}
                      loading={deletingMedication === medication.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {medication.instructions && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {medication.instructions}
                  </p>
                )}

                <div className="mt-3 flex justify-between items-center">
                  <Link to={`/medications/${medication.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/prescriptions/new?medicationId=${medication.id}`}>
                    <Button size="sm">
                      Prescribe
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {medications?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total Medications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {medications?.reduce((sum, m) => sum + m.activePrescriptionsCount, 0) || 0}
              </div>
              <div className="text-sm text-gray-500">Active Prescriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {new Set(medications?.map(m => m.frequency)).size || 0}
              </div>
              <div className="text-sm text-gray-500">Dosing Frequencies</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Medications;