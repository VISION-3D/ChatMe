const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-super-securise';

console.log(' Chargement du Socket Handler...');

// Authentification Socket.IO
const authenticateSocket = (socket, next) => {
  try {
    console.log(' Authentification Socket.IO en cours...');
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('  Aucun token fourni, connexion anonyme autorisée');
      socket.userId = 'anonymous';
      socket.username = 'Anonyme';
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    console.log(` Utilisateur authentifié: ${socket.username}`);
    next();
  } catch (error) {
    console.log(' Erreur authentification Socket.IO:', error.message);
    socket.userId = 'anonymous';
    socket.username = 'Anonyme';
    next(); // Autoriser quand même la connexion pour le moment
  }
};

const initializeSocket = (io) => {
  console.log(' Initialisation de Socket.IO...');

  // Middleware d'authentification
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(` NOUVELLE CONNEXION: ${socket.username} (${socket.id})`);
    
    // Envoyer un message de bienvenue
    socket.emit('connection_success', {
      message: 'Connecté au serveur Socket.IO!',
      socketId: socket.id,
      username: socket.username
    });

    // Rejoindre un salon spécifique
    socket.on('join_room', (roomId) => {
      console.log(` ${socket.username} rejoint le salon: ${roomId}`);
      socket.join(roomId);
      
      // Notifier les autres utilisateurs
      socket.to(roomId).emit('user_joined', {
        username: socket.username,
        roomId: roomId,
        message: `${socket.username} a rejoint le salon`
      });
    });

    // Quitter un salon
    socket.on('leave_room', (roomId) => {
      console.log(` ${socket.username} quitte le salon: ${roomId}`);
      socket.leave(roomId);
    });

    // CORRECTION : Envoyer un message avec gestion des IDs
    socket.on('send_message', async (messageData) => {
      try {
        const { roomId, content } = messageData;
        
        console.log(` ${socket.username} envoie un message dans ${roomId}: ${content}`);
        
        // VÉRIFIER SI C'EST UN SALON DEMO OU RÉEL
        let roomToSave = roomId;
        
        // Si c'est un salon demo (commence par "demo-"), chercher le vrai salon général
        if (roomId.startsWith('demo-')) {
          console.log(' Salon demo détecté, utilisation du salon général par défaut');
          // Trouver le salon général réel
          const generalRoom = await ChatRoom.findOne({ name: 'général' });
          if (generalRoom) {
            roomToSave = generalRoom._id;
          } else {
            // Créer un salon général s'il n'existe pas
            const newGeneralRoom = new ChatRoom({
              name: 'général',
              description: 'Salon de discussion générale',
              isPublic: true,
              createdBy: socket.userId !== 'anonymous' ? socket.userId : null
            });
            await newGeneralRoom.save();
            roomToSave = newGeneralRoom._id;
          }
        }
        
        // Sauvegarder le message en base
        const message = new Message({
          content,
          room: roomToSave,  // Utiliser l'ID corrigé
          user: socket.userId !== 'anonymous' ? socket.userId : null
        });

        await message.save();
        
        // Populer les informations utilisateur
        if (socket.userId !== 'anonymous') {
          await message.populate('user', 'username email');
        } else {
          // Pour les utilisateurs anonymes, créer un objet user simulé
          message.user = {
            _id: 'anonymous',
            username: 'Anonyme',
            email: null
          };
        }

        console.log(` Message sauvegardé avec ID: ${message._id}`);

        // Diffuser le message à tous les membres du salon
        io.to(roomId).emit('new_message', {
          _id: message._id,
          content: message.content,
          user: {
            _id: message.user._id,
            username: message.user.username,
            email: message.user.email
          },
          room: roomId, // Garder l'ID original pour le frontend
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        });

      } catch (error) {
        console.error(' Erreur send_message:', error);
        socket.emit('message_error', { error: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Test de connexion
    socket.on('ping', (data) => {
      console.log(' Ping reçu:', data);
      socket.emit('pong', { 
        message: 'Pong from server!',
        timestamp: new Date(),
        socketId: socket.id
      });
    });

    // Déconnexion
    socket.on('disconnect', (reason) => {
      console.log(`🔌 DÉCONNEXION: ${socket.username} (${socket.id}) - Raison: ${reason}`);
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
      console.error(` Erreur Socket ${socket.id}:`, error);
    });
  });

  console.log(' Socket.IO handler complètement initialisé!');
};

module.exports = { initializeSocket };