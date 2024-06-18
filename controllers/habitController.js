// controllers/habitController.js
const db = require('../config/db');

exports.createHabit = async (req, res) => {
  const { userId, sleepDuration, mealTimes, bathroomFrequency, mood, date } = req.body;

  try {
    await db.execute(
      'INSERT INTO daily_habits (user_id, sleep_duration, meal_times, bathroom_frequency, mood, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, sleepDuration, mealTimes, bathroomFrequency, mood, date]
    );
    res.status(201).send('Habit recorded');
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getHabitsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM daily_habits WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
};

