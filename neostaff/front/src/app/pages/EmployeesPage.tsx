import { useEffect, useState } from "react";
import { API } from "../api/api";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    API.get<Employee[]>("/employees/")
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Employees</h1>
      {employees.map(emp => (
        <div key={emp.id}>
          {emp.first_name} {emp.last_name} — {emp.position}
        </div>
      ))}
    </div>
  );
}