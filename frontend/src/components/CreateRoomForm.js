import React, { useState } from 'react';
import { useChatRoom } from '../contexts/ChatRoomContext';

const CreateRoomForm = ({ onClose }) => {
  const { createRoom, loading } = useChatRoom();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await createRoom(formData);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="create-room-form">
      <h3>Créer un nouveau salon</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom du salon *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Entrez le nom du salon"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description du salon (optionnel)"
            rows="3"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            Salon public
          </label>
          <small>Les salons publics sont visibles par tous les utilisateurs</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={loading || !formData.name.trim()}
            className="btn-primary"
          >
            {loading ? 'Création...' : 'Créer le salon'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm;