const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'votre-secret-super-securise';


const Message = require('./models/Message');

// Stockage en mémoire pour les messages (version simplifiée)
let messages = [];
let nextMessageId = 1;

const initializeSimpleSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Utilisateur connecté: ${socket.id}`);

    // Rejoindre un salon
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`🚪 ${socket.id} a rejoint le salon: ${roomId}`);
    });

    // Quitter un salon
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`🚪 ${socket.id} a quitté le salon: ${roomId}`);
    });

    // Envoyer un message
    socket.on('send_message', (messageData) => {
      try {
        const { roomId, content } = messageData;
        
        // Créer le message
        const message = {
          _id: nextMessageId++,
          content,
          room: roomId,
          user: {
            _id: 1, // ID simplifié
            username: 'Utilisateur',
            email: 'user@example.com'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        messages.push(message);

        console.log(`💬 Message envoyé dans ${roomId}: ${content}`);

        // Diffuser le message
        io.to(roomId).emit('new_message', message);

      } catch (error) {
        console.error('Erreur send_message:', error);
        socket.emit('message_error', { error: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`🔌 Utilisateur déconnecté: ${socket.id}`);
    });
  });
};

// Fonction pour récupérer les messages d'un salon (version simplifiée)
const getRoomMessages = (roomId) => {
  return messages.filter(msg => msg.room === roomId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

module.exports = { initializeSimpleSocket, getRoomMessages };
// Stockage en mémoire (temporaire)
let users = [];
let chatRooms = [];
let nextUserId = 1;
let nextRoomId = 1;

app.use(cors());
app.use(express.json());

// Middleware d'authentification
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = users.find(u => u.id === decoded.userId);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log(' Tentative d\'inscription:', { username, email });
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const user = {
      id: nextUserId++,
      username,
      email,
      password: hashedPassword,
      isOnline: true
    };
    
    users.push(user);
    
    // Générer le token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log(` Utilisateur créé: ${username} (ID: ${user.id})`);
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        token,
        user: {
          _id: user.id,
          username: user.username,
          email: user.email,
          isOnline: user.isOnline
        }
      }
    });
    
  } catch (error) {
    console.error(' Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(' Tentative de connexion:', { email });
    
    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Mettre à jour le statut
    user.isOnline = true;
    
    // Générer le token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log(` Connexion réussie: ${user.username}`);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          _id: user.id,
          username: user.username,
          email: user.email,
          isOnline: user.isOnline
        }
      }
    });
    
  } catch (error) {
    console.error(' Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/auth/profile', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        isOnline: req.user.isOnline
      }
    }
  });
});

// Routes des salons de discussion
app.post('/api/chatrooms', auth, (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;

    console.log(' Création salon:', { name, user: req.user.username });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du salon est requis'
      });
    }

    // Vérifier si le salon existe déjà
    if (chatRooms.find(room => room.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Un salon avec ce nom existe déjà'
      });
    }

    // Créer le salon - TOUJOURS PUBLIC pour les tests
    const chatRoom = {
      _id: nextRoomId++,
      name,
      description: description || '',
      isPublic: true, // ← FORCÉ À TRUE
      createdBy: {
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email
      },
      members: [{
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        isOnline: true
      }],
      createdAt: new Date(),
      isActive: true
    };

    chatRooms.push(chatRoom);

    console.log(` Salon créé: "${name}" par ${req.user.username} (ID: ${chatRoom._id})`);
    console.log(` Total salons: ${chatRooms.length}`);

    res.status(201).json({
      success: true,
      message: 'Salon créé avec succès',
      data: { chatRoom }
    });

  } catch (error) {
    console.error(' Erreur création salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/chatrooms', auth, (req, res) => {
  try {
    const { search = '' } = req.query;

    console.log(' Récupération salons publics - Recherche:', search);

    let filteredRooms = chatRooms.filter(room => 
      room.isPublic && room.isActive
    );

    if (search) {
      filteredRooms = filteredRooms.filter(room =>
        room.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    console.log(` ${filteredRooms.length} salons publics retournés`);
    console.log(' Salons:', filteredRooms.map(r => r.name));

    res.json({
      success: true,
      data: { chatRooms: filteredRooms }
    });

  } catch (error) {
    console.error(' Erreur récupération salons:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/chatrooms/my', auth, (req, res) => {
  try {
    const userRooms = chatRooms.filter(room =>
      room.members.some(member => member._id === req.user.id) && room.isActive
    );

    console.log(` Salons de ${req.user.username}: ${userRooms.length} salons`);

    res.json({
      success: true,
      data: { chatRooms: userRooms }
    });

  } catch (error) {
    console.error(' Erreur récupération salons utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/chatrooms/:roomId/join', auth, (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const chatRoom = chatRooms.find(room => room._id === roomId);

    console.log('🚶 Tentative rejoindre salon:', { roomId, user: req.user.username });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Salon non trouvé'
      });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isAlreadyMember = chatRoom.members.some(
      member => member._id === req.user.id
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà membre de ce salon'
      });
    }

    // Ajouter l'utilisateur aux membres
    chatRoom.members.push({
      _id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      isOnline: true
    });

    console.log(` ${req.user.username} a rejoint le salon: ${chatRoom.name}`);
    console.log(` Membres du salon: ${chatRoom.members.length}`);

    res.json({
      success: true,
      message: 'Salon rejoint avec succès',
      data: { chatRoom }
    });

  } catch (error) {
    console.error(' Erreur jointure salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/chatrooms/:roomId/leave', auth, (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const chatRoom = chatRooms.find(room => room._id === roomId);

    console.log(' Tentative quitter salon:', { roomId, user: req.user.username });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Salon non trouvé'
      });
    }

    // Vérifier si l'utilisateur est membre
    const isMember = chatRoom.members.some(
      member => member._id === req.user.id
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'Vous n\'êtes pas membre de ce salon'
      });
    }

    // Empêcher le créateur de quitter
    if (chatRoom.createdBy._id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Le créateur ne peut pas quitter son salon'
      });
    }

    // Retirer l'utilisateur des membres
    chatRoom.members = chatRoom.members.filter(
      member => member._id !== req.user.id
    );

    console.log(` ${req.user.username} a quitté le salon: ${chatRoom.name}`);
    console.log(` Membres restants: ${chatRoom.members.length}`);

    res.json({
      success: true,
      message: 'Salon quitté avec succès',
      data: { chatRoom }
    });

  } catch (error) {
    console.error(' Erreur sortie salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour réinitialiser les données (pour les tests)
app.post('/api/debug/reset', (req, res) => {
  chatRooms = [];
  users = [];
  nextUserId = 1;
  nextRoomId = 1;
  console.log(' Données réinitialisées');
  res.json({ success: true, message: 'Données réinitialisées' });
});

// Route pour voir l'état actuel (debug)
app.get('/api/debug/state', (req, res) => {
  res.json({
    users: users.map(u => ({ id: u.id, username: u.username, email: u.email })),
    chatRooms: chatRooms.map(r => ({
      id: r._id,
      name: r.name,
      isPublic: r.isPublic,
      members: r.members.map(m => m.username),
      createdBy: r.createdBy.username
    })),
    counts: {
      users: users.length,
      chatRooms: chatRooms.length,
      publicRooms: chatRooms.filter(r => r.isPublic).length
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`- Serveur démarré sur le port ${PORT}`);
  console.log(`- API disponible sur http://localhost:${PORT}/api`);
  console.log(`- Utilisation du stockage en mémoire`);
  console.log(`- Routes debug: /api/debug/reset et /api/debug/state`);
});