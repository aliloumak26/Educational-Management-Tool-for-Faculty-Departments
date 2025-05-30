const express = require('express');
const router = express.Router();
const db = require('./config/db'); // Assurez-vous que c'est configuré avec mysql2/promise

// GET /api/infos/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }
    
    res.json({ success: true, teacher: rows[0] });
  } catch (error) {
    console.error('Erreur GET:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/infos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée fournie' });
    }
    
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }
    
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    
    const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    res.json({ 
      success: true, 
      message: 'Mise à jour réussie', 
      teacher: updated[0] 
    });
  } catch (error) {
    console.error('Erreur PUT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/infos/:id
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    
    // Vérification de l'existence dans users
    const [existing] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Enseignant non trouvé' 
      });
    }

    // Suppression de la table teacher d'abord
    await connection.query('DELETE FROM teachers WHERE id = ?', [id]);
    
    // Puis suppression de la table users
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Enseignant supprimé avec succès des deux tables' 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur DELETE:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;