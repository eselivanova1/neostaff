import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Plus, Search } from "lucide-react";

import { employeesApi } from "../api/api";
import AddEmployeeModal from "../components/AddEmployeeModal";
import EmployeeCard from "../components/EmployeeCard";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Department, Employee } from "../types";

type SortType = "name" | "hire-date" | "department";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<SortType>("name");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [showTerminated, setShowTerminated] = useState(false);
  const [currentUserRole] = useState<string>("hr");
  const [currentUserLevel] = useState<number>(4);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadEmployees();
  }, [showTerminated]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeesApi.getAll(showTerminated);
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to load employees:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Не удалось загрузить сотрудников. Backend вернул ошибку ${err.response.status}.`);
      } else {
        setError("Не удалось загрузить сотрудников. Проверьте, что backend доступен на http://127.0.0.1:8001.");
      }
    } finally {
      setLoading(false);
    }
  };

  const departments: Department[] = Array.from(new Set(employees.map((employee) => employee.department).filter(Boolean))).sort();

  useEffect(() => {
    let result = employees.filter((employee) => {
      if (!showTerminated && employee.is_active === false) return false;
      if (selectedDept !== "all" && employee.department !== selectedDept) return false;

      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
      const searchLower = search.toLowerCase();
      return fullName.includes(searchLower) || employee.position.toLowerCase().includes(searchLower);
    });

    result = result.sort((a, b) => {
      if (sortType === "name") {
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      }
      if (sortType === "hire-date") {
        return new Date(b.hire_date).getTime() - new Date(a.hire_date).getTime();
      }
      return (a.department || "").localeCompare(b.department || "");
    });

    setFilteredEmployees(result);
  }, [employees, search, sortType, selectedDept, showTerminated]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Сотрудники</h1>
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Сотрудники</h1>
            <p className="text-gray-500 mt-1">Активных сотрудников: {filteredEmployees.length}</p>
          </div>
          <div className="flex gap-3">
            {(currentUserRole === "hr" || currentUserRole === "admin") && (
              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-5 h-5" />
                Добавить сотрудника
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Calendar className="w-5 h-5" />
              Календарь и напоминания
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Поиск по имени или должности..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 transition"
            >
              <option value="all">Все отделы</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 transition"
            >
              <option value="name">Сортировка: по имени</option>
              <option value="hire-date">Сортировка: по дате найма</option>
              <option value="department">Сортировка: по отделу</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <Checkbox checked={showTerminated} onCheckedChange={setShowTerminated} />
              <span className="text-sm font-medium text-gray-700">Показывать уволенных</span>
            </label>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {filteredEmployees.length === 0 ? (
        <p className="text-gray-500">Сотрудники не найдены</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map((employee) => (
            <Link key={employee.id} to={`/employee/${employee.id}`} className="hover:no-underline">
              <EmployeeCard employee={employee} onClick={() => {}} currentUserRole={currentUserRole} currentUserLevel={currentUserLevel} />
            </Link>
          ))}
        </div>
      )}

      {showAddEmployeeModal && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployeeModal(false)}
          onEmployeeAdded={() => {
            setShowAddEmployeeModal(false);
            void loadEmployees();
          }}
        />
      )}
    </div>
  );
}
