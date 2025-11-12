import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(' Vérification auth - Token présent:', !!token);
      
      if (token) {
        const response = await authAPI.getProfile();
        console.log(' Profil récupéré:', response.data);
        
        if (response.data.success) {
          setUser(response.data.data.user);
          console.log('👤 Utilisateur connecté:', response.data.data.user.username);
        }
      }
    } catch (error) {
      console.error(' Erreur vérification auth:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log(' Tentative de connexion...', { email });
      setError('');
      const response = await authAPI.login(email, password);
      
      console.log(' Réponse login:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        console.log(' Sauvegarde du token:', token ? 'Token reçu' : 'Aucun token');
        localStorage.setItem('token', token);
        setUser(user);
        console.log(' Connexion réussie pour:', user.username);
        return { success: true };
      }
    } catch (error) {
      console.error(' Erreur connexion complète:', error);
      console.error(' Détails erreur:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('👤 Tentative d\'inscription...', { username, email });
      setError('');
      const response = await authAPI.register(username, email, password);
      
      console.log(' Réponse inscription:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        console.log(' Sauvegarde du token après inscription');
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      console.error(' Erreur inscription:', error);
      console.error(' Détails erreur:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    console.log(' Déconnexion');
    localStorage.removeItem('token');
    setUser(null);
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};