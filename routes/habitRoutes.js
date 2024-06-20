const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

// Ruta para crear un hábito
router.post('/', authenticateToken, async (req, res) => {
  const { userId, sleepDuration, mealTimes, bathroomFrequency, mood } = req.body;
  const currentDate = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD

  try {
    await db.execute(
      'INSERT INTO daily_habits (user_id, sleep_duration, meal_times, bathroom_frequency, mood, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, sleepDuration, mealTimes.join(','), bathroomFrequency, mood, currentDate]
    );
    res.status(201).send('Habits recorded successfully');
  } catch (error) {
    console.error('Error recording habits:', error);
    res.status(500).send('Error recording habits');
  }
});

// Ruta para obtener los hábitos de un usuario específico
router.get('/user/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM daily_habits WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).send('Error fetching habits');
  }
});

module.exports = router;
