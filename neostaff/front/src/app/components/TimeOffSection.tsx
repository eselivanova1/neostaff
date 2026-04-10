import { useState } from 'react';
import { Calendar as CalendarIcon, List, Plane, Home, Heart, Clock } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, getDay } from 'date-fns';
import { TimeOff, TimeOffType } from '../types';

interface TimeOffSectionProps {
  timeOffRecords: TimeOff[];
  employeeId: string;
}

const timeOffConfig: Record<TimeOffType, { icon: any; color: string; bgColor: string; label: string }> = {
  vacation: { icon: Plane, color: 'text-[#8b7ab8]', bgColor: 'bg-[#f8f7fb]', label: 'Vacation' },
  day_off: { icon: Home, color: 'text-[#8a98b5]', bgColor: 'bg-[#f0f2f5]', label: 'Day Off' },
  sick_leave: { icon: Heart, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Sick Leave' },
};

export default function TimeOffSection({ timeOffRecords, employeeId }: TimeOffSectionProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const sortedRecords = [...timeOffRecords].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const upcomingRecords = sortedRecords.filter(r => new Date(r.startDate) >= new Date());
  const pastRecords = sortedRecords.filter(r => new Date(r.endDate) < new Date());

  // Calculate stats
  const totalDaysThisYear = timeOffRecords
    .filter(r => {
      const year = new Date(r.startDate).getFullYear();
      return year === new Date().getFullYear() && r.status === 'approved';
    })
    .reduce((sum, r) => sum + r.days, 0);

  const vacationDays = timeOffRecords
    .filter(r => r.type === 'vacation' && r.status === 'approved' && new Date(r.startDate).getFullYear() === new Date().getFullYear())
    .reduce((sum, r) => sum + r.days, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#f8f7fb] to-white border border-[#b8aed4] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b7ab8] to-[#b8aed4] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900">{totalDaysThisYear}</p>
              <p className="text-sm text-gray-600">Total days off (2024)</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#f0f2f5] flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#8b7ab8]" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900">{vacationDays}</p>
              <p className="text-sm text-gray-600">Vacation days used</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#f0f2f5] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#8a98b5]" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900">{upcomingRecords.length}</p>
              <p className="text-sm text-gray-600">Upcoming time off</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">Time Off History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#8b7ab8] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm">List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#8b7ab8] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm">Calendar</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {viewMode === 'list' ? (
            <TimeOffList upcomingRecords={upcomingRecords} pastRecords={pastRecords} />
          ) : (
            <TimeOffCalendar
              timeOffRecords={timeOffRecords}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TimeOffListProps {
  upcomingRecords: TimeOff[];
  pastRecords: TimeOff[];
}

function TimeOffList({ upcomingRecords, pastRecords }: TimeOffListProps) {
  return (
    <div className="space-y-6">
      {/* Upcoming */}
      {upcomingRecords.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcomingRecords.map(record => (
              <TimeOffListItem key={record.id} record={record} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {pastRecords.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Past</h3>
          <div className="space-y-2">
            {pastRecords.map(record => (
              <TimeOffListItem key={record.id} record={record} />
            ))}
          </div>
        </div>
      )}

      {upcomingRecords.length === 0 && pastRecords.length === 0 && (
        <div className="text-center py-12">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No time off records</p>
        </div>
      )}
    </div>
  );
}

function TimeOffListItem({ record }: { record: TimeOff }) {
  const config = timeOffConfig[record.type];
  const Icon = config.icon;
  const startDate = parseISO(record.startDate);
  const endDate = parseISO(record.endDate);
  const isSingleDay = record.days === 1;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#b8aed4] transition-all">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{config.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md ${
                  record.status === 'approved' 
                    ? 'bg-green-100 text-green-700'
                    : record.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {record.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {isSingleDay
                  ? format(startDate, 'MMM d, yyyy')
                  : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`}
              </p>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {record.days} {record.days === 1 ? 'day' : 'days'}
            </span>
          </div>
          {record.notes && (
            <p className="text-sm text-gray-600">{record.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface TimeOffCalendarProps {
  timeOffRecords: TimeOff[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

function TimeOffCalendar({ timeOffRecords, currentMonth, onMonthChange }: TimeOffCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get all days with time off
  const timeOffDays = new Map<string, TimeOff[]>();
  timeOffRecords.forEach(record => {
    const days = eachDayOfInterval({
      start: parseISO(record.startDate),
      end: parseISO(record.endDate),
    });
    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      if (!timeOffDays.has(key)) {
        timeOffDays.set(key, []);
      }
      timeOffDays.get(key)!.push(record);
    });
  });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Previous
        </button>
        <h3 className="font-medium text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for first week */}
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTimeOff = timeOffDays.get(dateKey) || [];
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateKey}
              className={`aspect-square p-1 rounded-lg border transition-all ${
                isToday
                  ? 'border-[#8b7ab8] bg-[#f8f7fb]'
                  : dayTimeOff.length > 0
                  ? 'border-[#b8aed4] bg-gradient-to-br from-[#f8f7fb] to-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-900 mb-0.5">{format(day, 'd')}</div>
              {dayTimeOff.length > 0 && (
                <div className="space-y-0.5">
                  {dayTimeOff.slice(0, 2).map((record, idx) => {
                    const config = timeOffConfig[record.type];
                    return (
                      <div
                        key={idx}
                        className={`w-full h-1 rounded-full ${
                          record.type === 'vacation'
                            ? 'bg-[#8b7ab8]'
                            : record.type === 'day_off'
                            ? 'bg-[#8a98b5]'
                            : 'bg-gray-400'
                        }`}
                      />
                    );
                  })}
                  {dayTimeOff.length > 2 && (
                    <div className="text-[8px] text-gray-500">+{dayTimeOff.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8b7ab8]" />
          <span className="text-xs text-gray-600">Vacation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8a98b5]" />
          <span className="text-xs text-gray-600">Day Off</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-600">Sick Leave</span>
        </div>
      </div>
    </div>
  );
}
