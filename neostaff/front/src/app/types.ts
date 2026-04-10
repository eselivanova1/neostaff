export type EmployeeStatus = 'active' | 'terminated';

export type Department = 'IT' | 'HR' | 'Sales' | 'Marketing' | 'Finance' | 'Operations' | 'Legal' | 'Engineering' | 'Product' | 'Design';

export type Role = 'employee' | 'manager' | 'hr' | 'admin';

export type EventType =
  | 'promotion'
  | 'grade_change'
  | 'salary_change'
  | 'termination'
  | 'recovery'
  | 'transfer'
  | 'review'
  | 'certification'
  | 'one_on_one'
  | 'career_talk'
  | 'training'
  | 'conference'
  | 'team_building';

export type TimeOffType = 'vacation' | 'day_off' | 'sick_leave';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: Department;
  hire_date: string;
  termination_date?: string;
  is_active: boolean;
  role: Role;
  hierarchy_level: number;
  manager_id?: number;
  about: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  employee_id: number;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  due_date?: string;
  is_read: boolean;
  created_at: string;
}

export interface CareerEvent {
  id: number;
  employee_id: number;
  type: EventType;
  date: string;
  title: string;
  description: string;
  is_certification: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  eventId: string;
  author: string;
  authorRole: Role;
  content: string;
  date: string;
}

export interface Reminder {
  id: string;
  employeeId: string;
  type: 'one_on_one' | 'review' | 'training';
  title: string;
  date: string;
  recurring?: boolean;
  intervalDays?: number;
}

export interface TimeOff {
  id: string;
  employeeId: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'cancelled';
  notes?: string;
}