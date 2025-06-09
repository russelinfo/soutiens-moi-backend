// server/models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    sender: { // L'ID de l'utilisateur qui a envoyé le message
        type: String, // Ou mongoose.Schema.Types.ObjectId si tu références un utilisateur existant
        required: true
    },
    recipient: { // L'ID du destinataire du message (pour le chat privé)
        type: String, // Ou mongoose.Schema.Types.ObjectId
        required: false // Peut être facultatif si c'est un chat général
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;