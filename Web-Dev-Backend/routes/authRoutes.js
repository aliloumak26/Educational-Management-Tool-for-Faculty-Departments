const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// @route   POST api/auth/login
// @desc    Authentifier un utilisateur
// @access  Public
router.post(
  '/login',
  [
    check('firstName', 'Le prénom est requis').not().isEmpty(),
    check('lastName', 'Le nom est requis').not().isEmpty(),
    check('password', 'Le mot de passe est requis').exists()
  ],
  authController.login
);

// @route   GET api/auth/protected
// @desc    Route protégée pour tester l'authentification
// @access  Privé
router.get('/protected', auth, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

// Ajoutez cette route
// Dans authRoutes.js (backend)
router.get('/verify', auth, (req, res) => {
  res.status(200).json({ valid: true });
});

module.exports = router;
