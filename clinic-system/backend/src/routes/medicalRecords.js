const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authMiddleware, authorize } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

// @route   POST /api/medical-records
// @desc    Create a new medical record
// @access  Private (Doctor, Admin)
router.post('/', authMiddleware, authorize('doctor', 'admin'), [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('visitDate').optional().isISO8601(),
  body('chiefComplaint').optional().trim(),
  body('diagnosis').optional().trim(),
  body('treatment').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const {
      patientId,
      appointmentId,
      visitDate,
      chiefComplaint,
      diagnosis,
      treatment,
      prescription,
      labTests,
      vitalSigns,
      notes,
      followUpRequired,
      followUpDate
    } = req.body;

    // Verify doctor
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create medical records'
      });
    }

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId: doctor.id,
      appointmentId,
      visitDate: visitDate || new Date(),
      chiefComplaint,
      diagnosis,
      treatment,
      prescription: prescription || [],
      labTests: labTests || [],
      vitalSigns: vitalSigns || {},
      notes,
      followUpRequired: followUpRequired || false,
      followUpDate,
      status: 'completed'
    });

    // Update appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findByPk(appointmentId);
      if (appointment) {
        appointment.status = 'completed';
        appointment.completedAt = new Date();
        appointment.diagnosis = diagnosis;
        appointment.prescription = JSON.stringify(prescription);
        await appointment.save();
      }
    }

    logger.info(`Medical record created for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: { medicalRecord }
    });
  } catch (error) {
    logger.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating medical record'
    });
  }
});

// @route   GET /api/medical-records
// @desc    Get medical records (filtered by role)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};

    // Filter by role
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      whereClause.patientId = patient ? patient.id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      whereClause.doctorId = doctor ? doctor.id : null;
    }

    // Filter by specific patient (for doctors)
    if (patientId && req.user.role !== 'patient') {
      whereClause.patientId = patientId;
    }

    const { count, rows: records } = await MedicalRecord.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        },
        {
          model: Doctor,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Appointment,
          required: false
        }
      ],
      order: [['visitDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medical records'
    });
  }
});

// @route   GET /api/medical-records/:id
// @desc    Get single medical record
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        },
        {
          model: Doctor,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Appointment,
          required: false
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (record.patientId !== patient.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this record'
        });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      // Doctors can only view their own records or if they're admins
      if (record.doctorId !== doctor.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this record'
        });
      }
    }

    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    logger.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/medical-records/:id
// @desc    Update medical record
// @access  Private (Doctor, Admin)
router.put('/:id', authMiddleware, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // If doctor, verify it's their record
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (record.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this record'
        });
      }
    }

    const {
      chiefComplaint,
      diagnosis,
      treatment,
      prescription,
      labTests,
      labResults,
      vitalSigns,
      notes,
      followUpRequired,
      followUpDate,
      status
    } = req.body;

    if (chiefComplaint) record.chiefComplaint = chiefComplaint;
    if (diagnosis) record.diagnosis = diagnosis;
    if (treatment) record.treatment = treatment;
    if (prescription) record.prescription = prescription;
    if (labTests) record.labTests = labTests;
    if (labResults) record.labResults = labResults;
    if (vitalSigns) record.vitalSigns = vitalSigns;
    if (notes) record.notes = notes;
    if (typeof followUpRequired === 'boolean') record.followUpRequired = followUpRequired;
    if (followUpDate) record.followUpDate = followUpDate;
    if (status) record.status = status;

    await record.save();

    logger.info(`Medical record updated: ${record.id}`);

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: { record }
    });
  } catch (error) {
    logger.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating medical record'
    });
  }
});

module.exports = router;
