// server/controllers/sessionController.js

const Session = require('../models/Sessions'); // Assurez-vous que le nom du fichier est Sessions.js et le modèle Session
const User = require('../models/User');     // Pour récupérer les détails de l'utilisateur (tuteur, étudiant)
const Subject = require('../models/Subject');   // Pour vérifier le sujet
const mongoose = require('mongoose'); // Pour les ObjectIds

// @route   POST /api/sessions
// @desc    Créer une nouvelle session
// @access  Private (authentifié)
exports.createSession = async (req, res) => {
  const { subject, tutor, date, startTime, endTime, mode, level } = req.body;
  const studentId = req.user.id; // L'ID de l'utilisateur connecté vient du middleware d'authentification

  try {
    // 1. Validation de base des champs
    if (!subject || !tutor || !date || !startTime || !endTime || !mode) {
      return res.status(400).json({ msg: 'Veuillez remplir tous les champs obligatoires pour la session.' });
    }

    // 2. Vérifier si l'utilisateur connecté est bien un étudiant (celui qui crée la session)
    // C'est une bonne pratique de s'assurer que seul un étudiant peut initier une session
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ msg: 'Seuls les étudiants sont autorisés à planifier une session.' });
    }

    // 3. Vérifier si le tuteur existe et a le rôle 'tutor'
    const foundTutor = await User.findById(tutor);
    if (!foundTutor || foundTutor.role !== 'tutor') {
      return res.status(400).json({ msg: 'Le tuteur sélectionné est invalide ou n\'est pas un tuteur.' });
    }

    // 4. Vérifier si le sujet existe
    const foundSubject = await Subject.findById(subject);
    if (!foundSubject) {
      return res.status(400).json({ msg: 'Le sujet sélectionné est invalide.' });
    }

    // 5. Créer la session
    const newSession = new Session({
      subject: new mongoose.Types.ObjectId(subject),
      tutor: new mongoose.Types.ObjectId(tutor),
      student: new mongoose.Types.ObjectId(studentId),
      date: new Date(date), // Convertir la chaîne de date en objet Date
      startTime,
      endTime,
      mode,
      status: 'upcoming' // Statut initial
      // 'level' n'est pas stocké directement dans la session mais utilisé pour trouver le tuteur.
      // Si vous voulez le stocker, ajoutez-le au modèle Session.js.
    });

    await newSession.save();

    res.status(201).json({ msg: 'Session créée avec succès!', session: newSession });

  } catch (err) {
    console.error(err.message);
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Format d\'ID invalide pour le sujet ou le tuteur.' });
    }
    res.status(500).send('Erreur Serveur lors de la création de la session.');
  }
};

// @route   GET /api/users/tutors
// @desc    Récupérer la liste des utilisateurs avec le rôle 'tutor'
// @access  Private (authentifié) - La liste des tuteurs est souvent visible seulement pour les utilisateurs connectés
exports.getTutors = async (req, res) => {
  try {
    // Récupérer les tuteurs. Si vous avez besoin de filtres (par sujet, par niveau), ajoutez-les ici.
    const { subjectId, level } = req.query; // Récupérer les paramètres de requête

    let query = { role: 'tutor' };

    if (subjectId) {
      // Filtrer par les sujets enseignés par le tuteur
      query.subjects = new mongoose.Types.ObjectId(subjectId);
    }
    if (level) {
      // Filtrer par le niveau que le tuteur peut enseigner
      query.level = level; // Assurez-vous que le champ 'level' dans le modèle User existe et est comparable
    }

    const tutors = await User.find(query)
      .select('-password') // Ne pas envoyer le mot de passe
      .populate('subjects', 'name'); // Populer les noms des sujets

    res.json(tutors);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'CastError' && (req.query.subjectId || req.query.level)) {
      return res.status(400).json({ msg: 'Format d\'ID ou de paramètre de filtre invalide.' });
    }
    res.status(500).send('Erreur Serveur lors de la récupération des tuteurs.');
  }
};