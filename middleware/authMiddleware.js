// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Récupérer le token de l'en-tête
  const token = req.header('x-auth-token');

  // Vérifier si pas de token
  if (!token) {
    return res.status(401).json({ msg: 'Aucun token, autorisation refusée' });
  }

  // Vérifier le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
    req.user = decoded.user; // Ajoute l'utilisateur décodé à l'objet de requête
    next(); // Passe au middleware/route suivant
  } catch (err) {
    res.status(401).json({ msg: 'Token non valide' });
  }
};