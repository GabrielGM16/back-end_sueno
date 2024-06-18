// controllers/appointmentController.js
const db = require('../config/db');

exports.createAppointment = async (req, res) => {
  const { userId, specialistId, date } = req.body;

  try {
    await db.execute(
      'INSERT INTO appointments (user_id, specialist_id, date) VALUES (?, ?, ?)',
      [userId, specialistId, date]
    );
    res.status(201).send('Appointment created');
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getAppointmentsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM appointments WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
};

