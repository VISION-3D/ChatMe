const express = require('express');
const {
  createRoom,
  getRooms,
  joinRoom,
  leaveRoom,
  getUserRooms
} = require('../controllers/chatRoomController');
const auth = require('../middleware/auth');

const router = express.Router();

// Toutes les routes sont protégées par l'authentification
router.use(auth);

// POST /api/chatrooms - Créer un nouveau salon
router.post('/', createRoom);

// GET /api/chatrooms - Récupérer tous les salons publics
router.get('/', getRooms);

// GET /api/chatrooms/my - Récupérer les salons de l'utilisateur
router.get('/my', getUserRooms);

// POST /api/chatrooms/:roomId/join - Rejoindre un salon
router.post('/:roomId/join', joinRoom);

// POST /api/chatrooms/:roomId/leave - Quitter un salon
router.post('/:roomId/leave', leaveRoom);

module.exports = router;