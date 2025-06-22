// server/routes/sessionRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Notre middleware d'authentification
const sessionController = require('../controllers/sessionController'); // Importe votre contrôleur de sessions

// @route   POST /api/sessions
// @desc    Créer une nouvelle session
// @access  Private
router.post('/', auth, sessionController.createSession);

module.exports = router;