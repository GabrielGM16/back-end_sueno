const db = require('../config/db');
const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gmnooficial16@gmail.com',
    pass: 'txpy wfep jifq byoa'
  }
});

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  const { name, email, password, role, captchaToken } = req.body;

  if (!name || !email || !password || !captchaToken) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email must be a valid Gmail address' });
  }

  const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter.' });
  }

  try {
    const secretKey = '6LdrZ_spAAAAAJqeYWq6fpVNwEevwOMGxcvbubto';
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: secretKey,
        response: captchaToken
      }
    });

    if (!response.data.success || response.data.score < 0.5) {
      return res.status(400).json({ message: 'Captcha verification failed' });
    }

    const [existingUserByEmail] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUserByEmail.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const [existingUserByName] = await db.execute('SELECT * FROM users WHERE name = ?', [name]);
    if (existingUserByName.length > 0) {
      return res.status(400).json({ message: 'Username already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    await db.execute(
      'INSERT INTO users (name, email, password, role, isActive, verificationCode) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, false, verificationCode]
    );

    const mailOptions = {
      from: 'gmnooficial16@gmail.com',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending verification email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(201).json({ message: 'User registered successfully. Please check your email for the verification code.' });
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verificar cuenta
exports.verifyAccount = async (req, res) => {
  const { verificationCode } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE verificationCode = ?', [verificationCode]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    await db.execute('UPDATE users SET isActive = ?, verificationCode = NULL WHERE id = ?', [true, user.id]);

    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error('Error verifying account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not activated. Please check your email for the verification code.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });

    res.json({ token, role: user.role, userId: user.id });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!user.length) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // El token expira en 1 hora

    await db.execute('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [token, expires, email]);

    const mailOptions = {
      from: 'gmnooficial16@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `https://mysueno-lymj.onrender.com/reset/${token}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'Recovery email sent' });
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [user] = await db.execute('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()', [token]);
    if (!user.length) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?', [hashedPassword, user[0].id]);

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
