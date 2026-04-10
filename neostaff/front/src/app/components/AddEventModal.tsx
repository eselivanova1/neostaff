import { useState } from "react";
import { X } from "lucide-react";

import { eventsApi } from "../api/api";
import { EventType } from "../types";

interface AddEventModalProps {
  employeeId: number;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}

const eventTypes: { value: EventType; label: string }[] = [
  { value: "promotion", label: "Повышение" },
  { value: "grade_change", label: "Изменение грейда" },
  { value: "salary_change", label: "Изменение зарплаты" },
  { value: "review", label: "Ревью" },
  { value: "certification", label: "Сертификация" },
  { value: "one_on_one", label: "Встреча 1:1" },
  { value: "career_talk", label: "Карьерная встреча" },
  { value: "training", label: "Обучение" },
  { value: "conference", label: "Конференция" },
  { value: "team_building", label: "Командное событие" },
  { value: "transfer", label: "Перевод" },
  { value: "termination", label: "Увольнение" },
  { value: "recovery", label: "Восстановление" },
];

export default function AddEventModal({ employeeId, onClose, onCreated }: AddEventModalProps) {
  const [eventType, setEventType] = useState<EventType>("promotion");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await eventsApi.create({
        employee_id: employeeId,
        type: eventType,
        title,
        description,
        date,
        is_certification: eventType === "certification",
      });
      await onCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Не удалось добавить событие. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Добавить событие</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип события</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7ab8] focus:border-transparent"
              required
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например, Повышение до Senior"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7ab8] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7ab8] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Кратко опишите, что произошло..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7ab8] focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#8b7ab8] text-white rounded-lg hover:bg-[#7a6aa0] transition-colors shadow-sm disabled:opacity-50">
              {loading ? "Сохранение..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
