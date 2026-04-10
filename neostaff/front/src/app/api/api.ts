import axios from "axios";
import { Employee, Notification, CareerEvent } from "../types";

export type NotificationSummary = {
  total: number;
  unread: number;
  urgent: number;
};

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8001",
});

// Employees API
export const employeesApi = {
  getAll: (showTerminated = false) =>
    API.get<Employee[]>(`/employees/?show_terminated=${showTerminated}`),

  getById: (id: number) =>
    API.get<Employee>(`/employees/${id}`),

  getByEmployeeId: (employeeId: string) =>
    API.get<Employee>(`/employees/by-employee-id/${employeeId}`),

  create: (employee: Partial<Employee>) =>
    API.post<Employee>("/employees/", employee),

  update: (id: number, employee: Partial<Employee>) =>
    API.put<Employee>(`/employees/${id}`, employee),

  terminate: (id: number, terminationDate?: string) =>
    API.post<Employee>(`/employees/${id}/terminate`, { termination_date: terminationDate }),

  reactivate: (id: number) =>
    API.post<Employee>(`/employees/${id}/reactivate`),
};

// Notifications API
export const notificationsApi = {
  getEmployeeNotifications: (employeeId: number, unreadOnly = false) =>
    API.get<Notification[]>(`/notifications/employee/${employeeId}?unread_only=${unreadOnly}`),

  create: (notification: Partial<Notification>) =>
    API.post<Notification>("/notifications/", notification),

  markAsRead: (id: number) =>
    API.put<Notification>(`/notifications/${id}/read`),

  getRecentNotifications: (unreadOnly = false, limit = 10) =>
    API.get<Notification[]>(`/notifications/recent?unread_only=${unreadOnly}&limit=${limit}`),

  getSummary: (employeeId?: number) =>
    API.get<NotificationSummary>(`/notifications/summary${employeeId ? `?emp_id=${employeeId}` : ''}`),

  checkInactivity: () =>
    API.post("/notifications/check-inactivity"),

  checkCertifications: () =>
    API.post("/notifications/check-certifications"),
};

// Events API
export const eventsApi = {
  getAll: () =>
    API.get<CareerEvent[]>("/events/"),

  create: (event: Partial<CareerEvent>) =>
    API.post<CareerEvent>("/events/", event),
};

// TimeOff API
export const timeOffApi = {
  getAll: () =>
    API.get("/timeoff/"),

  create: (timeOff: any) =>
    API.post("/timeoff/", timeOff),
};
