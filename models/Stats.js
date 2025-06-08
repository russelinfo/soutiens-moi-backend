// server/models/Stats.js

const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Chaque utilisateur n'a qu'une seule entrée de statistiques
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  hoursLearned: { // ou hoursTaught
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Vous pouvez ajouter d'autres stats ici (ex: sessionsCompleted, sessionsCancelled, etc.)
}, {
  timestamps: true
});

module.exports = mongoose.model('Stats', StatsSchema);