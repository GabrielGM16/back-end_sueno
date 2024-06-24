// controllers/habitController.js
const db = require('../config/db');

// Crear un nuevo registro de hábito
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

// Obtener todos los hábitos de un usuario específico
exports.getHabitsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM daily_habits WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Obtener recomendaciones de especialistas basado en los hábitos del usuario
exports.getSpecialistRecommendations = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM daily_habits WHERE user_id = ?', [userId]);
    
    let moodCounts = { tristeza: 0, enojo: 0, ansiedad: 0 };
    let sleepDurations = [];

    rows.forEach(row => {
      if (row.mood === 'Tristeza' || row.mood === 'Enojo' || row.mood === 'Ansiedad') {
        moodCounts[row.mood.toLowerCase()]++;
      }
      sleepDurations.push(row.sleep_duration);
    });

    let recommendations = [];

    if (moodCounts.tristeza >= 3 || moodCounts.enojo >= 3 || moodCounts.ansiedad >= 3) {
      recommendations.push('Recomendamos que consulte con un psicólogo.');
    }

    const averageSleepDuration = sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length;
    if (averageSleepDuration < 6) {
      recommendations.push('Recomendamos que consulte con un médico general.');
    }

    res.json({ recommendations });
  } catch (error) {
    res.status(500).send(error);
  }
};
