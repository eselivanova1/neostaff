import { Comment } from '../types';
import { format } from 'date-fns';
import { Shield, UserCheck } from 'lucide-react';

interface EventCommentsProps {
  comments: Comment[];
}

export default function EventComments({ comments }: EventCommentsProps) {
  const getRoleIcon = (role: Comment['authorRole']) => {
    if (role === 'hr') return <Shield className="w-3 h-3 text-[#8b7ab8]" />;
    if (role === 'manager') return <UserCheck className="w-3 h-3 text-[#8a98b5]" />;
    return null;
  };

  const getRoleBadge = (role: Comment['authorRole']) => {
    if (role === 'hr') return 'HR';
    if (role === 'manager') return 'Manager';
    return null;
  };

  return (
    <div className="space-y-3">
      {comments.map(comment => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            {getRoleIcon(comment.authorRole)}
            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
            {getRoleBadge(comment.authorRole) && (
              <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md">
                {getRoleBadge(comment.authorRole)}
              </span>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {format(new Date(comment.date), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
