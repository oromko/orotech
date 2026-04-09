import React, { useState } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle, Download, Eye } from 'lucide-react';

const LabRequests = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [requests, setRequests] = useState([
    { id: 'LR-001', patient: 'John Doe', doctor: 'Dr. Smith', test: 'Complete Blood Count', status: 'Pending', date: '2023-10-25', priority: 'Normal', result: null },
    { id: 'LR-002', patient: 'Sarah Connor', doctor: 'Dr. Brown', test: 'Lipid Profile', status: 'Completed', date: '2023-10-24', priority: 'High', result: { wbc: '7.5', rbc: '4.8', hemoglobin: '14.2', platelets: '250' } },
    { id: 'LR-003', patient: 'Mike Ross', doctor: 'Dr. Smith', test: 'Urinalysis', status: 'In Progress', date: '2023-10-25', priority: 'Normal', result: null },
  ]);

  const [formData, setFormData] = useState({
    patientName: '',
    testType: '',
    priority: 'Normal',
    notes: ''
  });

  const [resultData, setResultData] = useState({
    wbc: '',
    rbc: '',
    hemoglobin: '',
    platelets: '',
    glucose: '',
    cholesterol: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResultChange = (e) => {
    setResultData({ ...resultData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: `LR-00${requests.length + 1}`,
      patient: formData.patientName,
      doctor: 'Current User',
      test: formData.testType,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      priority: formData.priority,
      result: null
    };
    setRequests([newRequest, ...requests]);
    setShowModal(false);
    setFormData({ patientName: '', testType: '', priority: 'Normal', notes: '' });
  };

  const handleAddResult = (request) => {
    setSelectedRequest(request);
    setShowResultModal(true);
  };

  const handleSubmitResult = (e) => {
    e.preventDefault();
    const updatedRequests = requests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'Completed', result: resultData }
        : req
    );
    setRequests(updatedRequests);
    setShowResultModal(false);
    setResultData({ wbc: '', rbc: '', hemoglobin: '', platelets: '', glucose: '', cholesterol: '', notes: '' });
    setSelectedRequest(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'High') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Requests & Results</h1>
          <p className="text-gray-500">Manage lab tests, requests, and view results</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 font-medium ${activeTab === 'new' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active Requests
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'Pending').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'In Progress').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Completed Today</div>
          <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'Completed').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">High Priority</div>
          <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.priority === 'High' && r.status !== 'Completed').length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search patient or test..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.patient}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.test}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.doctor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                  {getPriorityIcon(req.priority)}
                  <span className={req.priority === 'High' ? 'text-red-600 font-medium' : 'text-gray-600'}>{req.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                  {req.status === 'Completed' ? (
                    <>
                      <button 
                        onClick={() => { setSelectedRequest(req); setShowResultModal(true); }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> View Result
                      </button>
                      <button className="text-green-600 hover:text-green-900 flex items-center gap-1">
                        <Download className="w-4 h-4" /> PDF
                      </button>
                    </>
                  ) : (
                    <>
                      {req.status === 'Pending' && (
                        <button 
                          onClick={() => handleAddResult(req)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> Add Result
                        </button>
                      )}
                      {req.status === 'In Progress' && (
                        <button className="text-blue-600 hover:text-blue-900">Processing</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Laboratory Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input 
                  type="text" 
                  name="patientName"
                  required
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select 
                  name="testType"
                  required
                  value={formData.testType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Test</option>
                  <option value="Complete Blood Count">Complete Blood Count (CBC)</option>
                  <option value="Lipid Profile">Lipid Profile</option>
                  <option value="Urinalysis">Urinalysis</option>
                  <option value="Liver Function Test">Liver Function Test</option>
                  <option value="Thyroid Panel">Thyroid Panel</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High (STAT)</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                <textarea 
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/View Result Modal */}
      {showResultModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedRequest.result ? 'View Laboratory Result' : 'Add Laboratory Result'}
              </h2>
              <button onClick={() => setShowResultModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Patient:</strong> {selectedRequest.patient}</div>
                <div><strong>Test:</strong> {selectedRequest.test}</div>
                <div><strong>ID:</strong> {selectedRequest.id}</div>
                <div><strong>Date:</strong> {selectedRequest.date}</div>
              </div>
            </div>

            {selectedRequest.result ? (
              <div>
                <h3 className="font-semibold mb-3">Test Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {selectedRequest.result.wbc && (
                    <div className="border p-3 rounded">
                      <div className="text-sm text-gray-500">WBC</div>
                      <div className="text-lg font-semibold">{selectedRequest.result.wbc} x10³/µL</div>
                    </div>
                  )}
                  {selectedRequest.result.rbc && (
                    <div className="border p-3 rounded">
                      <div className="text-sm text-gray-500">RBC</div>
                      <div className="text-lg font-semibold">{selectedRequest.result.rbc} x10⁶/µL</div>
                    </div>
                  )}
                  {selectedRequest.result.hemoglobin && (
                    <div className="border p-3 rounded">
                      <div className="text-sm text-gray-500">Hemoglobin</div>
                      <div className="text-lg font-semibold">{selectedRequest.result.hemoglobin} g/dL</div>
                    </div>
                  )}
                  {selectedRequest.result.platelets && (
                    <div className="border p-3 rounded">
                      <div className="text-sm text-gray-500">Platelets</div>
                      <div className="text-lg font-semibold">{selectedRequest.result.platelets} x10³/µL</div>
                    </div>
                  )}
                  {selectedRequest.result.glucose && (
                    <div className="border p-3 rounded">
                      <div className="text-sm text-gray-500">Glucose</div>
                      <div className="text-lg font-semibold">{selectedRequest.result.glucose} mg/dL</div>
                    </div>
                  )}
                  {selectedRequest.result.cholesterol && (
                    <div className="border p-3 rounded">
                      <div className="text-sm text-gray-500">Cholesterol</div>
                      <div className="text-lg font-semibold">{selectedRequest.result.cholesterol} mg/dL</div>
                    </div>
                  )}
                </div>
                {selectedRequest.result.notes && (
                  <div className="mt-4">
                    <strong>Notes:</strong>
                    <p className="text-gray-700 mt-1">{selectedRequest.result.notes}</p>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitResult}>
                <h3 className="font-semibold mb-3">Enter Test Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WBC (x10³/µL)</label>
                    <input 
                      type="text" 
                      name="wbc"
                      value={resultData.wbc}
                      onChange={handleResultChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4.5-11.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RBC (x10⁶/µL)</label>
                    <input 
                      type="text" 
                      name="rbc"
                      value={resultData.rbc}
                      onChange={handleResultChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4.5-5.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin (g/dL)</label>
                    <input 
                      type="text" 
                      name="hemoglobin"
                      value={resultData.hemoglobin}
                      onChange={handleResultChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12.0-16.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platelets (x10³/µL)</label>
                    <input 
                      type="text" 
                      name="platelets"
                      value={resultData.platelets}
                      onChange={handleResultChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150-450"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Glucose (mg/dL)</label>
                    <input 
                      type="text" 
                      name="glucose"
                      value={resultData.glucose}
                      onChange={handleResultChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="70-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cholesterol (mg/dL)</label>
                    <input 
                      type="text" 
                      name="cholesterol"
                      value={resultData.cholesterol}
                      onChange={handleResultChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="<200"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pathologist Notes</label>
                  <textarea 
                    name="notes"
                    rows="3"
                    value={resultData.notes}
                    onChange={handleResultChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional observations..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowResultModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Result
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabRequests;
