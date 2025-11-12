import axios from 'axios';

// Configuration de base de l'API
const API_URL = 'http://localhost:5000/api';

// Création de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour obtenir le token
const getToken = () => {
  return localStorage.getItem('token');
};

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log(' Token utilisé:', token ? 'OUI' : 'NON');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error(' Erreur intercepteur request:', error);
    return Promise.reject(error);
  }
);
// Services pour les messages
export const messageAPI = {
  // Récupérer l'historique des messages d'un salon
  getRoomMessages: (roomId, params) => 
    api.get(`/rooms/${roomId}/messages`, { params }),
  
  // Supprimer un message
  deleteMessage: (messageId) => 
    api.delete(`/messages/${messageId}`),
};
// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    console.log(' Réponse API réussie:', response.config.url);
    return response;
  },
  (error) => {
    console.error(' Erreur API:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.log(' Token expiré ou invalide');
      localStorage.removeItem('token');
      // Ne pas rediriger automatiquement pour éviter les boucles
    }
    return Promise.reject(error);
  }
);

// Services pour l'authentification
export const authAPI = {
  login: (email, password) => {
    console.log(' Login API appelé');
    return api.post('/auth/login', { email, password });
  },
  register: (username, email, password) => {
    console.log(' Register API appelé');
    return api.post('/auth/register', { username, email, password });
  },
  getProfile: () => {
    console.log(' GetProfile API appelé');
    return api.get('/auth/profile');
  },
};

// Services pour les salons de discussion
export const chatRoomAPI = {
  create: (roomData) => {
    console.log(' API - Création salon:', roomData);
    return api.post('/chatrooms', roomData);
  },
  getAll: (params) => {
    console.log(' API - Récupération salons publics');
    return api.get('/chatrooms', { params });
  },
  getMyRooms: () => {
    console.log(' API - Récupération mes salons');
    return api.get('/chatrooms/my');
  },
  join: (roomId) => {
    console.log(' API - Rejoindre salon:', roomId);
    return api.post(`/chatrooms/${roomId}/join`);
  },
  leave: (roomId) => {
    console.log(' API - Quitter salon:', roomId);
    return api.post(`/chatrooms/${roomId}/leave`);
  },
};

// Fonction de test
export const testAPI = () => {
  const token = getToken();
  console.log(' Test - Token dans localStorage:', token);
  return token;
};

export default api;