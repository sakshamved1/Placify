import React from 'react';
import { useApp } from '../context/AppContext';
import StudentDashboard from './StudentDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage = () => {
  const { user } = useApp();

  if (!user) return null;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Invalid account role configuration.
        </div>
      );
  }
};

export default DashboardPage;
