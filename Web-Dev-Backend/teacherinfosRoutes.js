const express = require('express');
const router = express.Router();
const pool = require('./config/db');
const User = require('./models/User');

const userModel = new User(pool);
// Ajoutez ceci en haut de votre fichier teacherinfosRoutes.js
const validStatuses = ["Actif", "Congé", "Congé maladie", "Inactif"];
// Route PUT pour modifier un enseignant
router.put('/:id', async (req, res) => {
  console.log('Données reçues:', req.body);
      if (req.body.statut && !validStatuses.includes(req.body.statut)) {
      return res.status(400).json({
        error: "Statut invalide",
        validStatuses: validStatuses
      });
    }

  try {
    const updateData = {
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      grade: req.body.grade,
      gender: req.body.gender,
      phone: req.body.phone,
      email: req.body.email,
      statut: req.body.statut
    };
    

    console.log('Données transformées:', updateData);

    const updated = await userModel.updateUser(req.params.id, updateData);
    
    if (!updated) {
      return res.status(404).json({ 
        error: "Enseignant non trouvé",
        details: `ID ${req.params.id} inexistant`
      });
    }

    // Get the updated user data
    const [updatedUser] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    // Send a single response with all needed data
    res.json({ 
      success: true,
      user: updatedUser[0],
      message: "Profil mis à jour avec succès"
    });

  } catch (err) {
    console.error("Erreur complète:", err);
    res.status(400).json({
      error: "Données invalides",
      details: err.sqlMessage || err.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await userModel.deleteUser(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: "Enseignant non trouvé",
        details: `ID ${req.params.id} inexistant`
      });
    }

    res.json({ 
      success: true,
      message: "Profil supprimé avec succès"
    });

  } catch (err) {
    console.error("Erreur complète:", err);
    res.status(500).json({
      error: "Erreur lors de la suppression",
      details: err.sqlMessage || err.message
    });
  }
});

module.exports = router;