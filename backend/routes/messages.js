const express = require('express');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const auth = require('../middleware/auth');

const router = express.Router();

// Récupérer l'historique des messages d'un salon
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Vérifier que l'utilisateur est membre du salon
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Salon non trouvé'
      });
    }

    const isMember = room.members.some(
      member => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas membre de ce salon'
      });
    }

    // Récupérer les messages
    const messages = await Message.find({ room: roomId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ room: roomId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Plus ancien en premier
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    });

  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Supprimer un message (seulement par l'auteur)
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      user: req.user._id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé ou non autorisé'
      });
    }

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;