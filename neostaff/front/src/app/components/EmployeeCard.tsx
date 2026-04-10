import { Employee } from '../types';
import { Building2, Calendar, User, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
  currentUserRole?: string;
  currentUserLevel?: number;
}

export default function EmployeeCard({ employee, onClick, currentUserRole, currentUserLevel }: EmployeeCardProps) {
  const hireDate = new Date(employee.hire_date);
  const tenure = Math.floor(
    (new Date().getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  const canSeeEmployeeId = !currentUserLevel || employee.hierarchy_level <= currentUserLevel;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#b8aed4] transition-all cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {employee.photo_url ? (
            <img
              src={employee.photo_url}
              alt={`${employee.first_name} ${employee.last_name}`}
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#b8aed4] to-[#8b7ab8] flex items-center justify-center text-white font-medium text-lg">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-[#8b7ab8] transition-colors">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-sm text-gray-600">{employee.position}</p>
              {canSeeEmployeeId && (
                <p className="text-xs text-gray-400 font-mono">ID: {employee.employee_id}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!employee.is_active && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-md">
                  Уволен
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-md ${
                employee.role === 'hr' ? 'bg-blue-100 text-blue-600' :
                employee.role === 'manager' ? 'bg-green-100 text-green-600' :
                employee.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <Shield className="w-3 h-3 inline mr-1" />
                {employee.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{tenure} {tenure === 1 ? 'год' : tenure < 5 ? 'года' : 'лет'}</span>
            </div>
            {!employee.is_active && employee.termination_date && (
              <div className="flex items-center gap-1 text-red-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Уволен {format(new Date(employee.termination_date), 'MMM yyyy')}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{employee.about}</p>
        </div>
      </div>
    </div>
  );
}
