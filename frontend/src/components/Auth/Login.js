import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import './Login.css';

const Login = () => {
  const { login, demoLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(username, password);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await demoLogin();
    } catch (error) {
      console.error('Erreur mode démo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <h1 className="login-title">💬 ChatMe</h1>
          <p className="login-subtitle">Connectez-vous à votre espace de discussion</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          <Button 
            type="submit" 
            loading={loading}
            className="login-button"
          >
            Se connecter
          </Button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <Button
          variant="secondary"
          onClick={handleDemoLogin}
          loading={loading}
          className="demo-button"
        >
          🚀 Essayer le mode démo
        </Button>

        <div className="login-footer">
          <p className="footer-text">
            Application de chat temps réel avec Socket.IO
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;