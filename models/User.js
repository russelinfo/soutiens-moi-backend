// server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Le nom d'utilisateur doit être unique
    trim: true    // Supprime les espaces blancs inutiles
  },
  email: {
    type: String,
    required: true,
    unique: true, // L'email doit être unique
    match: [/.+@.+\..+/, 'Veuillez utiliser une adresse email valide'] // Validation de format simple
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Longueur minimale pour le mot de passe
  },
  role: {
    type: String,
    enum: ['student', 'tutor'], // Le rôle doit être 'student' ou 'tutor'
    default: 'student', // Par défaut, un nouvel utilisateur est un étudiant
    required: true
  },
  level: {
    type: [String], // Peut être un tableau de niveaux (pour tuteurs) ou un seul niveau (pour étudiants)
    // Utiliser un tableau permet plus de flexibilité pour les tuteurs qui peuvent enseigner plusieurs niveaux
    // Ou si un étudiant peut avoir plusieurs "niveaux d'intérêt"
    // Ou juste String si c'est un seul niveau par défaut. Pour notre cas, un tableau est mieux pour les tuteurs.
    enum: ['Licence1', 'Licence2', 'Licence3', 'Master1', 'Master2'],
    required: true // Chaque utilisateur doit avoir au moins un niveau défini
  },
  // Champs spécifiques aux tuteurs (optionnels, seront présents si role est 'tutor')
  bio: {
    type: String,
    maxlength: 500
  },
  subjects: {
    type: [mongoose.Schema.Types.ObjectId], // <-- CHANGEMENT MAJEUR ICI : type ObjectId
    ref: 'Subject' // <-- Référence au modèle 'Subject' que nous venons de créer
    // required: function() { return this.role === 'tutor'; } // Exemple: requis seulement pour les tuteurs
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);