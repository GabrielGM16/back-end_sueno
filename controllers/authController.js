const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.register = async (req, res) => {
  const { name, email, password, role, captchaToken } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Registering user with role:', role); // Depuración

  try {
    // Verifica el token de reCAPTCHA
    const secretKey = '6LdrZ_spAAAAAJqeYWq6fpVNwEevwOMGxcvbubto'; // Reemplaza con tu clave secreta de reCAPTCHA v3
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: secretKey,
        response: captchaToken
      }
    });

    if (!response.data.success || response.data.score < 0.5) {
      return res.status(400).send('Captcha verification failed');
    }

    // Continúa con el registro del usuario si la verificación de reCAPTCHA es exitosa
    await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
      console.log('Login successful, role:', user.role); // Depuración
      res.json({ token, role: user.role, userId: user.id });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send(error);
  }
};