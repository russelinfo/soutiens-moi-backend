// server/index.js (ou app.js, le fichier principal de votre backend)

require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // NOUVEAU: Importe le module HTTP de Node.js pour Socket.IO
const { Server } = require("socket.io"); // NOUVEAU: Importe la classe Server de socket.io

// Importation de vos routes API existantes
const authRoutes = require('./routes/authRoutes');
const subjectsRoutes = require('./routes/subjects');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Assurez-vous que cette route existe si elle est utilisée

// NOUVEAU: Importe le modèle de Message pour le chat
const Message = require('./models/Message'); // Assurez-vous que ce chemin est correct (ex: ./models/Message.js)

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app); // NOUVEAU: Crée un serveur HTTP à partir de votre application Express pour Socket.IO

// Configure le port d'écoute (Vercel gérera cela, mais bon pour le local)
const PORT = process.env.PORT || 3000;

// Configuration CORS pour Express et Socket.IO
// IMPORTANT : Mettez l'URL de votre frontend déployé sur Vercel ici.
const allowedOrigins = [
  "http://localhost:8100", // Votre frontend Ionic en développement
  "https://votre-frontend-soutiens-moi.vercel.app" // <--- TRÈS IMPORTANT : REMPLACEZ CECI PAR L'URL RÉELLE DE VOTRE FRONTEND DÉPLOYÉ
];

// Middleware Express CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // OPTIONS est important pour les requêtes preflight CORS
  allowedHeaders: ['Content-Type', 'Authorization'], // 'Content-Type' et 'Authorization' sont essentiels
  credentials: true // Permet l'envoi de cookies d'authentification ou d'en-têtes
}));

// Middleware pour parser les requêtes au format JSON.
app.use(express.json());

// Middleware pour parser les requêtes URL-encoded (utile pour les formulaires web).
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas')) // Message de succès
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Initialisation de Socket.IO et configuration CORS pour Socket.IO
const io = new Server(server, { // NOUVEAU: Attache Socket.IO au serveur HTTP
    cors: {
        origin: allowedOrigins, // Applique les mêmes origines CORS pour Socket.IO
        methods: ["GET", "POST"]
    }
});

// Définition des Routes API Express (vos routes existantes)
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/dashboard', dashboardRoutes); // Utilisation de la route dashboard

// NOUVELLE ROUTE API REST POUR RÉCUPÉRER L'HISTORIQUE DU CHAT
app.get('/api/messages', async (req, res) => {
    try {
        // Pour un chat simple et général, on récupère les 100 derniers messages triés par date.
        // Pour un chat privé, cette route devrait être adaptée pour filtrer
        // les messages entre deux utilisateurs spécifiques (par exemple, via des query params: req.query.user1Id, req.query.user2Id)
        const messages = await Message.find().sort({ timestamp: 1 }).limit(100); // Récupère les 100 derniers messages
        res.json(messages);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des messages:', error);
        res.status(500).json({ message: 'Erreur serveur interne lors de la récupération des messages.' });
    }
});


// Logique Socket.IO pour la gestion du chat en temps réel
io.on('connection', (socket) => {
    console.log(`💬 Un utilisateur s'est connecté via Socket.IO : ${socket.id}`);

    // Écoute l'événement 'chat message' envoyé par le client
    socket.on('chat message', async (msg) => {
        console.log('📬 Message reçu du client :', msg);
        try {
            // Sauvegarde le message en base de données
            const newMessage = new Message({
                text: msg.text,
                sender: msg.sender,
                // Si vous avez un chat privé, vous ajouteriez ici un champ recipient: msg.recipient
                timestamp: new Date() // S'assurer que le timestamp est défini par le serveur
            });
            await newMessage.save(); // Sauvegarde le message
            console.log('💾 Message sauvegardé :', newMessage);

            // Émet le message à TOUS les clients connectés via Socket.IO
            // Pour un chat privé, vous devriez gérer des "rooms" ou émettre uniquement
            // aux sockets des utilisateurs concernés (ex: io.to(roomName).emit('chat message', newMessage);)
            io.emit('chat message', { // Renvoie le message complet, y compris l'ID généré par MongoDB
                _id: newMessage._id,
                text: newMessage.text,
                sender: newMessage.sender,
                // recipient: newMessage.recipient, // À inclure si vous avez un champ recipient dans votre modèle Message
                timestamp: newMessage.timestamp
            });
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde ou de l\'émission du message Socket.IO :', error);
        }
    });

    // Gère la déconnexion d'un utilisateur
    socket.on('disconnect', () => {
        console.log(`👋 L'utilisateur ${socket.id} s'est déconnecté du chat.`);
    });
});

// Route de test simple pour vérifier que l'API est accessible
app.get('/', (req, res) => {
  res.status(200).send('🚀 API Backend fonctionne ! Bienvenue sur Soutiens-Moi.');
});

// Export de l'application Express ET du serveur HTTP pour Vercel
// Vercel utilisera `module.exports` pour démarrer votre fonction de handler.
// Pour Socket.IO, Vercel recommande d'exporter le serveur http.
module.exports = server; // NOUVEAU: Exportez le serveur HTTP qui englobe Express et Socket.IO

// La section `app.listen` n'est plus nécessaire pour le déploiement Vercel car `module.exports = server;` gère cela.
// Pour le développement local, vous pouvez décommenter la ligne suivante :
/*
server.listen(PORT, () => {
  console.log(`Serveur backend (Express & Socket.IO) démarré sur le port ${PORT}`);
});
*/