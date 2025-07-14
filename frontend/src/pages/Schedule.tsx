import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { familyMembersApi, prescriptionsApi } from '@/services/api';

const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // For now, let's show active prescriptions as the schedule instead of medication logs
  const { data: activePrescriptions, isLoading: loadingSchedule } = useQuery(
    ['active-prescriptions'],
    () => prescriptionsApi.getAll(undefined, true)
  );

  const { data: familyMembers } = useQuery(
    ['family-members'],
    familyMembersApi.getAll
  );


  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  if (loadingSchedule) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter prescriptions that apply to the selected date and group by family member
  const applicablePrescriptions = activePrescriptions?.filter(prescription => {
    const prescriptionStartDate = new Date(prescription.startDate);
    const prescriptionEndDate = prescription.endDate ? new Date(prescription.endDate) : null;
    
    return prescriptionStartDate <= selectedDate && 
           (!prescriptionEndDate || prescriptionEndDate >= selectedDate);
  }) || [];

  const groupedPrescriptions = applicablePrescriptions.reduce((acc: Record<string, typeof applicablePrescriptions>, prescription) => {
    const memberId = prescription.familyMember.id;
    if (!acc[memberId]) {
      acc[memberId] = [];
    }
    acc[memberId].push(prescription);
    return acc;
  }, {} as Record<string, typeof applicablePrescriptions>);

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Medication Schedule
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track daily medication intake
          </p>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-medium">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              {!isToday && (
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      {applicablePrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {applicablePrescriptions.length}
                </div>
                <div className="text-sm text-gray-500">Active Prescriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(groupedPrescriptions).length}
                </div>
                <div className="text-sm text-gray-500">Family Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule by Family Member */}
      {Object.keys(groupedPrescriptions).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medications scheduled for this date.</p>
            <p className="text-sm text-gray-400 mt-2">
              Create prescriptions to see the medication schedule here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPrescriptions).map(([memberId, prescriptions]) => {
            const member = familyMembers?.find(m => m.id === memberId);
            return (
              <Card key={memberId}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {member?.name || 'Unknown Member'}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({prescriptions.length} medication{prescriptions.length !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {prescription.medication.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prescription.medication.dosage} • {prescription.medication.frequency}
                            </div>
                            <div className="text-sm text-gray-400">
                              Active prescription since {prescription.startDate}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Schedule;