const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  chiefComplaint: {
    type: DataTypes.TEXT
  },
  diagnosis: {
    type: DataTypes.TEXT
  },
  treatment: {
    type: DataTypes.TEXT
  },
  prescription: {
    type: DataTypes.JSONB,
    comment: 'Array of medications with dosage, frequency, duration'
  },
  labTests: {
    type: DataTypes.JSONB,
    comment: 'Array of lab tests ordered'
  },
  labResults: {
    type: DataTypes.JSONB,
    comment: 'Lab test results'
  },
  vitalSigns: {
    type: DataTypes.JSONB,
    comment: 'BP, temperature, pulse, weight, height, etc.'
  },
  notes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    comment: 'Array of file URLs for reports, images, etc.'
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('draft', 'completed', 'amended'),
    defaultValue: 'completed'
  }
}, {
  timestamps: true,
  tableName: 'medical_records',
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['doctorId']
    },
    {
      fields: ['visitDate']
    }
  ]
});

module.exports = MedicalRecord;
