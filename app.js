// server/index.js (ou le nom de votre fichier principal)

require('dotenv').config(); // Charge les variables d'environnement
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Pour MongoDB
const authRoutes = require('./routes/authRoutes'); // Importe vos routes d'authentification
const subjectsRoutes = require('./routes/subjects'); // <-- NOUVEAU : Importe vos routes de sujets
const userRoutes = require('./routes/userRoutes');           // <-- NOUVEAU
const sessionRoutes = require('./routes/sessionRoutes');   



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Permet de parser le JSON des requêtes

// Connexion à la base de données MongoDB
// Utilisez process.env.MONGODB_URI directement, il est déjà chargé par dotenv
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB Atlas'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

// Routes API
// Toutes les routes définies dans authRoutes.js commenceront par /api/auth
app.use('/api/auth', authRoutes);

// <-- NOUVEAU : Toutes les routes définies dans subjects.js commenceront par /api/subjects
app.use('/api/subjects', subjectsRoutes);

// <-- NOUVEAU : Toutes les routes définies dans dashboardRoutes.js commenceront par /api/dashboard
const dashboardRoutes = require('./routes/dashboardRoutes'); // Importe vos routes de tableau de bord
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/sessions', sessionRoutes);   // <-- NOUVEAU : pour la création de sessions
app.use('/api/users', userRoutes);      

// Route de test simple
app.get('/', (req, res) => {
  res.send('API Backend fonctionne !');
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});

