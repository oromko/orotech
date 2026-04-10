const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
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
  specialization: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER
  },
  education: {
    type: DataTypes.TEXT
  },
  bio: {
    type: DataTypes.TEXT
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2)
  },
  availability: {
    type: DataTypes.JSONB,
    comment: 'Store available days and times as JSON'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'doctors'
});

module.exports = Doctor;
