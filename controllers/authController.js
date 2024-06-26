const db = require('../config/db');
const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');

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
    await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Consulta la base de datos para obtener el usuario por correo electrónico
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    // Si el usuario no existe, devolvemos un error de autenticación
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Comparamos la contraseña proporcionada con la almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generamos un token JWT para el usuario
    const token = jwt.sign({ userId: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });

    // Enviamos la respuesta con el token, el rol y el ID del usuario
    res.json({ token, role: user.role, userId: user.id });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
