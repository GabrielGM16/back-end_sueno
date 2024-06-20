const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentsBySpecialist,
  getSpecialties
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
router.patch('/:appointmentId/attend', authenticateToken, async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const { summary } = req.body;

  try {
    await db.execute(
      'UPDATE appointments SET attended = ?, summary = ? WHERE id = ?',
      [true, summary, appointmentId]
    );
    res.status(200).send('Appointment attended and summary added successfully');
  } catch (error) {
    console.error('Error attending appointment:', error);
    res.status(500).send('Error attending appointment');
  }
});

// Ruta para obtener los resúmenes de un usuario
router.get('/:userId/recommendations', authenticateToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute(
      'SELECT summary, date FROM appointments WHERE user_id = ? AND summary IS NOT NULL',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Error fetching recommendations');
  }
});

module.exports = router;
