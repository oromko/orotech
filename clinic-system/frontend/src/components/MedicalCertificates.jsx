import React, { useState } from 'react';
import { Plus, Search, FileText, Download, Eye, Printer, CheckCircle } from 'lucide-react';

const MedicalCertificates = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const [certificates, setCertificates] = useState([
    { 
      id: 'MC-001', 
      patientName: 'John Doe', 
      patientAge: 35, 
      gender: 'Male',
      issueDate: '2023-10-25', 
      type: 'Fitness Certificate',
      diagnosis: 'Healthy - No significant medical conditions',
      recommendations: 'Regular exercise recommended',
      validUntil: '2024-10-25',
      doctor: 'Dr. Smith',
      status: 'Active'
    },
    { 
      id: 'MC-002', 
      patientName: 'Sarah Connor', 
      patientAge: 28, 
      gender: 'Female',
      issueDate: '2023-10-20', 
      type: 'Sick Leave Certificate',
      diagnosis: 'Acute Upper Respiratory Infection',
      recommendations: 'Rest for 5 days, medication prescribed',
      validUntil: '2023-10-25',
      doctor: 'Dr. Brown',
      status: 'Expired'
    },
    { 
      id: 'MC-003', 
      patientName: 'Mike Ross', 
      patientAge: 42, 
      gender: 'Male',
      issueDate: '2023-10-24', 
      type: 'Medical Fitness for Work',
      diagnosis: 'Fit for duty with no restrictions',
      recommendations: 'Annual checkup recommended',
      validUntil: '2024-10-24',
      doctor: 'Dr. Smith',
      status: 'Active'
    },
  ]);

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    gender: 'Male',
    certificateType: 'Fitness Certificate',
    diagnosis: '',
    recommendations: '',
    validityDays: '365',
    doctorName: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date();
    const validDate = new Date();
    validDate.setDate(today.getDate() + parseInt(formData.validityDays));
    
    const newCertificate = {
      id: `MC-00${certificates.length + 1}`,
      patientName: formData.patientName,
      patientAge: formData.patientAge,
      gender: formData.gender,
      issueDate: today.toISOString().split('T')[0],
      type: formData.certificateType,
      diagnosis: formData.diagnosis,
      recommendations: formData.recommendations,
      validUntil: validDate.toISOString().split('T')[0],
      doctor: formData.doctorName || 'Dr. Smith',
      status: 'Active'
    };
    
    setCertificates([newCertificate, ...certificates]);
    setShowModal(false);
    setFormData({
      patientName: '',
      patientAge: '',
      gender: 'Male',
      certificateType: 'Fitness Certificate',
      diagnosis: '',
      recommendations: '',
      validityDays: '365',
      doctorName: ''
    });
  };

  const getStatusColor = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Examination Certificates</h1>
          <p className="text-gray-500">Issue and manage medical certificates</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Issue Certificate
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          All Certificates
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active
        </button>
        <button 
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2 font-medium ${activeTab === 'expired' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Expired
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Total Issued</div>
          <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Active Certificates</div>
          <div className="text-2xl font-bold text-green-600">
            {certificates.filter(c => !isExpired(c.validUntil)).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Expired Certificates</div>
          <div className="text-2xl font-bold text-gray-600">
            {certificates.filter(c => isExpired(c.validUntil)).length}
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'all' 
          ? certificates 
          : activeTab === 'active' 
            ? certificates.filter(c => !isExpired(c.validUntil))
            : certificates.filter(c => isExpired(c.validUntil))
        ).map((cert) => (
          <div key={cert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{cert.patientName}</h3>
                  <p className="text-sm text-gray-500">{cert.gender}, {cert.patientAge} years</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(isExpired(cert.validUntil) ? 'Expired' : 'Active')}`}>
                  {isExpired(cert.validUntil) ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Certificate Type</div>
                <div className="font-medium text-gray-900">{cert.type}</div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Diagnosis</div>
                <div className="text-sm text-gray-700">{cert.diagnosis}</div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Recommendations</div>
                <div className="text-sm text-gray-700">{cert.recommendations}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Issued</div>
                  <div className="font-medium">{cert.issueDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Valid Until</div>
                  <div className={`font-medium ${isExpired(cert.validUntil) ? 'text-red-600' : 'text-green-600'}`}>
                    {cert.validUntil}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">Issued by</div>
                <div className="font-medium text-gray-900">{cert.doctor}</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button 
                onClick={() => { setSelectedCertificate(cert); setShowPreviewModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Issue Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Issue Medical Certificate</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input 
                    type="text" 
                    name="patientName"
                    required
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input 
                    type="number" 
                    name="patientAge"
                    required
                    value={formData.patientAge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type *</label>
                  <select 
                    name="certificateType"
                    value={formData.certificateType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fitness Certificate">Fitness Certificate</option>
                    <option value="Sick Leave Certificate">Sick Leave Certificate</option>
                    <option value="Medical Fitness for Work">Medical Fitness for Work</option>
                    <option value="Travel Medical Certificate">Travel Medical Certificate</option>
                    <option value="School Medical Certificate">School Medical Certificate</option>
                    <option value="Sports Participation Certificate">Sports Participation Certificate</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Diagnosis / Findings *</label>
                <textarea 
                  name="diagnosis"
                  required
                  rows="3"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe medical findings, examination results, etc."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations / Advice</label>
                <textarea 
                  name="recommendations"
                  rows="3"
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Medical advice, restrictions, follow-up, etc."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Days)</label>
                  <select 
                    name="validityDays"
                    value={formData.validityDays}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7">7 Days</option>
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                  <input 
                    type="text" 
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Attending physician"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
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
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Certificate Modal */}
      {showPreviewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">MEDICAL EXAMINATION CERTIFICATE</h1>
                  <p className="text-blue-100 mt-1">Official Medical Document</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">Certificate ID</div>
                  <div className="text-xl font-bold">{selectedCertificate.id}</div>
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Information</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-32 text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{selectedCertificate.patientName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Age:</span>
                      <span className="text-gray-900">{selectedCertificate.patientAge} years</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Gender:</span>
                      <span className="text-gray-900">{selectedCertificate.gender}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Certificate Details</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-32 text-gray-600">Type:</span>
                      <span className="font-semibold text-gray-900">{selectedCertificate.type}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Issue Date:</span>
                      <span className="text-gray-900">{selectedCertificate.issueDate}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Valid Until:</span>
                      <span className={`font-semibold ${isExpired(selectedCertificate.validUntil) ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedCertificate.validUntil}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Medical Diagnosis / Findings</h3>
                <p className="text-gray-900 leading-relaxed">{selectedCertificate.diagnosis}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Medical Recommendations</h3>
                <p className="text-gray-900 leading-relaxed">{selectedCertificate.recommendations}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">This certificate is issued on</div>
                    <div className="font-semibold text-gray-900">{selectedCertificate.issueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <div className="w-48 h-16 border-2 border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
                        Digital Signature
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">{selectedCertificate.doctor}</div>
                    <div className="text-sm text-gray-500">Licensed Physician</div>
                    <div className="text-sm text-gray-500">Medical License No: MED-12345</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    This is a digitally generated certificate. For verification, please contact the clinic administration 
                    or scan the QR code on the printed version.
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(isExpired(selectedCertificate.validUntil) ? 'Expired' : 'Active')}`}>
                  {isExpired(selectedCertificate.validUntil) ? 'EXPIRED' : 'VALID'}
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalCertificates;
