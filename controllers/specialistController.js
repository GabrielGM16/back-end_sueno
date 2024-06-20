// controllers/specialistController.js
const db = require('../config/db');

// Obtener todas las especialidades disponibles
exports.getSpecialties = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT specialty FROM users WHERE role = "specialist"');
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Crear un nuevo especialista con especialidad
exports.createSpecialist = async (req, res) => {
  const { name, email, password, specialty } = req.body;

  try {
    await db.execute(
      'INSERT INTO users (name, email, password, role, specialty) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, 'specialist', specialty]
    );
    res.status(201).send('Specialist created');
  } catch (error) {
    res.status(500).send(error);
  }
};

// Obtener especialistas por especialidad
exports.getSpecialistsBySpecialty = async (req, res) => {
  const specialty = req.params.specialty;

  try {
    const [rows] = await db.execute('SELECT id, name FROM users WHERE role = "specialist" AND specialty = ?', [specialty]);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
};
