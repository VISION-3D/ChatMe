import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ChatApp.css';

const ChatApp = () => {
  // Récupère les informations de l'utilisateur connecté et la fonction de déconnexion
  const { user, logout } = useAuth();

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    try {
      await logout();
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="chat-app">
      {/* En-tête de l'application */}
      <header className="chat-header">
        <div className="header-content">
          <h1> ChatMe </h1>
          <div className="user-info">
            <span>Bienvenue, <strong>{user.username}</strong></span>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="chat-main">
        <div className="welcome-message">
          
          <h1>Vous êtes maintenant connecté à ChatMe.</h1>
          
        </div>

        {/* Section informations utilisateur */}
        <div className="user-dashboard">
          <div className="dashboard-card">
            <h3> Votre Profil</h3>
            <div className="profile-info">
              <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Statut :</strong> 
                <span className={`status ${user.isOnline ? 'online' : 'offline'}`}>
                  {user.isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
                </span>
              </p>
              <p><strong>Dernière connexion :</strong> 
                {new Date(user.lastSeen).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

        
        </div>
      </main>

      {/* Pied de page */}
      <footer className="chat-footer">
        <p>ChatMe - Messagerie en temps réel </p>
      </footer>
    </div>
  );
};

export default ChatApp;