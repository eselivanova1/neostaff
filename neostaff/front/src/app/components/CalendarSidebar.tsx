import { useState } from 'react';
import { X, Calendar, Bell, Clock, Repeat } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { mockReminders } from '../data/mockData';

interface CalendarSidebarProps {
  onClose: () => void;
}

export default function CalendarSidebar({ onClose }: CalendarSidebarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const upcomingReminders = mockReminders
    .map(reminder => ({
      ...reminder,
      dateObj: new Date(reminder.date),
    }))
    .filter(r => r.dateObj >= new Date())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg sticky top-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#8b7ab8]" />
          <h3 className="font-medium">Reminders</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Upcoming Reminders */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {upcomingReminders.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming reminders</p>
          </div>
        ) : (
          upcomingReminders.map(reminder => (
            <div
              key={reminder.id}
              className="p-3 rounded-lg bg-gradient-to-br from-[#f8f7fb] to-white border border-gray-200 hover:border-[#b8aed4] transition-all"
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="mt-0.5">
                  {reminder.type === 'one_on_one' ? (
                    <Clock className="w-4 h-4 text-[#8b7ab8]" />
                  ) : (
                    <Calendar className="w-4 h-4 text-[#8a98b5]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {format(reminder.dateObj, 'MMM d, yyyy')}
                  </p>
                </div>
                {reminder.recurring && (
                  <Repeat className="w-3.5 h-3.5 text-[#8a98b5] flex-shrink-0" />
                )}
              </div>
              {reminder.recurring && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>Repeats every {reminder.intervalDays} days</span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Quick Stats */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">This Week</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">1:1 Meetings</span>
              <span className="font-medium text-[#8b7ab8]">
                {upcomingReminders.filter(r => r.type === 'one_on_one' && r.dateObj <= addDays(new Date(), 7)).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reviews Due</span>
              <span className="font-medium text-[#8a98b5]">
                {upcomingReminders.filter(r => r.type === 'review' && r.dateObj <= addDays(new Date(), 7)).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
