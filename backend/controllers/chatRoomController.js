const ChatRoom = require('../models/ChatRoom');

// Créer un salon
exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;

    // Vérifier si le nom est fourni
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du salon est requis'
      });
    }

    // Vérifier si le salon existe déjà
    const existingRoom = await ChatRoom.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Un salon avec ce nom existe déjà'
      });
    }

    // Créer le nouveau salon
    const chatRoom = new ChatRoom({
      name,
      description,
      isPublic,
      createdBy: req.user._id,
      members: [req.user._id] // Le créateur est automatiquement membre
    });

    await chatRoom.save();
    
    // Récupérer les détails complets
    await chatRoom.populate('createdBy', 'username email');
    await chatRoom.populate('members', 'username email isOnline');

    res.status(201).json({
      success: true,
      message: 'Salon créé avec succès',
      data: { chatRoom }
    });

  } catch (error) {
    console.error('Erreur création salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir tous les salons publics
exports.getRooms = async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Construire la requête de recherche
    const query = { 
      isPublic: true,
      isActive: true 
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const chatRooms = await ChatRoom.find(query)
      .populate('createdBy', 'username email')
      .populate('members', 'username email isOnline')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { chatRooms }
    });

  } catch (error) {
    console.error('Erreur récupération salons:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Rejoindre un salon
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chatRoom = await ChatRoom.findById(roomId)
      .populate('createdBy', 'username email')
      .populate('members', 'username email isOnline');

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Salon non trouvé'
      });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isAlreadyMember = chatRoom.members.some(
      member => member._id.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà membre de ce salon'
      });
    }

    // Ajouter l'utilisateur aux membres
    chatRoom.members.push(req.user._id);
    await chatRoom.save();
    await chatRoom.populate('members', 'username email isOnline');

    res.json({
      success: true,
      message: 'Salon rejoint avec succès',
      data: { chatRoom }
    });

  } catch (error) {
    console.error('Erreur jointure salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Quitter un salon
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chatRoom = await ChatRoom.findById(roomId)
      .populate('createdBy', 'username email')
      .populate('members', 'username email isOnline');

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Salon non trouvé'
      });
    }

    // Vérifier si l'utilisateur est membre
    const isMember = chatRoom.members.some(
      member => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'Vous n\'êtes pas membre de ce salon'
      });
    }

    // Empêcher le créateur de quitter
    if (chatRoom.createdBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Le créateur ne peut pas quitter son salon'
      });
    }

    // Retirer l'utilisateur des membres
    chatRoom.members = chatRoom.members.filter(
      member => member._id.toString() !== req.user._id.toString()
    );

    await chatRoom.save();
    await chatRoom.populate('members', 'username email isOnline');

    res.json({
      success: true,
      message: 'Salon quitté avec succès',
      data: { chatRoom }
    });

  } catch (error) {
    console.error('Erreur sortie salon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les salons de l'utilisateur
exports.getUserRooms = async (req, res) => {
  try {
    const userRooms = await ChatRoom.find({
      members: req.user._id,
      isActive: true
    })
    .populate('createdBy', 'username email')
    .populate('members', 'username email isOnline')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { chatRooms: userRooms }
    });

  } catch (error) {
    console.error('Erreur récupération salons utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};