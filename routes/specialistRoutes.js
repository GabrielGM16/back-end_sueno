const express = require('express');
const router = express.Router();
const { getSpecialties, createSpecialist, getSpecialistsBySpecialty } = require('../controllers/specialistController');
const authenticateToken = require('../middleware/authMiddleware');

// Ruta para obtener todas las especialidades
router.get('/specialties', authenticateToken, getSpecialties);

// Ruta para crear un nuevo especialista
router.post('/', authenticateToken, createSpecialist);

// Ruta para obtener especialistas por especialidad
router.get('/:specialty', authenticateToken, getSpecialistsBySpecialty);

module.exports = router;
