// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importe votre contrôleur

// Route pour l'inscription d'un nouvel utilisateur
// POST /api/auth/register
router.post('/register', authController.register);

// Route pour la connexion d'un utilisateur existant
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;