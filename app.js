require('dotenv').config();

//Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importation de vos routes API
const authRoutes = require('./routes/authRoutes');
const subjectsRoutes = require('./routes/subjects');

// 3. Initialisation de l'application Express
const app = express();
// Permet à toutes les origines (*) de faire des requêtes vers votre API.
app.use(cors());

// Middleware pour parser les requêtes au format JSON.
app.use(express.json());

//Middleware pour parser les requêtes URL-encoded (utile pour les formulaires web).
app.use(express.urlencoded({ extended: true }));

//Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas')) // Message de succès
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

//Définition des Routes API
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);

//Route de test simple pour vérifier que l'API est accessible
app.get('/', (req, res) => {
  res.status(200).send('🚀 API Backend fonctionne ! Bienvenue sur Soutiens-Moi.');
});

//Export de l'application Express pour Vercel
module.exports = app;
