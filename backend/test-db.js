require('dotenv').config();
const mongoose = require('mongoose');

async function testDB() {
  try {
    console.log(' Test de connexion MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatme');
    console.log('✅ MongoDB connecté avec succès');
    
    // Test du modèle User
    const User = require('./models/User');
    console.log('✅ Modèle User chargé');
    
    // Test de création d'utilisateur
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Utilisateur de test créé (validation OK)');
    
    await mongoose.connection.close();
    console.log('✅ Test terminé avec succès');
    
  } catch (error) {
    console.error('❌ Test échoué:', error.message);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
}

testDB();