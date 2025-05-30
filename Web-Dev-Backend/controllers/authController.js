const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
  const { firstName, lastName, password } = req.body;

  try {
    const cleanInput = (str) => str.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();

    const [rows] = await pool.query(
     `SELECT * FROM users 
      WHERE REGEXP_REPLACE(TRIM(firstName), '[^a-zA-Z]', '') = ?
      AND REGEXP_REPLACE(TRIM(lastName), '[^a-zA-Z]', '') = ?`,
     [
      cleanInput(firstName),
      cleanInput(lastName)
     ]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const user = rows[0];

    // Comparaison directe sans hash
    if (user.password.trim() !== password.trim()) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Créer et signer le JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error('Erreur lors de la génération du token:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message);
    res.status(500).send('Erreur serveur');
  }
};