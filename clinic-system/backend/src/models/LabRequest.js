const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabRequest = sequelize.define('LabRequest', {
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
  testType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Normal', 'High'),
    defaultValue: 'Normal'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  clinicalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  results: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Store lab results as JSON (e.g., {wbc, rbc, hemoglobin, platelets, glucose, cholesterol})'
  },
  pathologistNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'LabRequests',
  timestamps: true,
  indexes: [
    { fields: ['patientId'] },
    { fields: ['doctorId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = LabRequest;
