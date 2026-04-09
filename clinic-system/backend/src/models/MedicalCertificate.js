const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalCertificate = sequelize.define('MedicalCertificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Fitness Certificate, Sick Leave, Medical Fitness for Work, etc.'
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Expired', 'Revoked'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'MedicalCertificates',
  timestamps: true,
  indexes: [
    { fields: ['patientId'] },
    { fields: ['doctorId'] },
    { fields: ['status'] },
    { fields: ['issueDate'] },
    { fields: ['validUntil'] }
  ]
});

module.exports = MedicalCertificate;
