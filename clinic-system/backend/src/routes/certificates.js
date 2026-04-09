const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MedicalCertificate = require('../models/MedicalCertificate');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { authMiddleware, authorize } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

// @route   POST /api/certificates
// @desc    Issue a new medical certificate
// @access  Private (Doctor, Admin)
router.post('/', authMiddleware, authorize(['doctor', 'admin']), [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('type').notEmpty().withMessage('Certificate type is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('recommendations').optional().trim(),
  body('validityDays').optional().isInt({ min: 1, max: 365 }).withMessage('Validity must be between 1-365 days')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { patientId, type, diagnosis, recommendations, validityDays } = req.body;

    // Verify patient exists
    const patient = await Patient.findOne({
      where: { id: patientId },
      include: [{ model: User, attributes: ['firstName', 'lastName', 'dateOfBirth'] }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate age
    const birthDate = new Date(patient.User.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Calculate valid until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (validityDays || 365));

    // Get doctor info
    let doctorId = req.user.id;
    let doctorName = `${req.user.firstName} ${req.user.lastName}`;
    
    if (req.user.role === 'admin' && req.body.doctorId) {
      const doctor = await Doctor.findByPk(req.body.doctorId, {
        include: [{ model: User, attributes: ['firstName', 'lastName'] }]
      });
      if (doctor) {
        doctorId = doctor.id;
        doctorName = `${doctor.User.firstName} ${doctor.User.lastName}`;
      }
    }

    // Create certificate
    const certificate = await MedicalCertificate.create({
      patientId,
      doctorId,
      type,
      diagnosis,
      recommendations: recommendations || '',
      issueDate: new Date(),
      validUntil,
      status: 'Active'
    });

    logger.info(`Medical certificate issued: ${certificate.id} for patient ${patientId}`);

    res.status(201).json({
      success: true,
      data: {
        ...certificate.toJSON(),
        patientName: `${patient.User.firstName} ${patient.User.lastName}`,
        patientAge: age,
        patientGender: patient.gender,
        doctorName
      },
      message: 'Medical certificate issued successfully'
    });
  } catch (error) {
    logger.error('Error issuing medical certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while issuing certificate'
    });
  }
});

// @route   GET /api/certificates
// @desc    Get all certificates (filtered by role)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found'
        });
      }
      whereClause.patientId = patient.id;
    } else if (req.user.role === 'doctor') {
      whereClause.doctorId = req.user.id;
    }

    const { status, type, page = 1, limit = 20 } = req.query;
    
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const offset = (page - 1) * limit;

    const { count, rows } = await MedicalCertificate.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Patient, 
          include: [{ model: User, attributes: ['firstName', 'lastName', 'dateOfBirth', 'gender'] }] 
        },
        { 
          model: Doctor, 
          include: [{ model: User, attributes: ['firstName', 'lastName'] }] 
        }
      ],
      order: [['issueDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate age and format response
    const formattedRows = rows.map(cert => {
      const birthDate = new Date(cert.Patient.User.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        ...cert.toJSON(),
        patientName: `${cert.Patient.User.firstName} ${cert.Patient.User.lastName}`,
        patientAge: age,
        patientGender: cert.Patient.gender,
        doctorName: cert.Doctor ? `${cert.Doctor.User.firstName} ${cert.Doctor.User.lastName}` : 'Unknown'
      };
    });

    res.json({
      success: true,
      data: formattedRows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificates'
    });
  }
});

// @route   GET /api/certificates/:id
// @desc    Get single certificate by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findByPk(req.params.id, {
      include: [
        { 
          model: Patient, 
          include: [{ model: User, attributes: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone'] }] 
        },
        { 
          model: Doctor, 
          include: [{ model: User, attributes: ['firstName', 'lastName'] }] 
        }
      ]
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Calculate age
    const birthDate = new Date(certificate.Patient.User.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const formattedCert = {
      ...certificate.toJSON(),
      patientName: `${certificate.Patient.User.firstName} ${certificate.Patient.User.lastName}`,
      patientAge: age,
      patientGender: certificate.Patient.gender,
      doctorName: certificate.Doctor ? `${certificate.Doctor.User.firstName} ${certificate.Doctor.User.lastName}` : 'Unknown'
    };

    res.json({
      success: true,
      data: formattedCert
    });
  } catch (error) {
    logger.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificate'
    });
  }
});

// @route   PUT /api/certificates/:id/status
// @desc    Update certificate status (expire/revoke)
// @access  Private (Doctor, Admin)
router.put('/:id/status', authMiddleware, authorize(['doctor', 'admin']), [
  body('status').isIn(['Active', 'Expired', 'Revoked']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const certificate = await MedicalCertificate.findByPk(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    await certificate.update({ status: req.body.status });

    logger.info(`Certificate ${certificate.id} status updated to ${req.body.status}`);

    res.json({
      success: true,
      data: certificate,
      message: 'Status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating certificate status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete medical certificate
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, authorize(['admin']), async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findByPk(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    await certificate.destroy();

    logger.info(`Certificate ${certificate.id} deleted`);

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting certificate'
    });
  }
});

module.exports = router;
