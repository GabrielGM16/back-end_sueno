const db = require('../config/db');

exports.createAppointment = async (req, res) => {
  const { userId, specialistId, date, reason } = req.body;

  try {
    await db.execute(
      'INSERT INTO appointments (user_id, specialist_id, date, reason) VALUES (?, ?, ?, ?)',
      [userId, specialistId, date, reason]
    );
    res.status(201).send('Appointment created');
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    res.status(500).send('An error occurred while creating the appointment');
  }
};

exports.getAppointmentsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM appointments WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    res.status(500).send('An error occurred while fetching appointments');
  }
};

exports.getAppointmentsBySpecialist = async (req, res) => {
  const specialistId = req.params.specialistId;

  try {
    const [rows] = await db.execute(
      'SELECT a.*, u.name AS userName FROM appointments a JOIN users u ON a.user_id = u.id WHERE a.specialist_id = ?',
      [specialistId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    res.status(500).send('An error occurred while fetching appointments');
  }
};

exports.getSpecialties = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT specialty FROM users WHERE role = "specialist"');
    res.json(rows);
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    res.status(500).send('An error occurred while fetching specialties');
  }
};
