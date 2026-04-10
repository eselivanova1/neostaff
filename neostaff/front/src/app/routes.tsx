import { createBrowserRouter } from 'react-router-dom';
import Root from './pages/Root';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <EmployeeList />,
      },
      {
        path: 'employee/:id',
        element: <EmployeeProfile />,
      },
    ],
  },
]);
