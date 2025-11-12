import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth = () => {
  const { user, loading, error, checkAuth } = useAuth();

  const handleManualVerify = async () => {
    console.log(' Vérification manuelle...');
    await checkAuth();
  };

  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log(' LocalStorage:');
    console.log('Token:', token ? 'Présent' : 'Absent');
    console.log('User:', savedUser ? ' Présent' : ' Absent');
    
    alert(`Token: ${token ? ' Présent' : ' Absent'}\nUser: ${savedUser ? ' Présent' : ' Absent'}`);
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('LocalStorage cleared! Rafraîchissement de la page...');
    window.location.reload();
  };

  return (
    <div style={{ 
      background: '#fff3cd', 
      padding: '15px', 
      border: '2px solid #ffeaa7',
      borderRadius: '8px',
      margin: '10px 0',
      fontSize: '14px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>🐛 Debug Authentication</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>État actuel:</strong>
        <div>Loading: {loading ? ' Oui' : ' Non'}</div>
        <div>User: {user ? ` ${user.username}` : ' Null'}</div>
        <div>Error: {error || ' Aucune'}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleManualVerify}
          style={{ padding: '6px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
        >
          Vérifier Auth
        </button>
        
        <button 
          onClick={checkLocalStorage}
          style={{ padding: '6px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
        >
          Check Storage
        </button>
        
        <button 
          onClick={() => console.log('User object:', user)}
          style={{ padding: '6px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
        >
          Log User
        </button>

        <button 
          onClick={clearStorage}
          style={{ padding: '6px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;