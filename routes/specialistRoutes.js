const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

// Ruta para obtener todos los especialistas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name FROM users WHERE role = ?', ['specialist']);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching specialists:', error);
    res.status(500).send('Error fetching specialists');
  }
});

module.exports = router;
