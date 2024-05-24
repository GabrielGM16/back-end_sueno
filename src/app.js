const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const habitRoutes = require('./routes/habitRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const specialistRoutes = require('./routes/specialistRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specialists', specialistRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
