import React, { createContext, useState, useContext, useCallback } from 'react';
import { chatRoomAPI } from '../services/api';

const ChatRoomContext = createContext();

export const useChatRoom = () => {
  const context = useContext(ChatRoomContext);
  if (!context) {
    throw new Error('useChatRoom must be used within a ChatRoomProvider');
  }
  return context;
};

export const ChatRoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const createRoom = useCallback(async (roomData) => {
    try {
      setError('');
      setLoading(true);
      const response = await chatRoomAPI.create(roomData);
      
      if (response.data.success) {
        const newRoom = response.data.data.chatRoom;
        setMyRooms(prev => [newRoom, ...prev]);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur création salon';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getRooms = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await chatRoomAPI.getAll(params);
      
      if (response.data.success) {
        setRooms(response.data.data.chatRooms);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur récupération salons';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatRoomAPI.getMyRooms();
      
      if (response.data.success) {
        setMyRooms(response.data.data.chatRooms);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur récupération salons utilisateur';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomId) => {
    try {
      setError('');
      setLoading(true);
      const response = await chatRoomAPI.join(roomId);
      
      if (response.data.success) {
        const updatedRoom = response.data.data.chatRoom;
        setRooms(prev => prev.map(room => 
          room._id === roomId ? updatedRoom : room
        ));
        setMyRooms(prev => [updatedRoom, ...prev.filter(room => room._id !== roomId)]);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur jointure salon';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveRoom = useCallback(async (roomId) => {
    try {
      setError('');
      setLoading(true);
      const response = await chatRoomAPI.leave(roomId);
      
      if (response.data.success) {
        const updatedRoom = response.data.data.chatRoom;
        setRooms(prev => prev.map(room => 
          room._id === roomId ? updatedRoom : room
        ));
        setMyRooms(prev => prev.filter(room => room._id !== roomId));
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur sortie salon';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    rooms,
    myRooms,
    loading,
    error,
    createRoom,
    getRooms,
    getMyRooms,
    joinRoom,
    leaveRoom,
    clearError
  };

  return (
    <ChatRoomContext.Provider value={value}>
      {children}
    </ChatRoomContext.Provider>
  );
};