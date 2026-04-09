import React from 'react';
import { useAuthStore } from '../context/authStore';

const AdminPanel = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Users', value: '156', icon: '👥', color: 'bg-blue-500' },
    { label: 'Doctors', value: '12', icon: '👨‍⚕️', color: 'bg-green-500' },
    { label: 'Appointments Today', value: '24', icon: '📅', color: 'bg-purple-500' },
    { label: 'Pending Requests', value: '8', icon: '⏳', color: 'bg-yellow-500' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'active', date: '2024-01-15' },
    { id: 2, name: 'Dr. Sarah Wilson', email: 'sarah@clinic.com', role: 'doctor', status: 'active', date: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'patient', status: 'inactive', date: '2024-01-13' },
    { id: 4, name: 'Dr. Emily Chen', email: 'emily@clinic.com', role: 'doctor', status: 'active', date: '2024-01-12' },
  ];

  const recentAppointments = [
    { id: 1, patient: 'Alice Brown', doctor: 'Dr. Sarah Wilson', date: '2024-01-15', time: '09:00', status: 'completed' },
    { id: 2, patient: 'Bob Smith', doctor: 'Dr. Emily Chen', date: '2024-01-15', time: '10:30', status: 'in_progress' },
    { id: 3, patient: 'Carol White', doctor: 'Dr. Sarah Wilson', date: '2024-01-15', time: '14:00', status: 'scheduled' },
    { id: 4, patient: 'David Lee', doctor: 'Dr. Emily Chen', date: '2024-01-15', time: '15:30', status: 'scheduled' },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-danger',
      completed: 'badge-success',
      in_progress: 'badge-warning',
      scheduled: 'badge-info',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage your clinic system</p>
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

      {/* Recent Users */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          <button className="btn-primary text-sm">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusBadge(user.status)} capitalize`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
          <button className="btn-primary text-sm">View Calendar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{apt.patient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{apt.doctor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusBadge(apt.status)} capitalize`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    {apt.status === 'scheduled' && (
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <span className="mr-2">👤</span> Add User
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <span className="mr-2">👨‍⚕️</span> Add Doctor
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <span className="mr-2">📊</span> View Reports
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <span className="mr-2">⚙️</span> Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
