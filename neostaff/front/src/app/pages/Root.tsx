import { Outlet } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import HRIcon from '../../styles/dbs_HR.svg?react';

export default function Root() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <HRIcon className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NeoStaff</h1>
              <p className="text-sm text-gray-500 mt-1">
                Центр управления сотрудниками и уведомлениями.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
          </div>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
