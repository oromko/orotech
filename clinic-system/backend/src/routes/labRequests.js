const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const LabRequest = require('../models/LabRequest');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { authMiddleware, authorize } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

// @route   POST /api/lab-requests
// @desc    Create a new laboratory request
// @access  Private (Doctor, Admin)
router.post('/', authMiddleware, authorize(['doctor', 'admin']), [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('testType').notEmpty().withMessage('Test type is required'),
  body('priority').optional().isIn(['Normal', 'High']).withMessage('Invalid priority'),
  body('clinicalNotes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { patientId, testType, priority, clinicalNotes } = req.body;

    // Verify patient exists
    const patient = await Patient.findOne({
      where: { id: patientId },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get doctor info
    let doctorId = req.user.id;
    if (req.user.role === 'admin') {
      const adminUser = await User.findByPk(req.user.id);
      doctorId = req.body.doctorId || doctorId;
    }

    // Create lab request
    const labRequest = await LabRequest.create({
      patientId,
      doctorId,
      testType,
      priority: priority || 'Normal',
      clinicalNotes,
      status: 'Pending'
    });

    logger.info(`Lab request created: ${labRequest.id} for patient ${patientId}`);

    res.status(201).json({
      success: true,
      data: labRequest,
      message: 'Laboratory request created successfully'
    });
  } catch (error) {
    logger.error('Error creating lab request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lab request'
    });
  }
});

// @route   GET /api/lab-requests
// @desc    Get all lab requests (filtered by role)
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

    const { status, priority, page = 1, limit = 20 } = req.query;
    
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const offset = (page - 1) * limit;

    const { count, rows } = await LabRequest.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Patient, 
          include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }] 
        },
        { 
          model: Doctor, 
          include: [{ model: User, attributes: ['firstName', 'lastName'] }] 
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching lab requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab requests'
    });
  }
});

// @route   GET /api/lab-requests/:id
// @desc    Get single lab request by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const labRequest = await LabRequest.findByPk(req.params.id, {
      include: [
        { 
          model: Patient, 
          include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }] 
        },
        { 
          model: Doctor, 
          include: [{ model: User, attributes: ['firstName', 'lastName'] }] 
        }
      ]
    });

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: 'Lab request not found'
      });
    }

    res.json({
      success: true,
      data: labRequest
    });
  } catch (error) {
    logger.error('Error fetching lab request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab request'
    });
  }
});

// @route   PUT /api/lab-requests/:id/result
// @desc    Add/update lab result
// @access  Private (Lab Technician, Doctor, Admin)
router.put('/:id/result', authMiddleware, authorize(['lab_technician', 'doctor', 'admin']), [
  body('results').optional().isObject(),
  body('pathologistNotes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const labRequest = await LabRequest.findByPk(req.params.id);

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: 'Lab request not found'
      });
    }

    const { results, pathologistNotes } = req.body;

    await labRequest.update({
      results: results || labRequest.results,
      pathologistNotes: pathologistNotes || labRequest.pathologistNotes,
      status: 'Completed',
      completedAt: new Date()
    });

    logger.info(`Lab result added for request: ${labRequest.id}`);

    res.json({
      success: true,
      data: labRequest,
      message: 'Lab result saved successfully'
    });
  } catch (error) {
    logger.error('Error saving lab result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving lab result'
    });
  }
});

// @route   PUT /api/lab-requests/:id/status
// @desc    Update lab request status
// @access  Private (Lab Technician, Doctor, Admin)
router.put('/:id/status', authMiddleware, authorize(['lab_technician', 'doctor', 'admin']), [
  body('status').isIn(['Pending', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const labRequest = await LabRequest.findByPk(req.params.id);

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: 'Lab request not found'
      });
    }

    await labRequest.update({ status: req.body.status });

    if (req.body.status === 'Completed') {
      await labRequest.update({ completedAt: new Date() });
    }

    logger.info(`Lab request ${labRequest.id} status updated to ${req.body.status}`);

    res.json({
      success: true,
      data: labRequest,
      message: 'Status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating lab request status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
});

// @route   DELETE /api/lab-requests/:id
// @desc    Delete/cancel lab request
// @access  Private (Doctor, Admin)
router.delete('/:id', authMiddleware, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const labRequest = await LabRequest.findByPk(req.params.id);

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: 'Lab request not found'
      });
    }

    if (labRequest.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed lab requests'
      });
    }

    await labRequest.update({ status: 'Cancelled' });

    logger.info(`Lab request ${labRequest.id} cancelled`);

    res.json({
      success: true,
      message: 'Lab request cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling lab request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling lab request'
    });
  }
});

module.exports = router;
