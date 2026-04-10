const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
    validate: {
      isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']]
    }
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(100)
  },
  zipCode: {
    type: DataTypes.STRING(20)
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'USA'
  },
  emergencyContactName: {
    type: DataTypes.STRING(200)
  },
  emergencyContactPhone: {
    type: DataTypes.STRING(20)
  },
  emergencyContactRelation: {
    type: DataTypes.STRING(50)
  },
  medicalHistory: {
    type: DataTypes.TEXT
  },
  allergies: {
    type: DataTypes.TEXT
  },
  currentMedications: {
    type: DataTypes.TEXT
  },
  insuranceProvider: {
    type: DataTypes.STRING(200)
  },
  insurancePolicyNumber: {
    type: DataTypes.STRING(100)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'patients'
});

module.exports = Patient;
