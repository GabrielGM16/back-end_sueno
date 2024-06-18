const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

// Ruta para reservar una cita
router.post('/', authenticateToken, async (req, res) => {
  const { userId, specialistId, date } = req.body;

  try {
    await db.execute(
      'INSERT INTO appointments (user_id, specialist_id, date, attended) VALUES (?, ?, ?, ?)',
      [userId, specialistId, date, false]
    );
    res.status(201).send('Appointment booked successfully');
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).send('Error booking appointment');
  }
});

// Ruta para obtener las citas de un especialista
router.get('/:specialistId/appointments', authenticateToken, async (req, res) => {
  const specialistId = req.params.specialistId;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM appointments WHERE specialist_id = ?',
      [specialistId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send('Error fetching appointments');
  }
});

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


