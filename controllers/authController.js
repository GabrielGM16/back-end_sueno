const db = require('../config/db');
const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gmnooficial16@gmail.com',
    pass: 'txpy wfep jifq byoa' // Asegúrate de usar tu contraseña real aquí
  }
});

exports.register = async (req, res) => {
  const { name, email, password, role, captchaToken } = req.body;

  // Validar que todos los campos estén presentes
  if (!name || !email || !password || !captchaToken) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validar formato de correo electrónico (debe ser @gmail.com)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email must be a valid Gmail address' });
  }

  // Validar formato de contraseña
  const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter.' });
  }

  try {
    // Verificar el token de reCAPTCHA
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

    // Verificar si el correo electrónico ya está registrado
    const [existingUserByEmail] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUserByEmail.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Verificar si el nombre de usuario ya está registrado
    const [existingUserByName] = await db.execute('SELECT * FROM users WHERE name = ?', [name]);
    if (existingUserByName.length > 0) {
      return res.status(400).json({ message: 'Username already registered' });
    }

    // Encriptar la contraseña y registrar el usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generar código de verificación de 6 dígitos

    await db.execute(
      'INSERT INTO users (name, email, password, role, isActive, verificationCode) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, false, verificationCode]
    );

    // Configurar el correo electrónico
    const mailOptions = {
      from: 'gmnooficial16@gmail.com',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is ${verificationCode}`
    };

    // Enviar el correo electrónico
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

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generar código de verificación de 6 dígitos

    await db.execute('UPDATE users SET verificationCode = ? WHERE email = ?', [verificationCode, email]);

    // Configurar el correo electrónico
    const mailOptions = {
      from: 'gmnooficial16@gmail.com',
      to: email,
      subject: 'Login Verification Code',
      text: `Your verification code is ${verificationCode}`
    };

    // Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending verification email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Verification code sent to your email.' });
      }
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND verificationCode = ?', [email, code]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    await db.execute('UPDATE users SET verificationCode = NULL WHERE email = ?', [email]);

    const token = jwt.sign({ userId: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });

    res.json({ token, role: user.role, userId: user.id });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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

    // Enviar el código de verificación al correo del usuario
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generar código de verificación de 6 dígitos

    await db.execute('UPDATE users SET verificationCode = ? WHERE email = ?', [verificationCode, email]);

    // Configurar el correo electrónico
    const mailOptions = {
      from: 'gmnooficial16@gmail.com',
      to: email,
      subject: 'Login Verification Code',
      text: `Your verification code is ${verificationCode}`
    };

    // Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending verification email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Verification code sent to your email.' });
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const resetPasswordToken = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });

    await db.execute('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [resetPasswordToken, new Date(Date.now() + 3600000), email]);

    const mailOptions = {
      from: 'gmnooficial16@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
             https://main.d3nk5qmj6p2cr8.amplifyapp.com/reset-password/${resetPasswordToken}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending password reset email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Password reset email sent.' });
      }
    });
  } catch (error) {
    console.error('Error processing password reset request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, 'secret_key');
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ? AND resetPasswordToken = ?', [decoded.userId, token]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?', [hashedPassword, user.id]);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
