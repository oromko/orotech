const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { authMiddleware, authorize } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (Patient, Doctor, Admin)
router.post('/', authMiddleware, [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate').isDate().withMessage('Valid date is required'),
  body('appointmentTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
  body('type').optional().isIn(['checkup', 'followup', 'consultation', 'emergency', 'procedure']).withMessage('Invalid appointment type'),
  body('reason').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { doctorId, appointmentDate, appointmentTime, type, reason, duration } = req.body;

    // Get patient ID
    let patientId;
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return res.status(400).json({
          success: false,
          message: 'Patient profile not found'
        });
      }
      patientId = patient.id;
    } else {
      // For doctors/admin creating on behalf of patient
      patientId = req.body.patientId;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required when booking for others'
        });
      }
    }

    // Check if doctor exists and is active
    const doctor = await Doctor.findOne({ 
      where: { id: doctorId, isActive: true },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }

    // Check for time slot availability
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: { [Op.notIn]: ['cancelled', 'no_show'] }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      duration: duration || 30,
      type: type || 'checkup',
      reason,
      status: 'scheduled'
    });

    logger.info(`Appointment created: ${appointment.id} for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment }
    });
  } catch (error) {
    logger.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating appointment'
    });
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments (filtered by role)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
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

    // Additional filters
    if (status) {
      whereClause.status = status;
    }
    if (date) {
      whereClause.appointmentDate = date;
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }]
        },
        {
          model: Doctor,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }]
        },
        {
          model: Doctor,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (appointment.patientId !== patient.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment'
        });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (appointment.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment'
        });
      }
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    logger.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private (Doctor, Admin)
router.put('/:id', authMiddleware, authorize('doctor', 'admin'), [
  body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  body('notes').optional().trim(),
  body('diagnosis').optional().trim(),
  body('prescription').optional().trim(),
  body('followUpDate').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // If doctor, verify it's their appointment
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (appointment.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this appointment'
        });
      }
    }

    const { status, notes, diagnosis, prescription, followUpDate } = req.body;

    if (status) {
      appointment.status = status;
      if (status === 'completed') {
        appointment.completedAt = new Date();
      }
      if (status === 'cancelled') {
        appointment.cancelledAt = new Date();
        appointment.cancellationReason = req.body.cancellationReason;
      }
    }
    if (notes) appointment.notes = notes;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (prescription) appointment.prescription = prescription;
    if (followUpDate) appointment.followUpDate = followUpDate;

    await appointment.save();

    logger.info(`Appointment updated: ${appointment.id}`);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error) {
    logger.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel/Delete appointment
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const canDelete = 
      req.user.role === 'admin' ||
      (req.user.role === 'patient' && appointment.patientId === (await Patient.findOne({ where: { userId: req.user.id } }))?.id) ||
      (req.user.role === 'doctor' && appointment.doctorId === (await Doctor.findOne({ where: { userId: req.user.id } }))?.id);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    await appointment.save();

    logger.info(`Appointment cancelled: ${appointment.id}`);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    logger.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
});

module.exports = router;
