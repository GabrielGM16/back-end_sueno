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

// Function to mark an appointment as attended and add a summary along with the specialist's specialty
exports.attendAppointment = async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const { summary } = req.body;

  try {
    const [appointment] = await db.execute('SELECT specialist_id FROM appointments WHERE id = ?', [appointmentId]);
    if (appointment.length === 0) {
      console.error('Appointment not found');
      return res.status(404).send('Appointment not found');
    }
    const specialistId = appointment[0].specialist_id;

    const [specialist] = await db.execute('SELECT specialty FROM users WHERE id = ?', [specialistId]);
    if (specialist.length === 0) {
      console.error('Specialist not found');
      return res.status(404).send('Specialist not found');
    }
    const specialty = specialist[0].specialty;

    await db.execute(
      'UPDATE appointments SET attended = ?, summary = ?, specialty = ? WHERE id = ?',
      [true, summary, specialty, appointmentId]
    );
    console.log('Appointment attended and summary added successfully');
    res.status(200).send('Appointment attended and summary added successfully');
  } catch (error) {
    console.error('Error attending appointment:', error);
    res.status(500).send('Error attending appointment');
  }
};

// Function to get recommendations (summaries) for a user
exports.getRecommendationsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute(
      'SELECT summary, date, specialty FROM appointments WHERE user_id = ? AND summary IS NOT NULL',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Error fetching recommendations');
  }
};
