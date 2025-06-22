// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const sessionController = require('../controllers/sessionController'); // Réutilise le contrôleur pour getTutors

// @route   GET /api/users/tutors
// @desc    Récupérer la liste des utilisateurs avec le rôle 'tutor'
// @access  Private (nécessite d'être authentifié)
router.get('/tutors', auth, sessionController.getTutors);

module.exports = router;