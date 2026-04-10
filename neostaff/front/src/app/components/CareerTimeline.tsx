import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  MessageSquare, 
  GraduationCap, 
  Presentation,
  Users,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { CareerEvent, EventType } from '../types';
import { mockComments } from '../data/mockData';
import EventComments from './EventComments';

interface CareerTimelineProps {
  events: CareerEvent[];
  employeeId: string;
}

const eventConfig: Record<EventType, { icon: any; color: string; bgColor: string; label: string }> = {
  promotion: { icon: TrendingUp, color: 'text-[#8b7ab8]', bgColor: 'bg-[#f3f0fa]', label: 'Promotion' },
  grade_change: { icon: TrendingUp, color: 'text-[#8b7ab8]', bgColor: 'bg-[#f3f0fa]', label: 'Grade Change' },
  salary_change: { icon: DollarSign, color: 'text-[#8a98b5]', bgColor: 'bg-[#f0f2f5]', label: 'Salary Change' },
  review: { icon: Award, color: 'text-[#b8aed4]', bgColor: 'bg-[#f8f7fb]', label: 'Review' },
  certification: { icon: Award, color: 'text-[#b8aed4]', bgColor: 'bg-[#f8f7fb]', label: 'Certification' },
  one_on_one: { icon: MessageSquare, color: 'text-gray-500', bgColor: 'bg-gray-50', label: '1:1 Meeting' },
  career_talk: { icon: MessageSquare, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Career Talk' },
  training: { icon: GraduationCap, color: 'text-[#8a98b5]', bgColor: 'bg-[#f0f2f5]', label: 'Training' },
  conference: { icon: Presentation, color: 'text-[#8a98b5]', bgColor: 'bg-[#f0f2f5]', label: 'Conference' },
  team_building: { icon: Users, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Team Building' },
};

interface TimelineEventProps {
  event: CareerEvent;
}

function TimelineEvent({ event }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);
  const config = eventConfig[event.type];
  const Icon = config.icon;
  const eventComments = mockComments.filter(c => c.eventId === event.id);
  
  const isHighPriority = event.type === 'promotion' || event.type === 'grade_change';

  return (
    <div className="relative pl-8 pb-8 group">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-gray-200 to-transparent group-last:hidden" />
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} ring-4 ring-white`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Event Card */}
      <div
        className={`bg-white rounded-xl border transition-all ${
          isHighPriority 
            ? 'border-[#8b7ab8] shadow-md' 
            : 'border-gray-200 hover:border-[#b8aed4] hover:shadow-sm'
        }`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-md ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                {isHighPriority && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-[#8b7ab8] to-[#b8aed4] text-white">
                    ⭐ Important
                  </span>
                )}
              </div>
              <h3 className="font-medium text-gray-900">{event.title}</h3>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {format(new Date(event.date), 'MMM d, yyyy')}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3">{event.description}</p>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {event.tags.map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {eventComments.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8b7ab8] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{eventComments.length} {eventComments.length === 1 ? 'comment' : 'comments'}</span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expanded && (
                <div className="mt-3">
                  <EventComments comments={eventComments} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CareerTimeline({ events }: CareerTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-900 mb-6">Career Timeline</h2>
      <div>
        {sortedEvents.map(event => (
          <TimelineEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
