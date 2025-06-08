// server/models/User.js
// ASSUREZ-VOUS QUE C'EST BIEN VOTRE FICHIER ACTUEL

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Veuillez utiliser une adresse email valide']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'tutor'], // 'student' ou 'tutor'
    default: 'student',
    required: true
  },
  level: { // <--- CORRECTION ICI : Type String, pas [String]
    type: String, // Si le backend attend une seule chaîne pour le niveau
    enum: ['Licence1', 'Licence2', 'Licence3', 'Master1', 'Master2'], // Pas d'espaces
    required: true
  },
  // Les champs 'bio' et 'subjects' ne sont pas dans le format Postman fonctionnel,
  // donc nous les rendons optionnels ou les retirons de la validation requise
  bio: {
    type: String,
    maxlength: 500
    // required: false par défaut si non spécifié
  },
  subjects: {
    type: [mongoose.Schema.Types.ObjectId], // Tableau d'ObjectIds pour les sujets
    ref: 'Subject',
    // required: false par défaut si non spécifié. Ou:
    // required: function() { return this.role === 'tutor'; } // Si vous voulez le rendre requis SEULEMENT pour les tuteurs
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);