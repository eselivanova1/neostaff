import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Award,
  Calendar,
  GraduationCap,
  MessageSquare,
  Plane,
  Plus,
  Shield,
  TrendingUp,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import { employeesApi, eventsApi } from "../api/api";
import AddEventModal from "../components/AddEventModal";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { CareerEvent, Employee } from "../types";

type EventFilter = "all" | "career" | "meetings" | "trainings" | "certifications" | "team-building" | "time-off";

const careerEventTypes = new Set(["promotion", "grade_change", "salary_change", "termination", "recovery", "transfer"]);

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [showCareerJourney, setShowCareerJourney] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [currentUserRole] = useState<string>("hr");
  const [currentUserLevel] = useState<number>(4);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    void loadEmployeeData();
  }, [id]);

  const loadEmployeeData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const employeeIdNumber = parseInt(id, 10);
      const employeeResponse = Number.isNaN(employeeIdNumber)
        ? await employeesApi.getByEmployeeId(id)
        : await employeesApi.getById(employeeIdNumber);

      const employeeData = employeeResponse.data;
      setEmployee(employeeData);

      const eventsResponse = await eventsApi.getAll();
      setEvents(eventsResponse.data.filter((event) => event.employee_id === employeeData.id));
    } catch (error) {
      console.error("Failed to load employee data:", error);
      setEmployee(null);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateEmployee = async () => {
    if (!employee || !confirm(`Вы уверены, что хотите уволить ${employee.first_name} ${employee.last_name}?`)) return;
    try {
      await employeesApi.terminate(employee.id);
      await loadEmployeeData();
    } catch (error) {
      console.error("Failed to terminate employee:", error);
    }
  };

  const handleReactivateEmployee = async () => {
    if (!employee) return;
    try {
      await employeesApi.reactivate(employee.id);
      await loadEmployeeData();
    } catch (error) {
      console.error("Failed to reactivate employee:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-red-500">Сотрудник не найден</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const allEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const careerTimelineEvents = allEvents.filter((event) => careerEventTypes.has(event.type));
  const filteredEvents = allEvents.filter((event) => {
    if (eventFilter === "all") return true;
    if (eventFilter === "career") return careerEventTypes.has(event.type);
    if (eventFilter === "meetings") return event.type === "one_on_one" || event.type === "career_talk";
    if (eventFilter === "trainings") return event.type === "training";
    if (eventFilter === "certifications") return event.type === "certification";
    if (eventFilter === "team-building") return event.type === "team_building" || event.type === "conference";
    return false;
  });

  const eventTypeIcons: Record<string, any> = {
    promotion: TrendingUp,
    grade_change: TrendingUp,
    salary_change: TrendingUp,
    termination: UserX,
    recovery: UserCheck,
    transfer: TrendingUp,
    review: Award,
    certification: GraduationCap,
    training: GraduationCap,
    one_on_one: MessageSquare,
    career_talk: MessageSquare,
    team_building: Award,
    conference: Award,
  };

  const eventTypeLabels: Record<string, string> = {
    promotion: "Повышение",
    grade_change: "Изменение уровня",
    salary_change: "Изменение зарплаты",
    termination: "Увольнение",
    recovery: "Восстановление",
    transfer: "Перевод",
    review: "Ревью",
    certification: "Сертификация",
    training: "Обучение",
    one_on_one: "Встреча 1:1",
    career_talk: "Карьерная встреча",
    team_building: "Командное событие",
    conference: "Конференция",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-gray-600">
        ← Назад к команде
      </Button>

      <Card className="p-6 mb-8 border border-gray-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-purple-100 to-purple-50">
                {employee.first_name.charAt(0)}
                {employee.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold">
                  {employee.first_name} {employee.last_name}
                </h1>
                {currentUserLevel >= employee.hierarchy_level && (
                  <Badge variant="outline" className="font-mono text-xs">
                    ID: {employee.employee_id}
                  </Badge>
                )}
                <Badge
                  className={`${
                    employee.role === "hr"
                      ? "bg-blue-100 text-blue-800"
                      : employee.role === "manager"
                        ? "bg-green-100 text-green-800"
                        : employee.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {employee.role}
                </Badge>
                {!employee.is_active && <Badge variant="destructive">Уволен</Badge>}
              </div>
              <p className="text-lg text-gray-600 mt-1">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
              <div className="flex flex-col gap-2 mt-3 text-gray-600">
                {employee.hire_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>В компании с {format(new Date(employee.hire_date), "d MMMM yyyy")}</span>
                  </div>
                )}
                {!employee.is_active && employee.termination_date && (
                  <div className="flex items-center gap-2 text-red-600">
                    <UserX className="w-4 h-4" />
                    <span>Уволен {format(new Date(employee.termination_date), "d MMMM yyyy")}</span>
                  </div>
                )}
              </div>
              {employee.about && <p className="text-gray-700 mt-4 max-w-2xl">{employee.about}</p>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {(currentUserRole === "hr" || currentUserRole === "admin") &&
              (employee.is_active ? (
                <Button onClick={handleTerminateEmployee} variant="destructive" className="flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  Уволить
                </Button>
              ) : (
                <Button onClick={handleReactivateEmployee} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <UserCheck className="w-4 h-4" />
                  Восстановить
                </Button>
              ))}
            <Button onClick={() => setShowCareerJourney(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Карьерный путь
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-gray-200">
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">Профессиональные события</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEventFilter("all")} className={`px-4 py-2 rounded-full font-medium transition ${eventFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Все</button>
              <button onClick={() => setEventFilter("career")} className={`px-4 py-2 rounded-full font-medium transition ${eventFilter === "career" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Статус</button>
              <button onClick={() => setEventFilter("meetings")} className={`px-4 py-2 rounded-full font-medium transition ${eventFilter === "meetings" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Встречи</button>
              <button onClick={() => setEventFilter("trainings")} className={`px-4 py-2 rounded-full font-medium transition ${eventFilter === "trainings" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Обучение</button>
              <button onClick={() => setEventFilter("certifications")} className={`px-4 py-2 rounded-full font-medium transition ${eventFilter === "certifications" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Сертификации</button>
              <button onClick={() => setEventFilter("team-building")} className={`px-4 py-2 rounded-full font-medium transition ${eventFilter === "team-building" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Командные</button>
              <button onClick={() => setEventFilter("time-off")} className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-1 ${eventFilter === "time-off" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                <Plane className="w-4 h-4" />
                Отсутствия
              </button>
            </div>
            <Button onClick={() => setShowAddEventModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Добавить событие
            </Button>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-6">
            {filteredEvents.map((event, idx) => {
              const Icon = eventTypeIcons[event.type] || Award;
              return (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    {idx < filteredEvents.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-start justify-between mb-1 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                        <p className="text-xs uppercase tracking-wide text-purple-700 mt-1">{eventTypeLabels[event.type] || event.type}</p>
                      </div>
                      <span className="text-sm text-gray-500">{format(new Date(event.date), "d MMM yyyy")}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">События не найдены</p>
        )}
      </Card>

      {showCareerJourney && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Карьерный путь</h2>
                <p className="text-gray-600 mt-1">
                  {employee.first_name} {employee.last_name} • {employee.position}
                </p>
              </div>
              <button onClick={() => setShowCareerJourney(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {careerTimelineEvents.length > 0 ? (
                  careerTimelineEvents.map((event, idx) => {
                    const Icon = eventTypeIcons[event.type] || Award;
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {idx < careerTimelineEvents.length - 1 && <div className="w-1 h-16 bg-gray-200 mt-2"></div>}
                        </div>
                        <div className="pb-6 flex-1">
                          <div className="flex items-start justify-between mb-2 gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            </div>
                            <span className="text-sm text-gray-500 flex-shrink-0 ml-4">{format(new Date(event.date), "d MMM yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">Изменения статуса пока не зафиксированы</p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600">Всего статусных событий: {careerTimelineEvents.length}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowCareerJourney(false)} className="bg-purple-600 hover:bg-purple-700 text-white">
                Закрыть
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showAddEventModal && (
        <AddEventModal
          employeeId={employee.id}
          onClose={() => setShowAddEventModal(false)}
          onCreated={loadEmployeeData}
        />
      )}
    </div>
  );
}
