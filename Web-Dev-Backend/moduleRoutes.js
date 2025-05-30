// routes/moduleRoutes.js
const express = require("express")
const router = express.Router()
const pool = require("./config/db")

// Récupérer les modules d'un enseignant
router.get("/:teacherId", async (req, res) => {
  try {
    // 1. D'abord vérifier si l'enseignant existe dans la table teachers
    const [teacherRows] = await pool.query(
      "SELECT specialite, enseignant FROM teachers WHERE id = ?", 
      [req.params.teacherId]
    );

    let teacherName = `Enseignant #${req.params.teacherId}`;
    let modules = ["#N/A"];

    if (!teacherRows.length) {
      // 2. Si l'enseignant n'existe pas, récupérer ses infos depuis la table users
      const [userRows] = await pool.query(
        "SELECT firstName, lastName FROM users WHERE id = ?", 
        [req.params.teacherId]
      );

      if (!userRows.length) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      // 3. Formater le nom correctement: "NOM, Prénom"
      const { firstName, lastName } = userRows[0];
      teacherName = `${lastName.toUpperCase()}, ${firstName}`;

      // 4. Créer l'entrée dans teachers avec la spécialité par défaut
      await pool.query(
        "INSERT INTO teachers (id, specialite, enseignant) VALUES (?, ?, ?)",
        [req.params.teacherId, "#N/A", teacherName]
      );
    } else {
      // 5. Si l'enseignant existe déjà, utiliser ses données
      teacherName = teacherRows[0].enseignant || teacherName;
      modules = teacherRows.map((row) => row.specialite.trim())
                         .filter((m) => m.length > 0);
      
      if (modules.length === 0) {
        modules = ["#N/A"];
      }
    }

    res.json({
      teacherId: Number.parseInt(req.params.teacherId),
      teacherName: teacherName,
      role: "enseignant",
      modules: modules,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    res.status(500).json({ 
      error: "Erreur serveur", 
      details: error.message 
    });
  }
});

// Mettre à jour les modules
router.put("/:teacherId", async (req, res) => {
  try {
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({ error: "Format de modules invalide" });
    }

    // Récupérer le nom de l'enseignant depuis la table users
    const [userRows] = await pool.query(
      "SELECT firstName, lastName FROM users WHERE id = ?", 
      [req.params.teacherId]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Formater le nom: "NOM, Prénom"
    const { firstName, lastName } = userRows[0];
    const enseignantName = `${lastName.toUpperCase()}, ${firstName}`;

    // D'abord, supprimer toutes les spécialités existantes pour cet enseignant
    await pool.query("DELETE FROM teachers WHERE id = ?", [req.params.teacherId]);

    // Ensuite, insérer chaque module comme une nouvelle ligne
    if (modules.length > 0) {
      // Préparer les valeurs pour l'insertion multiple
      const values = modules.map((module) => [
        module.trim(), 
        enseignantName, 
        req.params.teacherId
      ]);

      // Insérer toutes les nouvelles spécialités
      await pool.query(
        "INSERT INTO teachers (specialite, enseignant, id) VALUES ?", 
        [values]
      );
    }

    res.json({ 
      success: true, 
      modules,
      teacherName: enseignantName
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des modules:", error);
    res.status(500).json({ 
      error: "Erreur serveur", 
      details: error.message 
    });
  }
});

module.exports = router