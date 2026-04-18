import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Calendar, ChevronLeft, ChevronRight, Users, Clock,
  CheckCircle, XCircle, AlertCircle, Save
} from 'lucide-react';

interface StaffSchedule {
  id: string;
  name: string;
  role: string;
  defaultShift: string;
  status: string;
  schedules: {
    [date: string]: {
      id: string;
      shift: string;
      status: string;
      notes: string;
    };
  };
}

interface ScheduleData {
  week: number;
  year: number;
  weekDates: string[];
  schedules: StaffSchedule[];
}

const KitchenSchedulesPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const MOCK_K_SCHED: ScheduleData = { week: 11, year: 2026, weekDates: ['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15'], schedules: [{ id: 'ks1', name: 'Chef Andi', role: 'head_chef', defaultShift: 'morning', status: 'active', schedules: { '2026-03-09': { id: 's1', shift: 'morning', status: 'confirmed', notes: '' }, '2026-03-10': { id: 's2', shift: 'morning', status: 'confirmed', notes: '' } } }, { id: 'ks2', name: 'Budi P.', role: 'sous_chef', defaultShift: 'afternoon', status: 'active', schedules: { '2026-03-09': { id: 's3', shift: 'afternoon', status: 'confirmed', notes: '' } } }] };
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(MOCK_K_SCHED);
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedCell, setSelectedCell] = useState<{
    staffId: string;
    date: string;
    shift: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const today = new Date();
      const week = Math.ceil((today.getDate() - today.getDay() + 1) / 7);
      setCurrentWeek(week);
      setCurrentYear(today.getFullYear());
    }
  }, [status]);

  useEffect(() => {
    if (currentWeek > 0) {
      fetchSchedules();
    }
  }, [currentWeek, currentYear]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/kitchen/schedules?week=${currentWeek}&year=${currentYear}`);
      const result = await response.json();
      
      if (result.success) {
        setScheduleData(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setScheduleData(MOCK_K_SCHED);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (staffId: string, date: string, shift: string) => {
    try {
      const response = await fetch('/api/kitchen/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staffId,
          date,
          shift
        })
      });

      const result = await response.json();
      
      if (result.success) {
        fetchSchedules();
        setSelectedCell(null);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const getShiftColor = (shift: string) => {
    const colors = {
      morning: 'bg-green-100 text-green-800 border-green-200',
      afternoon: 'bg-blue-100 text-blue-800 border-blue-200',
      night: 'bg-purple-100 text-purple-800 border-purple-200',
      off: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[shift as keyof typeof colors] || colors.off;
  };

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Pagi',
      afternoon: 'Siang',
      night: 'Malam',
      off: 'Off'
    };
    return labels[shift as keyof typeof labels] || 'Off';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentWeek === 1) {
        setCurrentWeek(52);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentWeek(currentWeek - 1);
      }
    } else {
      if (currentWeek === 52) {
        setCurrentWeek(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentWeek(currentWeek + 1);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      head_chef: 'bg-purple-100 text-purple-800 border-purple-200',
      sous_chef: 'bg-blue-100 text-blue-800 border-blue-200',
      line_cook: 'bg-green-100 text-green-800 border-green-200',
      prep_cook: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const labels = {
      head_chef: 'Head Chef',
      sous_chef: 'Sous Chef',
      line_cook: 'Line Cook',
      prep_cook: 'Prep Cook'
    };
    return (
      <Badge className={`${styles[role as keyof typeof styles]} border`}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <DashboardLayout>
      <Head>
        <title>Jadwal Shift | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Jadwal Shift Dapur</h1>
              <p className="text-gray-600">Kelola jadwal kerja staff dapur</p>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigateWeek('prev')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Minggu Sebelumnya
              </Button>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">Minggu {currentWeek} - {currentYear}</h3>
                <p className="text-sm text-gray-600">
                  {scheduleData?.weekDates[0] && new Date(scheduleData.weekDates[0]).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long'
                  })} - {scheduleData?.weekDates[6] && new Date(scheduleData.weekDates[6]).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigateWeek('next')}
                className="flex items-center gap-2"
              >
                Minggu Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-medium text-gray-700 sticky left-0 bg-gray-50">
                      Staff
                    </th>
                    {weekDays.map((day, index) => (
                      <th key={day} className="text-center p-4 font-medium text-gray-700 min-w-[120px]">
                        <div>{day}</div>
                        <div className="text-sm text-gray-500">
                          {scheduleData?.weekDates[index] && new Date(scheduleData.weekDates[index]).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center p-12">
                        <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto"></div>
                      </td>
                    </tr>
                  ) : (
                    scheduleData?.schedules.map((staff) => (
                      <tr key={staff.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 sticky left-0 bg-white">
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {getRoleBadge(staff.role)}
                              <Badge className={getShiftColor(staff.defaultShift)}>
                                {getShiftLabel(staff.defaultShift)}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        {scheduleData.weekDates.map((date) => {
                          const schedule = staff.schedules[date];
                          return (
                            <td key={date} className="p-2 text-center">
                              {schedule ? (
                                <Badge 
                                  className={`${getShiftColor(schedule.shift)} cursor-pointer hover:opacity-80`}
                                  onClick={() => setSelectedCell({
                                    staffId: staff.id,
                                    date,
                                    shift: schedule.shift
                                  })}
                                >
                                  {getShiftLabel(schedule.shift)}
                                </Badge>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedCell({
                                    staffId: staff.id,
                                    date,
                                    shift: staff.defaultShift
                                  })}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  +
                                </Button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-sm">Pagi (06:00-14:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-sm">Siang (14:00-22:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                <span className="text-sm">Malam (22:00-06:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                <span className="text-sm">Off</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Selection Dialog */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pilih Shift</DialogTitle>
          </DialogHeader>
          
          {selectedCell && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {scheduleData?.schedules.find(s => s.id === selectedCell.staffId)?.name} - 
                {new Date(selectedCell.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {['morning', 'afternoon', 'night', 'off'].map((shift) => (
                  <Button
                    key={shift}
                    variant={selectedCell.shift === shift ? 'default' : 'outline'}
                    className={`${getShiftColor(shift)} ${
                      selectedCell.shift === shift ? 'ring-2 ring-offset-2 ring-sky-500' : ''
                    }`}
                    onClick={() => {
                      saveSchedule(selectedCell.staffId, selectedCell.date, shift);
                    }}
                  >
                    {getShiftLabel(shift)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCell(null)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default KitchenSchedulesPage;
