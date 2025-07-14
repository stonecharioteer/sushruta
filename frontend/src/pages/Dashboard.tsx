import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Pill, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { familyMembersApi, medicationsApi, medicationLogsApi } from '@/services/api';

const Dashboard: React.FC = () => {
  const { data: familyMembers, isLoading: loadingFamily } = useQuery(
    ['family-members'],
    familyMembersApi.getAll
  );

  const { data: medications, isLoading: loadingMedications } = useQuery(
    ['medications'],
    () => medicationsApi.getAll()
  );

  const { data: todaysSchedule, isLoading: loadingSchedule } = useQuery(
    ['todays-schedule'],
    () => medicationLogsApi.getTodaysSchedule()
  );

  const { data: complianceStats, isLoading: loadingStats } = useQuery(
    ['compliance-stats'],
    () => medicationLogsApi.getComplianceStats()
  );

  if (loadingFamily || loadingMedications || loadingSchedule || loadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Family Members',
      value: familyMembers?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/family',
    },
    {
      name: 'Medications',
      value: medications?.length || 0,
      icon: Pill,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/medications',
    },
    {
      name: "Today's Schedule",
      value: todaysSchedule?.logs?.length || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/schedule',
    },
    {
      name: 'Compliance Rate',
      value: `${complianceStats?.complianceRate || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your family medicine tracker
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link to="/schedule">
            <Button>View Today's Schedule</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
                {stat.href && (
                  <div className="absolute inset-0">
                    <Link to={stat.href} className="block h-full w-full">
                      <span className="sr-only">View {stat.name}</span>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Summary */}
      {todaysSchedule && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Medication Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-medium">{todaysSchedule.summary.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Taken:</span>
                    <span className="font-medium text-green-600">{todaysSchedule.summary.taken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Missed:</span>
                    <span className="font-medium text-red-600">{todaysSchedule.summary.missed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Pending:</span>
                    <span className="font-medium text-yellow-600">{todaysSchedule.summary.pending}</span>
                  </div>
                </div>
                <Link to="/schedule">
                  <Button variant="outline" className="w-full">
                    View Full Schedule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceStats && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {complianceStats.complianceRate}%
                    </div>
                    <div className="text-sm text-gray-500">{complianceStats.period}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Grade:</span>
                      <span className="font-medium">{complianceStats.complianceGrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Doses:</span>
                      <span className="font-medium">{complianceStats.totalLogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Taken:</span>
                      <span className="font-medium">{complianceStats.takenCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Missed:</span>
                      <span className="font-medium">{complianceStats.missedCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/family/new">
              <Button variant="outline" className="w-full">
                Add Family Member
              </Button>
            </Link>
            <Link to="/medications/new">
              <Button variant="outline" className="w-full">
                Add Medication
              </Button>
            </Link>
            <Link to="/prescriptions/new">
              <Button variant="outline" className="w-full">
                New Prescription
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="outline" className="w-full">
                Log Medication
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;