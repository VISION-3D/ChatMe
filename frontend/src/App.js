/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// STYLES ET ANIMATIONS
const animatedStyles = `
  :root {
    --primary-600: #3b82f6;
    --primary-500: #60a5fa;
    --primary-700: #1d4ed8;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --secondary-500: #6b7280;
    --secondary-400: #9ca3af;
    --secondary-300: #d1d5db;
    --secondary-200: #e5e7eb;
    --secondary-100: #f3f4f6;
    --secondary-50: #f9fafb;
    --secondary-600: #4b5563;
    --secondary-700: #374151;
    --secondary-800: #1f2937;
    --secondary-900: #111827;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --radius: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
    --space-6: 24px;
    --space-8: 32px;
  }

  [data-theme="dark"] {
    --primary-600: #60a5fa;
    --primary-500: #3b82f6;
    --primary-700: #1d4ed8;
    --success-color: #34d399;
    --danger-color: #f87171;
    --secondary-500: #9ca3af;
    --secondary-400: #6b7280;
    --secondary-300: #4b5563;
    --secondary-200: #374151;
    --secondary-100: #1f2937;
    --secondary-50: #111827;
    --secondary-600: #d1d5db;
    --secondary-700: #e5e7eb;
    --secondary-800: #f3f4f6;
    --secondary-900: #f9fafb;
  }

  [data-theme="dark"] body {
    background-color: #111827;
    color: #f9fafb;
  }

  @keyframes buttonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes buttonShine {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes slideInFromBottom {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes textScroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .btn-pulse { animation: buttonPulse 2s infinite; }
  .btn-shine { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: buttonShine 3s infinite;
  }
  .slide-in-up { animation: slideInFromBottom 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
  .fade-in { animation: fadeIn 0.3s ease-out; }
  .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
  .text-scroll { animation: textScroll 25s linear infinite; }
  .float-animation { animation: float 3s ease-in-out infinite; }
  .glow-animation { animation: glow 2s ease-in-out infinite; }
  .bounce-animation { animation: bounce 2s infinite; }
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  /* === STYLES POUR LES BOUTONS DU MENU PROFIL === */
  .profile-menu-button {
    cursor: pointer !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative !important;
    overflow: hidden !important;
  }

  .profile-menu-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
  }

  .profile-menu-button:active {
    transform: translateY(0) !important;
  }

  /* Effet de brillance au survol */
  .profile-menu-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: '100%';
    height: '100%';
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  .profile-menu-button:hover::after {
    left: 100%;
  }
`;

// ==================== THEME CONTEXT ====================
const ThemeContext = React.createContext();

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('chatme-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatme-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f9fafb';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      <style>{animatedStyles}</style>
      {children}
    </ThemeContext.Provider>
  );
};

// Contexte d'authentification
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      console.log(' Tentative de connexion avec:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log(' Réponse login:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error(' Erreur connexion:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log(' Tentative d\'inscription:', username, email);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      console.log(' Réponse register:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error(' Erreur inscription:', error);
      return { success: false, message: 'Erreur d\'inscription au serveur' };
    }
  };

  const logout = () => {
    console.log(' Déconnexion en cours...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log(' Déconnexion réussie');
  };

  const updateProfile = async (username, email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...user, username, email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        resolve({ success: true, message: 'Profil mis à jour avec succès' });
      }, 1000);
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.data.user);
            } else {
              logout();
            }
          } else {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.log('⚠️ Serveur indisponible, utilisation données stockées');
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
  <div style={{ 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    animation: 'float 2s ease-in-out infinite' 
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #60a5fa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 30px rgba(59, 130, 246, 0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effet de brillance */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: 'buttonShine 2s infinite'
      }}></div>
      
      {/* logo */}
      <img 
        src="/logo.png" 
        alt="ChatMe Logo"
        style={{
          width: '95px',
          height: '95px',
          objectFit: 'contain',
         
        }}
      />
    </div>
  </div>
  <div style={{ 
    fontSize: '24px', 
    marginBottom: '10px',
    animation: 'glow 2s ease-in-out infinite',
    color: 'white',
    fontWeight: '600'
  }}>ChatMe</div>
  <div style={{ 
    animation: 'fadeIn 1s ease-in',
    color: 'white',
    opacity: 0.8
  }}>Chargement...</div>
</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Composant de connexion
function LoginForm() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData.username, formData.email, formData.password);
    
    setLoading(false);
    
    if (!result.success) {
      setError(result.message || 'Erreur inconnue');
    }
  };

  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <button 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          color: 'white',
          zIndex: 10
        }}
        title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
        className="hover-lift bounce-animation"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div style={{
        background: theme === 'dark' ? 'var(--secondary-100)' : 'white', 
        color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
        padding: '30px', 
        borderRadius: '16px', 
        boxShadow: 'var(--shadow-lg)', 
        width: '100%', 
        maxWidth: '400px',
        border: theme === 'dark' ? '1px solid var(--secondary-300)' : '1px solid #e2e8f0',
        position: 'relative',
        zIndex: 5,
        animation: 'slideInFromBottom 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}>
       <div style={{
  textAlign: 'center',
  marginBottom: '20px',
  animation: 'fadeIn 0.6s ease-out'
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '14px',
     
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
     
      animation: 'bounce 2s infinite',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effet de brillance */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        animation: 'buttonShine 3s infinite'
      }}></div>
      
      {/* le logo */}
      <img 
        src="/logo.png" 
        alt="ChatMe Logo"
        style={{
          width: '100px',
          height: '100px',
          objectFit: 'contain',
         
        }}
      />
    </div>
  </div>
  <h2 style={{ 
    fontSize: '1.5rem',
    background: 'linear-gradient(135deg, var(--primary-600), var(--success-color))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}>
    {isLogin ? 'ChatMe Connexion' : 'Inscription'}
  </h2>
</div>



        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              disabled={loading}
              style={{
                width: '100%', 
                padding: '12px', 
                marginBottom: '15px',
                border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#cbd5e1'}`, 
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                background: theme === 'dark' ? 'var(--secondary-200)' : 'white',
                color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
                animation: 'fadeIn 0.4s ease-out'
              }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            disabled={loading}
            style={{
              width: '100%', 
              padding: '12px', 
              marginBottom: '15px',
              border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#cbd5e1'}`, 
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: theme === 'dark' ? 'var(--secondary-200)' : 'white',
              color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
              animation: 'fadeIn 0.5s ease-out'
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            disabled={loading}
            style={{
              width: '100%', 
              padding: '12px', 
              marginBottom: '20px',
              border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#cbd5e1'}`, 
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: theme === 'dark' ? 'var(--secondary-200)' : 'white',
              color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
              animation: 'fadeIn 0.6s ease-out'
            }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', 
              padding: '12px', 
              background: loading ? 'var(--secondary-400)' : 'linear-gradient(135deg, var(--primary-600), var(--success-color))',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="hover-lift"
          >
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 1.5s infinite'
              }}></div>
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? ' Chargement...' : (isLogin ? ' Se connecter' : ' S\'inscrire')}
            </span>
          </button>
        </form>
        
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }} 
          style={{
            background: 'none', 
            border: 'none', 
            color: 'var(--primary-600)',
            cursor: 'pointer', 
            marginTop: '15px', 
            width: '100%',
            fontSize: '0.875rem',
            padding: '10px',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.7s ease-out'
          }}
          className="hover-lift"
        >
          {isLogin ? ' Pas de compte ? S\'inscrire' : ' Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
}

// Composant de Chat
function ChatRoom({ room, onClose }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    console.log(' Initialisation Socket.IO pour le salon:', room.name);
    
    let newSocket;
    
    try {
      const token = localStorage.getItem('token');
      console.log(' Tentative de connexion Socket.IO...');
      
      newSocket = io('http://localhost:5000', {
        auth: {
          token: token || 'demo-token'
        },
        timeout: 5000,
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log(' Connecté au serveur Socket.IO');
        setIsConnected(true);
        setConnectionStatus('connected');
        newSocket.emit('join_room', room._id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log(' Déconnecté du serveur Socket.IO:', reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error(' Erreur connexion Socket.IO:', error.message);
        setIsConnected(false);
        setConnectionStatus('error');
        
        setTimeout(() => {
          if (!isConnected) {
            setConnectionStatus('local');
          }
        }, 3000);
      });

      newSocket.on('new_message', (message) => {
        console.log(' Nouveau message temps réel:', message);
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.isTemporary);
          return [...filtered, message];
        });
      });

      setSocket(newSocket);

    } catch (error) {
      console.error(' Erreur initialisation Socket.IO:', error);
      setConnectionStatus('local');
    }

    loadMessageHistory(room._id);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', room._id);
        newSocket.disconnect();
      }
    };
  }, [room._id]);

  async function loadMessageHistory(roomId) {
    try {
      const demoMessages = [
        {
          _id: 1,
          content: `Bienvenue dans le salon ${room.name} ! `,
          user: { _id: 'system', username: 'Système' },
          createdAt: new Date(),
          isSystem: true
        },
        {
          _id: 2,
          content: connectionStatus === 'connected'
            ? 'Socket.IO connecté - Temps réel activé ! '
            : 'Mode local - Messages simulés ',
          user: { _id: 'system', username: 'Système' },
          createdAt: new Date(),
          isSystem: true
        }
      ];
      setMessages(demoMessages);
    } catch (error) {
      console.log(' Erreur chargement historique:', error);
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      user: user,
      createdAt: new Date(),
      isTemporary: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    if (isConnected && socket) {
      socket.emit('send_message', {
        roomId: room._id,
        content: newMessage.trim()
      });
    } else {
      setTimeout(() => {
        const responseMessage = {
          _id: Date.now(),
          content: `[Mode Local] Réponse à: "${newMessage.trim()}"`,
          user: { _id: 'bot', username: 'Bot Local' },
          createdAt: new Date()
        };
        setMessages(prev => {
          const filtered = prev.filter(msg => msg._id !== tempMessage._id);
          return [...filtered, responseMessage];
        });
      }, 1000);
    }
  };

  const getStatusInfo = () => {
    switch(connectionStatus) {
      case 'connected':
        return { color: '#10b981', text: '🟢 Temps Réel Actif', message: 'Socket.IO Connecté' };
      case 'connecting':
        return { color: '#f59e0b', text: '🟡 Connexion...', message: 'Tentative de connexion' };
      case 'error':
        return { color: '#ef4444', text: '🔴 Hors Ligne', message: 'Erreur de connexion' };
      case 'local':
        return { color: '#6c757d', text: '🔵 Mode Local', message: 'Messages simulés' };
      default:
        return { color: '#6c757d', text: '⚪ Inconnu', message: 'Statut indéterminé' };
    }
  };

  const statusInfo = getStatusInfo();

  const formatTime = (date) => {
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('fr-FR');
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`,
      borderRadius: '12px',
      background: theme === 'dark' ? 'var(--secondary-100)' : '#f8fafc',
      marginLeft: '20px',
      flex: 2,
      minWidth: '500px',
      boxShadow: 'var(--shadow-md)',
      animation: 'slideInFromBottom 0.5s ease-out'
    }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`,
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          animation: 'buttonShine 3s infinite linear'
        }}></div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>{room.name}</h3>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: statusInfo.color,
              animation: 'glow 2s infinite'
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.875rem', opacity: 0.9 }}>
            <span> {room.members?.length || 1} membre(s)</span>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontWeight: '500',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              {statusInfo.text}
            </span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
          className="hover-lift bounce-animation"
        >
          ✕ Fermer
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px', 
        background: theme === 'dark' ? 'var(--secondary-100)' : '#f8fafc' 
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: theme === 'dark' ? 'var(--secondary-500)' : '#64748b', 
            marginTop: '80px',
            animation: 'fadeIn 0.6s ease-out'
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '20px', 
              opacity: 0.5,
              animation: 'float 3s ease-in-out infinite'
            }}></div>
            <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '500' }}>Aucun message dans ce salon</div>
            <div style={{ fontSize: '14px' }}>Soyez le premier à envoyer un message !</div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              <div style={{ textAlign: 'center', margin: '25px 0' }}>
                <div style={{
                  display: 'inline-block',
                  background: theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0',
                  color: theme === 'dark' ? 'var(--secondary-700)' : '#475569',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  animation: 'fadeIn 0.4s ease-out'
                }}>
                  {date}
                </div>
              </div>

              {dayMessages.map((message, index) => (
                <div
                  key={message._id}
                  style={{
                    marginBottom: '16px',
                    padding: message.isSystem ? '14px 18px' : '16px 20px',
                    borderRadius: message.isSystem ? '12px' : message.user._id === user._id ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                    background: message.isSystem 
                      ? (theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0')
                      : message.user._id === user._id 
                        ? 'var(--primary-600)' 
                        : (theme === 'dark' ? 'var(--secondary-200)' : 'white'),
                    color: message.isSystem 
                      ? (theme === 'dark' ? 'var(--secondary-700)' : '#475569')
                      : message.user._id === user._id 
                        ? 'white' 
                        : (theme === 'dark' ? 'var(--secondary-900)' : '#1e293b'),
                    border: message.isSystem ? 'none' : message.user._id === user._id ? 'none' : `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`,
                    maxWidth: '75%',
                    alignSelf: message.user._id === user._id ? 'flex-end' : 'flex-start',
                    marginLeft: message.user._id === user._id ? 'auto' : '0',
                    marginRight: message.user._id === user._id ? '0' : 'auto',
                    fontStyle: message.isSystem ? 'italic' : 'normal',
                    opacity: message.isTemporary ? 0.7 : 1,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    animation: `slideInFromBottom 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  {!message.isSystem && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ 
                        fontSize: '0.875rem', 
                        color: message.user._id === user._id ? 'white' : 'var(--primary-600)' 
                      }}>
                        {message.user._id === user._id ? 'Vous' : message.user.username}
                      </strong>
                      <small style={{ opacity: 0.8, fontSize: '11px' }}>{formatTime(message.createdAt)}</small>
                    </div>
                  )}
                  <div style={{ lineHeight: '1.5', fontSize: message.isSystem ? '0.875rem' : '1rem' }}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{ 
        padding: '20px', 
        borderTop: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`, 
        background: theme === 'dark' ? 'var(--secondary-200)' : 'white' 
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder=" Tapez votre message..."
            disabled={connectionStatus === 'connecting'}
            style={{
              flex: 1,
              padding: '16px 20px',
              border: `2px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#d1d5db'}`,
              borderRadius: '25px',
              outline: 'none',
              fontSize: '1rem',
              background: theme === 'dark' ? 'var(--secondary-100)' : '#f8fafc',
              color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
              transition: 'all 0.3s ease'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-600)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme === 'dark' ? 'var(--secondary-300)' : '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              padding: '16px 20px',
              background: newMessage.trim() ? 'var(--primary-600)' : 'var(--secondary-400)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '18px',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="hover-lift"
          >
            {newMessage.trim() && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'buttonShine 2s infinite'
              }}></div>
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>➤</span>
          </button>
        </div>
        
        <div style={{
          textAlign: 'center',
          color: statusInfo.color,
          fontSize: '0.875rem',
          marginTop: '12px',
          fontWeight: '600',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {statusInfo.message}
        </div>
      </form>
    </div>
  );
}

// Composant Modal de Profil
function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfile(formData.username, formData.email);
      
      setLoading(false);
      if (result.success) {
        setMessage(' Profil mis à jour avec succès');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(` ${result.message}`);
      }
    } catch (error) {
      setLoading(false);
      setMessage(' Erreur lors de la mise à jour du profil');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={handleOverlayClick}
    >
      <div 
        style={{
          background: theme === 'dark' ? 'var(--secondary-100)' : 'white',
          color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
          padding: '25px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-lg)',
          border: theme === 'dark' ? '1px solid var(--secondary-300)' : '1px solid #e2e8f0',
          animation: 'slideInFromBottom 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
          ✏️ Modifier le profil
        </h3>

        {message && (
          <div style={{
            background: message.includes('✅') ? 
              (theme === 'dark' ? '#064e3b' : '#d1fae5') : 
              (theme === 'dark' ? '#7f1d1d' : '#fef2f2'),
            color: message.includes('✅') ? 
              (theme === 'dark' ? '#34d399' : '#065f46') : 
              (theme === 'dark' ? '#fca5a5' : '#dc2626'),
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#cbd5e1'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                background: theme === 'dark' ? 'var(--secondary-200)' : 'white',
                color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#cbd5e1'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                background: theme === 'dark' ? 'var(--secondary-200)' : 'white',
                color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              disabled={loading}
              style={{
                background: 'var(--secondary-500)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
              className="hover-lift"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary-600)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1
              }}
              className="hover-lift"
            >
              {loading ? ' Enregistrement...' : ' Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  COMPOSANT POUR CHANGER LA PHOTO DE PROFIL 
const ProfilePictureChanger = ({ isOpen, onClose, onProfilePictureChange }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(user?.profilePicture || '');
  const [uploading, setUploading] = useState(false);

  // Avatars prédéfinis
  const defaultAvatars = [
    '👤', '👨', '👩', '🧑', '👦', '👧', '🧒', '👨‍💼', '👩‍💼', 
    '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '🦊', '🐱', '🐶',
    '🐼', '🐨', '🦁', '🐯', '🐻', '🐰', '🐵', '🐧', '🦄'
  ];

  const predefinedImages = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png'
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Vérification de la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2MB');
      return;
    }

    setUploading(true);

    try {
      // Simulation d'upload - À remplacer par votre API réelle
      const imageUrl = await simulateImageUpload(file);
      setSelectedImage(imageUrl);
      
      if (onProfilePictureChange) {
        onProfilePictureChange(imageUrl);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const simulateImageUpload = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      }, 1500);
    });
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedImage(avatar);
    if (onProfilePictureChange) {
      onProfilePictureChange(avatar);
    }
  };

  const handlePredefinedImageSelect = (imagePath) => {
    setSelectedImage(imagePath);
    if (onProfilePictureChange) {
      onProfilePictureChange(imagePath);
    }
  };

  const handleSave = () => {
    if (onProfilePictureChange && selectedImage) {
      onProfilePictureChange(selectedImage);
    }
    onClose();
  };

  const handleRemovePicture = () => {
    setSelectedImage('');
    if (onProfilePictureChange) {
      onProfilePictureChange('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: theme === 'dark' ? 'var(--secondary-100)' : 'white',
          color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
          padding: '25px',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          border: theme === 'dark' ? '1px solid var(--secondary-300)' : '1px solid #e2e8f0',
          animation: 'slideInFromBottom 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          marginBottom: '20px', 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span></span>
          Changer la photo de profil
        </h3>

        {/* Aperçu de la photo sélectionnée */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '25px',
          padding: '20px',
          background: theme === 'dark' ? 'var(--secondary-200)' : '#f8fafc',
          borderRadius: '12px',
          border: `2px dashed ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '15px' }}>
            Aperçu :
          </div>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: selectedImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: selectedImage ? '0' : '2.5rem',
            color: 'white',
            border: `3px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`,
            overflow: 'hidden'
          }}>
            {selectedImage ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img 
                src={selectedImage} 
                alt="Photo de profil" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              user?.username?.charAt(0).toUpperCase() || '👤'
            )}
          </div>
        </div>

        {/* Upload de fichier */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
             Télécharger une image
          </label>
          <div style={{
            border: `2px dashed ${theme === 'dark' ? 'var(--secondary-300)' : '#d1d5db'}`,
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: theme === 'dark' ? 'var(--secondary-200)' : '#f8fafc',
            transition: 'all 0.3s ease',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
              id="profile-picture-upload"
            />
            <label 
              htmlFor="profile-picture-upload"
              style={{
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'block'
              }}
            >
              {uploading ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}></div>
                  <div>Téléchargement en cours...</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</div>
                  <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                    Cliquez pour sélectionner une image
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--secondary-500)' : '#6b7280' }}>
                    PNG, JPG max 2MB
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Avatars prédéfinis */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '15px', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            😊 Choisir un avatar
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', 
            gap: '10px',
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '10px',
            background: theme === 'dark' ? 'var(--secondary-200)' : '#f8fafc',
            borderRadius: '8px'
          }}>
            {defaultAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => handleAvatarSelect(avatar)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedImage === avatar ? 'var(--primary-600)' : (theme === 'dark' ? 'var(--secondary-300)' : '#d1d5db')}`,
                  background: theme === 'dark' ? 'var(--secondary-300)' : 'white',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                className="hover-lift"
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Images prédéfinies */}
        {predefinedImages.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '15px', 
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              🎨 Images prédéfinies
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', 
              gap: '12px'
            }}>
              {predefinedImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedImageSelect(image)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: `3px solid ${selectedImage === image ? 'var(--primary-600)' : (theme === 'dark' ? 'var(--secondary-300)' : '#d1d5db')}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '2px',
                    overflow: 'hidden'
                  }}
                  className="hover-lift"
                >
                  <img 
                    src={image} 
                    alt={`Avatar ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <button 
            onClick={handleRemovePicture}
            disabled={!selectedImage}
            style={{
              background: 'var(--secondary-500)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: !selectedImage ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: !selectedImage ? 0.6 : 1,
              flex: 1
            }}
            className="hover-lift"
          >
            🗑️ Supprimer
          </button>
          
          <button 
            onClick={onClose}
            style={{
              background: 'var(--secondary-400)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              flex: 1
            }}
            className="hover-lift"
          >
            ❌ Annuler
          </button>
          
          <button 
            onClick={handleSave}
            style={{
              background: 'var(--primary-600)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              flex: 1
            }}
            className="hover-lift"
          >
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal avec salons et chat
function AppContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [loading, setLoading] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  
  // AJOUT DES ÉTATS POUR LE CHANGEMENT DE PHOTO DE PROFIL

  const [showProfilePictureChanger, setShowProfilePictureChanger] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(user?.profilePicture || '');

  const loadDemoData = () => {
    const demoRooms = [{
      _id: 'demo-1', name:'Salon Principal', description: 'Salon de discussion générale',
      createdBy: { _id: 'system', username: 'Système' }, members: [{ _id: 'system', username: 'Système' }], createdAt: new Date()
    }];
    setRooms(demoRooms);
    setMyRooms(demoRooms);
    setApiStatus('demo');
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        if (healthResponse.ok) setApiStatus('connected');
        else throw new Error('API health check failed');
      } catch (error) {
        setApiStatus('error');
        loadDemoData();
        return;
      }

      const publicResponse = await fetch('http://localhost:5000/api/chatrooms', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        if (publicData.success) {
          setRooms(publicData.data.chatRooms || []);
          const myResponse = await fetch('http://localhost:5000/api/chatrooms/my', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (myResponse.ok) {
            const myData = await myResponse.json();
            if (myData.success) setMyRooms(myData.data.chatRooms || []);
          }
          return;
        }
      }
      loadDemoData();
    } catch (error) {
      console.error(' Erreur chargement salons:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name) => {
    try {
      const token = localStorage.getItem('token');
      if (apiStatus === 'connected') {
        const response = await fetch('http://localhost:5000/api/chatrooms', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name, description: '' })
        });
        if (response.ok) { await loadRooms(); return; }
      }
      const newRoom = { _id: `demo-${Date.now()}`, name, description: '', createdBy: user, members: [user], createdAt: new Date() };
      setRooms(prev => [...prev, newRoom]); setMyRooms(prev => [...prev, newRoom]);
    } catch (error) {
      console.error('Erreur création salon:', error);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (apiStatus === 'connected') {
        const response = await fetch(`http://localhost:5000/api/chatrooms/${roomId}/join`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.ok) { await loadRooms(); return; }
      }
      setRooms(prev => prev.map(room => room._id === roomId ? { ...room, members: [...room.members, user] } : room));
      setMyRooms(prev => { const roomToJoin = rooms.find(r => r._id === roomId);
        if (roomToJoin && !prev.some(r => r._id === roomId)) return [...prev, { ...roomToJoin, members: [...roomToJoin.members, user] }];
        return prev;
      });
    } catch (error) {
      console.error('Erreur rejoindre salon:', error);
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (apiStatus === 'connected') {
        const response = await fetch(`http://localhost:5000/api/chatrooms/${roomId}/leave`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.ok) { await loadRooms(); return; }
      }
      setRooms(prev => prev.map(room => room._id === roomId ? { ...room, members: room.members.filter(member => member._id !== user._id) } : room));
      setMyRooms(prev => prev.filter(room => room._id !== roomId));
      if (activeRoom && activeRoom._id === roomId) setActiveRoom(null);
    } catch (error) {
      console.error('Erreur quitter salon:', error);
    }
  };

  const enterRoom = (room) => setActiveRoom(room);
  const closeChat = () => setActiveRoom(null);

  // Gestionnaires de clics TESTÉS et GARANTIS
  const handleProfileButtonClick = (e) => {
    e.stopPropagation();
    console.log(' Clic sur bouton profil - Ouverture/Fermeture menu');
    setShowProfile(!showProfile);
  };

  const handleModifyProfile = (e) => {
    e.stopPropagation();
    console.log('✏️ Clic sur Modifier le profil - Ouverture modal');
    setShowProfileModal(true);
    setShowProfile(false); // Ferme le menu profil
  };

  // AJOUT DU GESTIONNAIRE POUR CHANGER LA PHOTO DE PROFIL
  const handleChangeProfilePicture = (e) => {
    e.stopPropagation();
    console.log(' Clic sur Changer la photo de profil');
    setShowProfilePictureChanger(true);
    setShowProfile(false); // Ferme le menu profil
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    console.log(' Clic sur Déconnexion - Déconnexion en cours');
    setShowProfile(false); // Ferme le menu profil
    logout(); // Appel direct de la fonction logout
  };

  const handleCloseProfileMenu = () => {
    console.log(' Fermeture menu profil par overlay');
    setShowProfile(false);
  };

  // AJOUT DE LA FONCTION POUR GÉRER LE CHANGEMENT DE PHOTO DE PROFIL
  const handleProfilePictureChange = (newPicture) => {
    setUserProfilePicture(newPicture);
    // Mettre à jour l'utilisateur dans le localStorage
    const updatedUser = { ...user, profilePicture: newPicture };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('Nouvelle photo de profil enregistrée:', newPicture);
  };

  useEffect(() => { 
    if (user) {
      loadRooms();
      // Initialiser la photo de profil si elle existe
      if (user.profilePicture) {
        setUserProfilePicture(user.profilePicture);
      }
    }
  }, [user]);

  if (!user) {
    return <LoginForm />;
  }

  const displayRooms = activeTab === 'public' ? rooms : myRooms;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme === 'dark' ? 'var(--secondary-50)' : '#f8fafc',
      color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b'
    }}>
      <header style={{
        background: 'var(--primary-600)', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 'var(--shadow)', 
        position: 'relative', 
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #ff6b6b)', backgroundSize: '200% 100%',
          animation: 'buttonShine 3s infinite linear'
        }}></div>
     
        
{/*section logo*/}

<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
}}>
  <img 
    src="/logo.png" 
    alt="ChatMe Logo"
    style={{
      width: '60px',
      height: '60px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      animation: 'float 3s ease-in-out infinite'
    }}
  />
  
  <h1 style={{ 
    margin: 0, 
    fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
    background: 'linear-gradient(135deg, #fff 0%, #dbeafe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    fontWeight: '700',
    letterSpacing: '0.5px'
  }}>
    ChatMe
  </h1>
</div>
       
        
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '5px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <div className="text-scroll" style={{
            display: 'inline-block',
            paddingLeft: '100%',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            Messagerie en temps réel • React + Socket.IO • Communication instantanée • Rejoignez vos amis • 
            Créez des salons • Discutez en temps réel • Interface moderne • Expérience utilisateur optimale • 
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: apiStatus === 'connected' ? '#10b981' : apiStatus === 'demo' ? '#f59e0b' : '#ef4444',
              animation: 'glow 2s infinite'
            }} />
            <small style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              {apiStatus === 'connected' ? '🟢 Backend + Socket.IO' : apiStatus === 'demo' ? 'Online' : '🔴 Backend Hors Ligne'}
            </small>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
          <button onClick={toggleTheme} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '10px 14px', color: 'white', cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            // eslint-disable-next-line no-dupe-keys
            fontWeight: '500', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
          }} className="hover-lift bounce-animation">
            {theme === 'light' ? '🌙 Mode sombre' : '☀️ Mode clair'}
          </button>

          {/* MENU PROFIL - BOUTONS FONCTIONNELS */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={handleProfileButtonClick}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                // eslint-disable-next-line no-dupe-keys
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              className="hover-lift"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: userProfilePicture ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px',
                color: 'white',
                overflow: 'hidden'
              }}>
                {userProfilePicture ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img 
                    src={userProfilePicture} 
                    alt="Photo de profil" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {user.username}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>▼</span>
            </button>

            {showProfile && (
              <>
                {/* Overlay pour fermer le menu en cliquant ailleurs */}
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998,
                    background: 'transparent'
                  }}
                  onClick={handleCloseProfileMenu}
                />
                
                {/* Menu profil */}
                <div 
                  style={{
                    position: 'fixed',
                    top: '70px',
                    right: '20px',
                    background: theme === 'dark' ? 'var(--secondary-800)' : 'white',
                    border: `1px solid ${theme === 'dark' ? 'var(--secondary-600)' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    minWidth: '280px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    zIndex: 999,
                    animation: 'slideDown 0.2s ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* En-tête du profil */}
                  <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '16px', 
                    paddingBottom: '16px', 
                    borderBottom: `1px solid ${theme === 'dark' ? 'var(--secondary-600)' : '#e2e8f0'}` 
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: userProfilePicture ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: userProfilePicture ? '0' : '24px',
                      color: 'white',
                      margin: '0 auto 12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden'
                    }}>
                      {userProfilePicture ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img 
                          src={userProfilePicture} 
                          alt="Photo de profil" 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '1.1rem', 
                      marginBottom: '4px',
                      color: theme === 'dark' ? 'white' : '#1f2937'
                    }}>
                      {user.username}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: theme === 'dark' ? 'var(--secondary-400)' : '#6b7280',
                      wordBreak: 'break-all'
                    }}>
                      {user.email}
                    </div>
                  </div>

                  {/* Informations du profil */}
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: theme === 'dark' ? 'var(--secondary-300)' : '#4b5563', 
                    marginBottom: '20px',
                    background: theme === 'dark' ? 'var(--secondary-700)' : '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         Membre depuis:
                      </span>
                      <span style={{ fontWeight: '600', color: theme === 'dark' ? 'white' : '#374151' }}>
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         Salons rejoints:
                      </span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: theme === 'dark' ? 'white' : '#374151',
                        background: theme === 'dark' ? 'var(--primary-600)' : 'var(--primary-500)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        {myRooms.length}
                      </span>
                    </div>
                  </div>

                  {/* BOUTON CHANGER PHOTO DE PROFIL - AJOUTÉ */}
                  <button 
                    onClick={handleChangeProfilePicture}
                    style={{
                      width: '100%',
                      background: 'var(--primary-500)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '12px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    className="profile-menu-button"
                  >
                    <span style={{ fontSize: '16px' }}></span>
                    Changer la photo de profil
                  </button>

                  {/* BOUTON PROFIL - FONCTIONNEL */}
                  <button 
                    onClick={handleModifyProfile}
                    style={{
                      width: '100%',
                      background: 'var(--primary-600)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '12px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    className="profile-menu-button"
                  >
                    <span style={{ fontSize: '16px' }}>✏️</span>
                    Modifier le profil
                  </button>

                  {/* BOUTON DÉCONNEXION - FONCTIONNEL */}
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      background: 'var(--danger-color)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                    className="profile-menu-button"
                  >
                    <span style={{ fontSize: '16px' }}></span>
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal de modification du profil */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => {
          console.log(' Fermeture modal profil');
          setShowProfileModal(false);
        }} 
      />

      {/* Modal pour changer la photo de profil - AJOUTÉ */}
      <ProfilePictureChanger 
        isOpen={showProfilePictureChanger}
        onClose={() => setShowProfilePictureChanger(false)}
        onProfilePictureChange={handleProfilePictureChange}
      />

      <main style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <h2 style={{ margin: 0 }}>Salons de discussion</h2>
          <button onClick={() => setShowRoomForm(true)} style={{
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--success-color) 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: '600', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            position: 'relative', overflow: 'hidden'
          }} className="hover-lift glow-animation">
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'buttonShine 2s infinite'
            }}></div>
            <span style={{ position: 'relative', zIndex: 2 }}> Créer un salon</span>
          </button>
        </div>

        {showRoomForm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              background: theme === 'dark' ? 'var(--secondary-100)' : 'white', 
              color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
              padding: '25px', 
              borderRadius: '12px', 
              width: '90%', 
              maxWidth: '400px', 
              boxShadow: 'var(--shadow-lg)',
              border: theme === 'dark' ? '1px solid var(--secondary-300)' : '1px solid #e2e8f0',
              animation: 'slideInFromBottom 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}>
              <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Créer un nouveau salon</h3>
              <input 
                type="text" 
                placeholder="Nom du salon" 
                value={newRoomName} 
                onChange={(e) => setNewRoomName(e.target.value)} 
                style={{
                  width: '100%', 
                  padding: '12px', 
                  marginBottom: '20px', 
                  border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#cbd5e1'}`, 
                  borderRadius: '8px', 
                  fontSize: '1rem',
                  background: theme === 'dark' ? 'var(--secondary-200)' : 'white',
                  color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
                  transition: 'all 0.3s ease'
                }} 
                autoFocus 
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowRoomForm(false); setNewRoomName(''); }} style={{
                  background: 'var(--secondary-500)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.3s ease', fontWeight: '500'
                }} className="hover-lift">❌ Annuler</button>
                <button onClick={() => { if (newRoomName.trim()) { createRoom(newRoomName); setShowRoomForm(false); setNewRoomName(''); } }} style={{
                  background: 'var(--success-color)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.3s ease', fontWeight: '600', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift" disabled={!newRoomName.trim()}>
                  {newRoomName.trim() && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'buttonShine 2s infinite'
                    }}></div>
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>✅ Créer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          animation: 'fadeIn 0.7s ease-out'
        }}>
          <button onClick={() => setActiveTab('public')} style={{
            padding: '10px 20px', border: 'none', background: activeTab === 'public' ? 'var(--primary-600)' : (theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'),
            color: activeTab === 'public' ? 'white' : (theme === 'dark' ? 'var(--secondary-900)' : '#475569'), borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: '500'
          }} className="hover-lift">Salons Publics ({rooms.length})</button>
          <button onClick={() => setActiveTab('my')} style={{
            padding: '10px 20px', border: 'none', background: activeTab === 'my' ? 'var(--primary-600)' : (theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'),
            color: activeTab === 'my' ? 'white' : (theme === 'dark' ? 'var(--secondary-900)' : '#475569'), borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: '500'
          }} className="hover-lift">Mes Salons ({myRooms.length})</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: activeRoom ? 1 : 1, maxWidth: activeRoom ? '400px' : '100%', minWidth: '300px' }}>
            <div style={{ 
              background: theme === 'dark' ? 'var(--secondary-100)' : 'white', 
              color: theme === 'dark' ? 'var(--secondary-900)' : '#1e293b',
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow)', 
              border: theme === 'dark' ? '1px solid var(--secondary-300)' : '1px solid #e2e8f0',
              animation: 'fadeIn 0.8s ease-out'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: theme === 'dark' ? 'var(--secondary-500)' : '#64748b', fontStyle: 'italic' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    marginBottom: '10px',
                    animation: 'float 2s ease-in-out infinite'
                  }}></div>
                  <div>Chargement des salons...</div>
                  <small>Connexion au backend</small>
                </div>
              ) : displayRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: theme === 'dark' ? 'var(--secondary-500)' : '#64748b', fontStyle: 'italic' }}>
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '10px',
                    animation: 'float 3s ease-in-out infinite'
                  }}></div>
                  <div style={{ marginBottom: '5px' }}>
                    {activeTab === 'public' ? 'Aucun salon public trouvé' : 'Vous n\'êtes membre d\'aucun salon'}
                  </div>
                  <small>{activeTab === 'public' ? 'Revenez plus tard ou créez votre propre salon !' : 'Rejoignez un salon public pour commencer !'}</small>
                </div>
              ) : (
                displayRooms.map((room, index) => (
                  <div 
                    key={room._id} 
                    style={{
                      border: `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`, 
                      padding: '15px', 
                      marginBottom: '10px', 
                      borderRadius: '8px', 
                      background: theme === 'dark' ? 'var(--secondary-200)' : '#f8f9fa', 
                      display: 'flex',
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      borderLeft: activeRoom && activeRoom._id === room._id ? '4px solid var(--primary-600)' : `1px solid ${theme === 'dark' ? 'var(--secondary-300)' : '#e2e8f0'}`,
                      transition: 'all 0.3s ease',
                      animation: `slideInFromBottom 0.4s ease-out ${index * 0.1}s both`
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = theme === 'dark' ? 'var(--secondary-300)' : '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = theme === 'dark' ? 'var(--secondary-200)' : '#f8f9fa';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{room.name}</h4>
                      {room.description && <p style={{ margin: '5px 0', color: theme === 'dark' ? 'var(--secondary-500)' : '#64748b', fontSize: '0.875rem' }}>{room.description}</p>}
                      <div style={{ color: theme === 'dark' ? 'var(--secondary-500)' : '#6b7280', fontSize: '0.875rem', display: 'flex', gap: '15px' }}>
                        <span>Créé par: {room.createdBy.username}</span>
                        <span>Membres: {room.members?.length || 1}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                      {room.members?.some(member => member._id === user._id) ? (
                        <>
                          <button onClick={() => enterRoom(room)} style={{
                            background: activeRoom && activeRoom._id === room._id ? 'var(--success-color)' : 'var(--primary-600)', color: 'white', border: 'none',
                            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.3s ease',
                            fontWeight: '600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                          }} className="hover-lift">
                            {activeRoom && activeRoom._id === room._id && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                animation: 'buttonShine 2s infinite'
                              }}></div>
                            )}
                            <span style={{ position: 'relative', zIndex: 1 }}>
                              {activeRoom && activeRoom._id === room._id ? ' En chat' : ' Entrer'}
                            </span>
                          </button>
                          {room.createdBy._id !== user._id && (
                            <button onClick={() => leaveRoom(room._id)} style={{
                              background: 'var(--secondary-500)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                              fontSize: '0.875rem', transition: 'all 0.3s ease', fontWeight: '500', boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                            }} className="hover-lift"> Quitter</button>
                          )}
                        </>
                      ) : (
                        <button onClick={() => joinRoom(room._id)} style={{
                          background: 'var(--primary-600)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.875rem', transition: 'all 0.3s ease', fontWeight: '600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }} className="hover-lift">
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            animation: 'buttonShine 2s infinite'
                          }}></div>
                          <span style={{ position: 'relative', zIndex: 1 }}>➕ Rejoindre</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {activeRoom && <ChatRoom room={activeRoom} onClose={closeChat} />}
        </div>
      </main>

      <div style={{
        background: 'linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #3b82f6)',
        backgroundSize: '200% 100%',
        padding: '15px 0',
        marginTop: '40px',
        overflow: 'hidden',
        position: 'relative',
        animation: 'buttonShine 4s infinite linear'
      }}>
        <div className="text-scroll" style={{
          display: 'inline-block',
          paddingLeft: '100%',
          whiteSpace: 'nowrap',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          ChatMe - Messagerie en temps réel • React + Socket.IO • Communication instantanée • 
          Rejoignez vos amis • Créez des salons • Discutez en temps réel • Interface moderne • 
          Expérience utilisateur optimale • Simple et intuitif • Gratuit et sécurisé •
        </div>
      </div>

      <footer style={{
  backgroundColor: 'var(--primary-600)',
  color: 'white',
  textAlign: 'center',
  padding: '20px 0',
  fontSize: '0.875rem',
  position: 'relative',
  overflow: 'hidden'
}}>
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
    backgroundSize: '200% 100%',
    animation: 'buttonShine 4s infinite linear'
  }}></div>
  
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px',
    animation: 'fadeIn 1s ease-out'
  }}>
    <div style={{
      width: '26px',
      height: '26px',
      borderRadius: '7px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      animation: 'float 3s ease-in-out infinite'
    }}>
      <img 
        src="/logo.png" 
        alt="ChatMe Logo"
        style={{
          width: '40px',
          height: '40px',
          objectFit: 'contain',
         
        }}
      />
    </div>
    <p style={{ 
      margin: 0,
      animation: 'slideInFromBottom 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fontWeight: '600'
    }}>
      ChatMe — Messagerie en temps réel • React & Socket.IO © 2025
    </p>
  </div>
</footer>
    </div>
  );
}

// Composant App par défaut
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;