import React, { useState, useEffect } from 'react';
import { AuthContext } from './App';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
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
  }

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Vérifier que le token est toujours valide
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
              // Token invalide, déconnexion
              logout();
            }
          } else {
            // Erreur serveur, utiliser les données stockées
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
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
//AuthProvider, fonction
async function updateProfile(username, email) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username, email }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // eslint-disable-next-line no-undef
      setUser(data.data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error(' Erreur mise à jour profil:', error);
    return { success: false, message: 'Erreur de mise à jour du profil' };
  }
}

export default AuthProvider;