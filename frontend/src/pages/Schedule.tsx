import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicationLogsApi, familyMembersApi } from '@/services/api';
import { MedicationLogStatus, MedicationLog } from '@/types/api';

const Schedule: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [updatingLog, setUpdatingLog] = useState<string | null>(null);

  const { data: schedule, isLoading: loadingSchedule } = useQuery(
    ['schedule', format(selectedDate, 'yyyy-MM-dd')],
    () => medicationLogsApi.getScheduleForDate(format(selectedDate, 'yyyy-MM-dd'))
  );

  const { data: familyMembers } = useQuery(
    ['family-members'],
    familyMembersApi.getAll
  );

  const updateLogMutation = useMutation(
    ({ logId, status }: { logId: string; status: MedicationLogStatus }) =>
      medicationLogsApi.updateStatus(logId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['schedule']);
        queryClient.invalidateQueries(['todays-schedule']);
        queryClient.invalidateQueries(['compliance-stats']);
        setUpdatingLog(null);
      },
      onError: (error) => {
        console.error('Error updating medication log:', error);
        setUpdatingLog(null);
      }
    }
  );

  const handleStatusUpdate = (logId: string, status: MedicationLogStatus) => {
    setUpdatingLog(logId);
    updateLogMutation.mutate({ logId, status });
  };

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

  const getStatusColor = (status: MedicationLogStatus) => {
    switch (status) {
      case MedicationLogStatus.TAKEN:
        return 'text-green-600 bg-green-100';
      case MedicationLogStatus.MISSED:
        return 'text-red-600 bg-red-100';
      case MedicationLogStatus.SKIPPED:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: MedicationLogStatus) => {
    switch (status) {
      case MedicationLogStatus.TAKEN:
        return <Check className="h-4 w-4" />;
      case MedicationLogStatus.MISSED:
        return <X className="h-4 w-4" />;
      case MedicationLogStatus.SKIPPED:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const groupedLogs = schedule?.logs?.reduce((acc: Record<string, MedicationLog[]>, log: MedicationLog) => {
    const memberId = log.prescription.familyMemberId;
    if (!acc[memberId]) {
      acc[memberId] = [];
    }
    acc[memberId].push(log);
    return acc;
  }, {} as Record<string, MedicationLog[]>) || {};

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
      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {schedule.summary.total}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {schedule.summary.taken}
                </div>
                <div className="text-sm text-gray-500">Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {schedule.summary.missed}
                </div>
                <div className="text-sm text-gray-500">Missed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {schedule.summary.pending}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule by Family Member */}
      {Object.keys(groupedLogs).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medications scheduled for this date.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([memberId, logs]: [string, MedicationLog[]]) => {
            const member = familyMembers?.find(m => m.id === memberId);
            return (
              <Card key={memberId}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {member?.name || 'Unknown Member'}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({logs.length} medication{logs.length !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logs
                      .sort((a: MedicationLog, b: MedicationLog) => a.scheduledTime.localeCompare(b.scheduledTime))
                      .map((log: MedicationLog) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${getStatusColor(log.status)}`}>
                              {getStatusIcon(log.status)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {log.prescription.medication.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.dosage} • {format(new Date(`2000-01-01T${log.scheduledTime}`), 'h:mm a')}
                              </div>
                              {log.notes && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {log.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {log.status === MedicationLogStatus.PENDING && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(log.id, MedicationLogStatus.TAKEN)}
                                  loading={updatingLog === log.id}
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  <Check className="h-4 w-4" />
                                  Taken
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(log.id, MedicationLogStatus.MISSED)}
                                  loading={updatingLog === log.id}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                  Missed
                                </Button>
                              </>
                            )}
                            {log.status !== MedicationLogStatus.PENDING && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(log.id, MedicationLogStatus.PENDING)}
                                loading={updatingLog === log.id}
                              >
                                Reset
                              </Button>
                            )}
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