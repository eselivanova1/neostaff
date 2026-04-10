import { X, Calendar, Briefcase } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Employee, CareerEvent } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  MessageSquare, 
  GraduationCap, 
  Presentation,
  Users
} from 'lucide-react';

interface CareerJourneyViewProps {
  employee: Employee;
  events: CareerEvent[];
  onClose: () => void;
}

const eventIcons: Record<string, any> = {
  promotion: TrendingUp,
  grade_change: TrendingUp,
  salary_change: DollarSign,
  review: Award,
  certification: Award,
  one_on_one: MessageSquare,
  career_talk: MessageSquare,
  training: GraduationCap,
  conference: Presentation,
  team_building: Users,
};

export default function CareerJourneyView({ employee, events, onClose }: CareerJourneyViewProps) {
  const hireDate = new Date(employee.hireDate);
  const today = new Date();
  const totalDays = differenceInDays(today, hireDate);
  const totalYears = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;

  // Фильтруем только ключевые карьерные события
  const filteredEvents = events.filter(e => ['promotion', 'termination', 'transfer'].includes(e.type));

  // Создаем обновленную временную шкалу
  const timelineEvents = [
    {
      id: 'hire',
      date: employee.hireDate,
      title: 'Joined Company',
      description: `Started as ${employee.position}`,
      type: 'hire',
      isSpecial: true,
    },
    ...filteredEvents.map(e => ({
      ...e,
      isSpecial: e.type === 'promotion' || e.type === 'transfer',
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#f8f7fb] to-white">
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-1">Career Journey</h2>
            <p className="text-gray-600">
              {employee.name} • {totalYears} {totalYears === 1 ? 'year' : 'years'} {remainingDays} days at company
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Starting Point */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b7ab8] to-[#b8aed4] flex items-center justify-center text-white flex-shrink-0 shadow-lg">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="flex-1 bg-gradient-to-br from-[#f8f7fb] to-white border border-[#b8aed4] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#8b7ab8]" />
                <span className="text-sm text-gray-600">{format(hireDate, 'MMMM d, yyyy')}</span>
              </div>
              <h3 className="font-medium text-lg text-gray-900 mb-1">Started at Company</h3>
              <p className="text-gray-600">Position: {employee.position}</p>
              <p className="text-gray-600">Department: {employee.department}</p>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#b8aed4] via-[#d4cce6] to-transparent" />

            <div className="space-y-6">
              {timelineEvents.slice(1).map((event, idx) => {
                const Icon = eventIcons[event.type] || MessageSquare;
                const isImportant = event.isSpecial;

                return (
                  <div key={event.id} className="relative pl-20">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-4 top-3 w-8 h-8 rounded-full flex items-center justify-center ${
                        isImportant
                          ? 'bg-gradient-to-br from-[#8b7ab8] to-[#b8aed4] text-white shadow-md'
                          : 'bg-white border-2 border-[#d4cce6] text-[#8a98b5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Event card */}
                    <div
                      className={`rounded-xl p-4 transition-all ${
                        isImportant
                          ? 'bg-gradient-to-br from-[#f8f7fb] to-white border-2 border-[#8b7ab8] shadow-md'
                          : 'bg-white border border-gray-200 hover:border-[#b8aed4]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              {format(new Date(event.date), 'MMM d, yyyy')}
                            </span>
                            {isImportant && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-[#8b7ab8] to-[#b8aed4] text-white">
                                ⭐ Milestone
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                          Day {differenceInDays(new Date(event.date), hireDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Day Marker */}
          <div className="relative pl-20 mt-8">
            <div className="absolute left-4 top-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#8a98b5] to-[#a4b0c8] flex items-center justify-center shadow-md">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gradient-to-br from-[#f0f2f5] to-white border border-[#8a98b5] rounded-xl p-4">
              <span className="text-xs text-gray-500">Today • {format(today, 'MMMM d, yyyy')}</span>
              <p className="font-medium text-gray-900 mt-1">Current Role: {employee.position}</p>
              <p className="text-sm text-gray-600">
                {totalYears} {totalYears === 1 ? 'year' : 'years'} and {remainingDays} days of growth
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total career events: {events.length}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#8b7ab8] text-white rounded-lg hover:bg-[#7a6aa0] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
