import { useState } from "react";
import { Upload, X } from "lucide-react";

import { employeesApi } from "../api/api";
import { Department } from "../types";

interface AddEmployeeModalProps {
  onClose: () => void;
  onEmployeeAdded: () => void;
}

const departments: Department[] = [
  "IT",
  "HR",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Legal",
  "Engineering",
  "Product",
  "Design",
];

const roles = [
  { value: "employee", label: "Сотрудник" },
  { value: "manager", label: "Менеджер" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Администратор" },
];

export default function AddEmployeeModal({ onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    position: "",
    department: "IT" as Department,
    hire_date: "",
    role: "employee",
    hierarchy_level: 1,
    about: "",
  });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await employeesApi.create({
        ...formData,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString().split("T")[0] : null,
        is_active: true,
      });
      onEmployeeAdded();
      onClose();
    } catch (error) {
      console.error("Failed to create employee:", error);
      alert("Не удалось создать сотрудника. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Добавить сотрудника</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Фотография</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {photoPreview ? <img src={photoPreview} alt="Предпросмотр" className="w-full h-full object-cover" /> : <Upload className="w-8 h-8 text-gray-400" />}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <Upload className="w-4 h-4" />
                  Выбрать фото
                </label>
                <p className="text-xs text-gray-500 mt-1">Необязательно. До 5 МБ, JPG/PNG</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
              <input type="text" value={formData.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия *</label>
              <input type="text" value={formData.last_name} onChange={(e) => handleInputChange("last_name", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Должность *</label>
              <input type="text" value={formData.position} onChange={(e) => handleInputChange("position", e.target.value)} placeholder="Например, Senior Software Engineer" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Отдел *</label>
              <select value={formData.department} onChange={(e) => handleInputChange("department", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
              <select value={formData.role} onChange={(e) => handleInputChange("role", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Уровень иерархии</label>
              <input type="number" min="1" max="5" value={formData.hierarchy_level} onChange={(e) => handleInputChange("hierarchy_level", parseInt(e.target.value, 10) || 1)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">1 — минимальный уровень, 5 — максимальный</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата найма</label>
            <input type="date" value={formData.hire_date} onChange={(e) => handleInputChange("hire_date", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">О сотруднике</label>
            <textarea value={formData.about} onChange={(e) => handleInputChange("about", e.target.value)} placeholder="Краткое описание сотрудника..." rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? "Создание..." : "Создать сотрудника"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
