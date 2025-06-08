// server/models/Subject.js

const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Le nom du sujet doit être unique
    trim: true
  },
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Subject', SubjectSchema);