const express = require('express');
const {
  register,
  login,
  logout,
  verify
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Inscription
router.post('/register', register);

// POST /api/auth/login - Connexion
router.post('/login', login);

// POST /api/auth/logout - Déconnexion (protégée)
router.post('/logout', auth, logout);

// GET /api/auth/verify - Vérification du token (protégée)
router.get('/verify', auth, verify);

module.exports = router;