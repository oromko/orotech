import React from 'react';

const MedicalRecords = () => {
  const records = [
    {
      id: 1,
      date: '2024-01-10',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Seasonal Allergies',
      treatment: 'Antihistamines prescribed',
      followUp: '2024-02-10'
    },
    {
      id: 2,
      date: '2023-12-15',
      doctor: 'Dr. Michael Chen',
      diagnosis: 'Annual Physical Exam',
      treatment: 'All vitals normal. Continue healthy lifestyle.',
      followUp: '2024-12-15'
    },
    {
      id: 3,
      date: '2023-11-20',
      doctor: 'Dr. Emily Brown',
      diagnosis: 'Skin Rash',
      treatment: 'Topical cream prescribed',
      followUp: null
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-gray-600 mt-1">Your complete medical history</p>
      </div>

      {/* Records List */}
      <div className="grid gap-6">
        {records.map((record) => (
          <div key={record.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{record.diagnosis}</h3>
                <p className="text-sm text-gray-600">{record.doctor}</p>
              </div>
              <span className="text-sm text-gray-500">{record.date}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Treatment:</p>
                <p className="text-sm text-gray-600">{record.treatment}</p>
              </div>
              
              {record.followUp && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Follow-up Date:</p>
                  <p className="text-sm text-gray-600">{record.followUp}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-3">
              <button className="btn-secondary text-sm">View Details</button>
              <button className="btn-secondary text-sm">Download PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecords;
