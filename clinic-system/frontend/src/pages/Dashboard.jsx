import React from 'react';
import { useAuthStore } from '../context/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Upcoming Appointments', value: '3', icon: '📅', color: 'bg-blue-500' },
    { label: 'Medical Records', value: '12', icon: '📋', color: 'bg-green-500' },
    { label: 'Prescriptions', value: '5', icon: '💊', color: 'bg-purple-500' },
    { label: 'Lab Tests', value: '2', icon: '🔬', color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your health overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white text-2xl`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
                <p className="text-sm text-gray-600">General Checkup</p>
              </div>
              <span className="badge badge-success">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Dr. Michael Chen</p>
                <p className="text-sm text-gray-600">Follow-up</p>
              </div>
              <span className="badge badge-warning">Scheduled</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Tips</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💧 Stay hydrated! Drink at least 8 glasses of water daily.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                🏃 Exercise for 30 minutes a day to maintain good health.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                😴 Get 7-8 hours of sleep for optimal well-being.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <span className="mr-2">📅</span> Book Appointment
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <span className="mr-2">📋</span> View Records
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <span className="mr-2">💊</span> Prescriptions
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <span className="mr-2">🔬</span> Lab Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
