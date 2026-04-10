import React from 'react';

const Appointments = () => {
  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'General Physician',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Checkup',
      status: 'scheduled'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      date: '2024-01-20',
      time: '2:30 PM',
      type: 'Follow-up',
      status: 'confirmed'
    },
    {
      id: 3,
      doctor: 'Dr. Emily Brown',
      specialty: 'Dermatologist',
      date: '2024-01-10',
      time: '11:00 AM',
      type: 'Consultation',
      status: 'completed'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return 'badge-warning';
      case 'confirmed':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <button className="btn-primary">
          <span className="mr-2">+</span> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="input-field">
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" className="input-field" />
          <select className="input-field">
            <option value="">All Doctors</option>
            <option value="general">General Physician</option>
            <option value="cardiology">Cardiologist</option>
            <option value="dermatology">Dermatologist</option>
          </select>
          <button className="btn-secondary">Filter</button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.doctor}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.specialty}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{appointment.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    {appointment.status === 'scheduled' && (
                      <button className="text-red-600 hover:text-red-900">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
