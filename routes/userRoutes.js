const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/profile/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.execute(
      'SELECT name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
});

module.exports = router;
