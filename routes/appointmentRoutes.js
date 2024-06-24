const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const db = require('../config/db');
const {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentsBySpecialist,
  getSpecialties,
  attendAppointment,
  getRecommendationsByUser
} = require('../controllers/appointmentController');

// Ruta para reservar una cita
router.post('/', authenticateToken, createAppointment);

// Ruta para obtener las citas de un usuario
router.get('/:userId', authenticateToken, getAppointmentsByUser);

// Ruta para obtener las citas de un especialista
router.get('/:specialistId/appointments', authenticateToken, getAppointmentsBySpecialist);

// Ruta para obtener las especialidades disponibles
router.get('/specialties', authenticateToken, getSpecialties);

// Ruta para marcar una cita como atendida y añadir un resumen
router.patch('/:appointmentId/attend', authenticateToken, attendAppointment);

// Ruta para obtener los resúmenes de un usuario
router.get('/:userId/recommendations', authenticateToken, getRecommendationsByUser);

module.exports = router;
