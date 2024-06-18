const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

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

module.exports = router;


