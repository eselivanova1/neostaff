import { useEffect, useState } from "react";
import { Bell, Check, RefreshCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { notificationsApi } from "../api/api";
import { Notification } from "../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface NotificationSummary {
  total: number;
  unread: number;
  urgent: number;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary>({
    total: 0,
    unread: 0,
    urgent: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [recentRes, summaryRes] = await Promise.all([
        notificationsApi.getRecentNotifications(false, 8),
        notificationsApi.getSummary(),
      ]);
      setNotifications(recentRes.data);
      setSummary(summaryRes.data as NotificationSummary);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
      setSummary({ total: 0, unread: 0, urgent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.is_read);
    try {
      await Promise.all(
        unreadNotifications.map((notification) => notificationsApi.markAsRead(notification.id))
      );
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <Bell className="w-5 h-5" />
          Уведомления
          {summary.unread > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              {summary.unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-w-[calc(100vw-1rem)]">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900">Уведомления</p>
              <p className="text-xs text-gray-500">
                {summary.unread} новых, {summary.total} всего
              </p>
            </div>
            <button
              type="button"
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 hover:border-gray-300"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Обновить
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Загрузка...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Нет новых уведомлений</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50 border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span
                      className={`inline-flex h-2.5 w-2.5 rounded-full ${
                        notification.priority === "urgent"
                          ? "bg-red-500"
                          : notification.priority === "high"
                          ? "bg-orange-500"
                          : "bg-slate-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 transition hover:bg-gray-50 hover:border-gray-300"
                      >
                        {notification.is_read ? "✓" : "Пометить"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {notification.due_date && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                          До {new Date(notification.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="flex items-center justify-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={markAllRead}
            disabled={summary.unread === 0}
            className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Отметить все прочитанными
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
