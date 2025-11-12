import React, { useState, useEffect } from 'react';
import { useChatRoom } from '../contexts/ChatRoomContext';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import ChatRoom from './ChatRoom';

const RoomList = () => {
  const { rooms, myRooms, getRooms, getMyRooms, joinRoom, leaveRoom, loading } = useChatRoom();
  const { user } = useAuth();
  const { activeRoom, joinRoom: joinChatRoom, leaveRoom: leaveChatRoom } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('public');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    await getRooms();
    await getMyRooms();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await getRooms({ search: searchTerm });
  };

  const handleJoinRoom = async (room) => {
    await joinRoom(room._id);
    // Recharger les listes
    await loadRooms();
  };

  const handleLeaveRoom = async (room) => {
    await leaveRoom(room._id);
    // Si on quitte le salon actif, quitter aussi le chat
    if (activeRoom && activeRoom._id === room._id) {
      leaveChatRoom();
    }
    // Recharger les listes
    await loadRooms();
  };

  const handleEnterRoom = (room) => {
    joinChatRoom(room);
  };

  // Vérifier si l'utilisateur est membre d'un salon
  const isUserMember = (room) => {
    return room.members.some(member => member._id === user._id);
  };

  // Vérifier si l'utilisateur est le créateur du salon
  const isUserCreator = (room) => {
    return room.createdBy._id === user._id;
  };

  const displayRooms = activeTab === 'public' ? rooms : myRooms;

  return (
    <div className="room-list">
      <div className="room-list-header">
        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Rechercher un salon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Rechercher</button>
        </form>

        {/* Onglets */}
        <div className="tabs">
          <button 
            className={activeTab === 'public' ? 'active' : ''}
            onClick={() => setActiveTab('public')}
          >
            Salons Publics
          </button>
          <button 
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            Mes Salons ({myRooms.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Liste des salons */}
        <div style={{ flex: activeRoom ? 1 : 1, maxWidth: activeRoom ? '400px' : '100%' }}>
          <div className="rooms-container">
            {loading ? (
              <div className="loading">Chargement des salons...</div>
            ) : displayRooms.length === 0 ? (
              <div className="no-rooms">
                {activeTab === 'public' 
                  ? 'Aucun salon public trouvé' 
                  : 'Vous n\'êtes membre d\'aucun salon'
                }
              </div>
            ) : (
              displayRooms.map(room => (
                <div key={room._id} className="room-card">
                  <div className="room-info">
                    <h4>#{room.name}</h4>
                    {room.description && (
                      <p className="room-description">{room.description}</p>
                    )}
                    <div className="room-meta">
                      <span>Créé par: {room.createdBy.username}</span>
                      <span>Membres: {room.members.length}</span>
                      <span>
                        {room.members.filter(m => m.isOnline).length} en ligne
                      </span>
                    </div>
                  </div>

                  <div className="room-actions">
                    {isUserMember(room) ? (
                      <>
                        <button 
                          className={`btn-primary ${activeRoom && activeRoom._id === room._id ? 'active' : ''}`}
                          onClick={() => handleEnterRoom(room)}
                        >
                          {activeRoom && activeRoom._id === room._id ? 'Dans le chat' : 'Entrer'}
                        </button>
                        {!isUserCreator(room) && (
                          <button 
                            className="btn-secondary"
                            onClick={() => handleLeaveRoom(room)}
                            disabled={loading}
                          >
                            Quitter
                          </button>
                        )}
                      </>
                    ) : (
                      <button 
                        className="btn-primary"
                        onClick={() => handleJoinRoom(room)}
                        disabled={loading}
                      >
                        Rejoindre
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        {activeRoom && (
          <div style={{ flex: 2, minWidth: '0' }}>
            <ChatRoom />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;