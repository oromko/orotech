const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const LabRequest = require('./LabRequest');
const MedicalCertificate = require('./MedicalCertificate');

// Define associations
User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(MedicalRecord, { foreignKey: 'doctorId', as: 'medicalRecords' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(LabRequest, { foreignKey: 'patientId', as: 'labRequests' });
LabRequest.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(LabRequest, { foreignKey: 'doctorId', as: 'labRequests' });
LabRequest.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(MedicalCertificate, { foreignKey: 'patientId', as: 'certificates' });
MedicalCertificate.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(MedicalCertificate, { foreignKey: 'doctorId', as: 'certificates' });
MedicalCertificate.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  LabRequest,
  MedicalCertificate
};
