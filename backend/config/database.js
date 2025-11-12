const connectDB = async () => {
  try {
    console.log(' Tentative de connexion à MongoDB...');
    console.log(' URI:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatme', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connecté !: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log(` State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
};