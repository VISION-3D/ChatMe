// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,  // ← CHANGEZ ObjectId en String
    required: true,
    ref: 'ChatRoom'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // ← Rendre optionnel pour les anonymes
  }
}, {
  timestamps: true
});

// Index pour les performances
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ user: 1 });

module.exports = mongoose.model('Message', messageSchema);