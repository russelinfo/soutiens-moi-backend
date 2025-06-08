// server/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Notre middleware d'authentification
const User = require('../models/User'); // Pour récupérer les détails de l'utilisateur
const Session = require('../models/Sessions'); // Importez le modèle Session
const Stats = require('../models/Stats');   // Importez le modèle Stats

/**
 * @route   GET /api/dashboard/me
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id est disponible grâce au middleware 'auth'
    const user = await User.findById(req.user.id)
      .select('-password') // Ne pas renvoyer le mot de passe
      .populate('subjects', 'name'); // Popule les sujets si l'utilisateur est un tuteur, ne sélectionne que le 'name'
    
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur lors de la récupération du profil.');
  }
});

/**
 * @route   GET /api/dashboard/upcoming-sessions
 * @desc    Récupérer les prochaines sessions de l'utilisateur connecté
 * @access  Private
 */
router.get('/upcoming-sessions', auth, async (req, res) => {
  try {
    // Récupérer les sessions où l'utilisateur est soit le tuteur, soit l'étudiant
    // Et dont la date est future (>= aujourd'hui)
    const sessions = await Session.find({
      $or: [{ tutor: req.user.id }, { student: req.user.id }],
      date: { $gte: new Date().setHours(0, 0, 0, 0) }, // Sessions à partir d'aujourd'hui
      status: 'upcoming' // Ne récupérer que les sessions non complétées/annulées
    })
    .populate('subject', 'name') // Popule le nom du sujet
    .populate('tutor', 'username') // Popule le nom d'utilisateur du tuteur
    .populate('student', 'username') // Popule le nom d'utilisateur de l'étudiant
    .sort('date startTime') // Trie par date puis par heure de début
    .limit(3); // Limite aux 3 prochaines sessions, comme dans l'exemple initial

    // Formater les sessions pour correspondre à ce que le frontend attend
    const formattedSessions = sessions.map(session => {
        // Obtenez le jour et le mois formatés
        const sessionDate = new Date(session.date);
        const day = sessionDate.getDate().toString();
        const month = sessionDate.toLocaleString('fr-FR', { month: 'short' }); // Ex: "juin"

        return {
            _id: session._id,
            day: day,
            month: month.charAt(0).toUpperCase() + month.slice(1) + '.', // Capitalise et ajoute un point
            subject: session.subject ? session.subject.name : 'N/A', // Nom du sujet
            tutor: session.tutor ? session.tutor.username : 'N/A', // Nom du tuteur
            time: `${session.startTime} - ${session.endTime}`, // Heure de début et fin
            mode: session.mode
        };
    });

    res.json(formattedSessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur lors de la récupération des sessions.');
  }
});

/**
 * @route   GET /api/dashboard/stats
 * @desc    Récupérer les statistiques de l'utilisateur connecté
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Chercher les statistiques spécifiques à l'utilisateur connecté
    const stats = await Stats.findOne({ user: req.user.id });

    if (!stats) {
      // Si aucune statistique n'est trouvée pour cet utilisateur, renvoyer des valeurs par défaut
      return res.json({
        totalSessions: 0,
        hoursLearned: 0,
        averageRating: 0
      });
    }

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur lors de la récupération des statistiques.');
  }
});

module.exports = router;