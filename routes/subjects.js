// server/routes/subjects.js

const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject'); // Importe le modèle Subject

/**
 * @route   GET /api/subjects
 * @desc    Récupérer tous les sujets disponibles
 * @access  Public (car la liste des sujets est nécessaire pour l'inscription)
 */
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({}); // Trouver tous les documents Sujet dans la base de données
    res.json(subjects); // Renvoyer les sujets au format JSON
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur lors de la récupération des sujets.');
  }
});

module.exports = router;