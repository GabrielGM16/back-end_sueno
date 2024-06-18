const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const habitRoutes = require('./routes/habitRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); // Ruta para citas
const specialistRoutes = require('./routes/specialistRoutes'); // Ruta para especialistas
const bodyParser = require('body-parser');

// Habilitar CORS
app.use(cors());

app.use(bodyParser.json());

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specialists', specialistRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
