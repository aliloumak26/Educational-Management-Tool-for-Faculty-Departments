const express = require("express")
const router = express.Router()
const pool = require("./config/db")

// Récupérer les modules d'un prof
router.get("/:profId/modules", async (req, res) => {
  try {
    // Récupérer l'ID du prof depuis les paramètres de l'URL
    const profId = req.params.profId

    // Récupérer les modules (spécialités) du prof depuis la base de données
    const [teacherRows] = await pool.query("SELECT specialite FROM teachers WHERE id = ?", [profId])

    if (teacherRows.length === 0) {
      return res.status(404).json({ error: "Professeur non trouvé" })
    }

    // Extraire les modules (spécialités) du résultat
    const modules = teacherRows
      .map((row) => row.specialite.trim())
      .filter((module) => module.length > 0 && module !== "#N/A")

    res.json({
      success: true,
      modules: modules.length > 0 ? modules : [],
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error)
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
    })
  }
})

// Mettre à jour les modules d'un prof
router.put("/:profId/modules", async (req, res) => {
  try {
    const profId = req.params.profId
    const { modules } = req.body

    if (!Array.isArray(modules)) {
      return res.status(400).json({ error: "Format de modules invalide" })
    }

    // Filtrer les modules vides et les "#N/A"
    const validModules = modules.filter((module) => module.trim() !== "" && module.trim() !== "#N/A")

    // Récupérer les informations du prof
    const [teacherRows] = await pool.query("SELECT enseignant FROM teachers WHERE id = ? LIMIT 1", [profId])

    let enseignantName
    if (teacherRows.length === 0) {
      // Si le prof n'existe pas dans la table teachers, récupérer son nom depuis users
      const [userRows] = await pool.query("SELECT firstName, lastName FROM users WHERE id = ?", [profId])

      if (!userRows.length) {
        return res.status(404).json({ error: "Professeur non trouvé" })
      }

      // Formater le nom: "NOM, Prénom"
      const { firstName, lastName } = userRows[0]
      enseignantName = `${lastName.toUpperCase()}, ${firstName}`
    } else {
      enseignantName = teacherRows[0].enseignant
    }

    // Supprimer tous les modules existants pour ce prof
    await pool.query("DELETE FROM teachers WHERE id = ?", [profId])

    // Insérer les nouveaux modules ou "#N/A" si aucun module valide
    if (validModules.length > 0) {
      // Si des modules valides existent, les insérer
      const values = validModules.map((module) => [module.trim(), enseignantName, profId])
      await pool.query("INSERT INTO teachers (specialite, enseignant, id) VALUES ?", [values])
    } else {
      // Si aucun module valide, insérer "#N/A"
      await pool.query("INSERT INTO teachers (specialite, enseignant, id) VALUES (?, ?, ?)", [
        "#N/A",
        enseignantName,
        profId,
      ])
    }

    res.json({
      success: true,
      modules: validModules.length > 0 ? validModules : ["#N/A"],
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des modules:", error)
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
    })
  }
})

module.exports = router