import React, { createContext, useState, useContext, useCallback } from 'react';
import { messageAPI } from '../services/api';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  
  const { socket, isConnected } = useSocket();

  // Rejoindre un salon de discussion
  const joinRoom = useCallback((room) => {
    if (!socket || !isConnected) {
      console.error('Socket non connecté');
      return;
    }

    console.log(' Rejoindre le salon:', room._id);
    setActiveRoom(room);
    
    // Rejoindre le salon Socket.IO
    socket.emit('join_room', room._id);
    
    // Charger l'historique des messages
    loadMessages(room._id);
  }, [socket, isConnected, loadMessages]);

  // Quitter le salon actuel
  const leaveRoom = useCallback(() => {
    if (activeRoom && socket) {
      socket.emit('leave_room', activeRoom._id);
    }
    setActiveRoom(null);
    setMessages([]);
    setTypingUsers([]);
  }, [activeRoom, socket]);

  // Charger l'historique des messages
  const loadMessages = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await messageAPI.getRoomMessages(roomId, {
        limit: 100
      });
      
      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de chargement des messages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (content) => {
    if (!socket || !activeRoom || !content.trim()) {
      return;
    }

    try {
      socket.emit('send_message', {
        roomId: activeRoom._id,
        content: content.trim()
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  }, [socket, activeRoom]);

  // Éditer un message
  const editMessage = useCallback((messageId, newContent) => {
    if (!socket || !newContent.trim()) {
      return;
    }

    socket.emit('edit_message', {
      messageId,
      newContent: newContent.trim()
    });
  }, [socket]);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const response = await messageAPI.deleteMessage(messageId);
      if (response.data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de suppression';
      setError(errorMessage);
    }
  }, []);

  // Gestion des événements Socket.IO
  React.useEffect(() => {
    if (!socket) return;

    // Nouveau message reçu
    const handleNewMessage = (message) => {
      console.log(' Nouveau message reçu:', message);
      setMessages(prev => [...prev, message]);
    };

    // Message édité
    const handleMessageEdited = (editedMessage) => {
      setMessages(prev => prev.map(msg =>
        msg._id === editedMessage._id ? editedMessage : msg
      ));
    };

    // Message supprimé
    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    // Utilisateur en train de taper
    const handleUserTyping = (userData) => {
      setTypingUsers(prev => {
        const exists = prev.find(u => u.userId === userData.userId);
        if (!exists) {
          return [...prev, userData];
        }
        return prev;
      });
    };

    // Utilisateur arrête de taper
    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    };

    // Erreur de message
    const handleMessageError = (errorData) => {
      setError(errorData.error);
    };

    // Écouter les événements
    socket.on('new_message', handleNewMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('message_error', handleMessageError);

    // Nettoyer les écouteurs
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('message_error', handleMessageError);
    };
  }, [socket]);

  // Indicateur de frappe
  const startTyping = useCallback(() => {
    if (socket && activeRoom) {
      socket.emit('typing_start', activeRoom._id);
    }
  }, [socket, activeRoom]);

  const stopTyping = useCallback(() => {
    if (socket && activeRoom) {
      socket.emit('typing_stop', activeRoom._id);
    }
  }, [socket, activeRoom]);

  const value = {
    activeRoom,
    messages,
    loading,
    error,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    clearError: () => setError('')
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};