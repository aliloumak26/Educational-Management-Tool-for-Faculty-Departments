const express = require("express")
const router = express.Router()
const pool = require("./config/db") // Importez directement le pool

/**
 * @route GET /api/cahier-de-charges
 * @desc Récupérer les modules filtrés par semestre, palier et spécialité
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const { semestre, palier, specialite } = req.query

    // Vérifier que tous les paramètres requis sont présents
    if (!semestre || !palier || !specialite) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants. Semestre, palier et spécialité sont requis.",
      })
    }

    // Ajouter le préfixe "S" au semestre si ce n'est pas déjà fait
    const formattedSemestre = semestre.startsWith("S") ? semestre : `S${semestre}`

    console.log(`Recherche de modules avec: Semestre=${formattedSemestre}, Palier=${palier}, Specialite=${specialite}`)

    // Utiliser directement le pool pour exécuter la requête
    const [rows] = await pool.execute(
      "SELECT * FROM allinfo WHERE TRIM(Semestre) = TRIM(?) AND TRIM(Palier) = TRIM(?) AND TRIM(Specialite) = TRIM(?)",
      [formattedSemestre, palier, specialite],
    )

    console.log(`Nombre de modules trouvés: ${rows.length}`)

    // Si aucun résultat, essayons une requête plus permissive pour déboguer
    if (rows.length === 0) {
      const [allModules] = await pool.execute(
        "SELECT DISTINCT Semestre, Palier, Specialite FROM allinfo WHERE Semestre LIKE ? OR Palier LIKE ? OR Specialite LIKE ?",
        [`%${formattedSemestre}%`, `%${palier}%`, `%${specialite}%`],
      )

      console.log("Valeurs similaires trouvées dans la base de données:", allModules)
    }

    // Retourner les résultats
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error)
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des modules",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

/**
 * @route GET /api/cahier-de-charges/specialites
 * @desc Récupérer les spécialités disponibles par semestre et palier
 * @access Public
 */
router.get("/specialites", async (req, res) => {
  try {
    const { semestre, palier } = req.query

    // Vérifier que tous les paramètres requis sont présents
    if (!semestre || !palier) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants. Semestre et palier sont requis.",
      })
    }

    // Ajouter le préfixe "S" au semestre si ce n'est pas déjà fait
    const formattedSemestre = semestre.startsWith("S") ? semestre : `S${semestre}`

    console.log(`Recherche de spécialités avec: Semestre=${formattedSemestre}, Palier=${palier}`)

    // Utiliser directement le pool pour exécuter la requête
    const [rows] = await pool.execute(
      "SELECT DISTINCT Specialite FROM allinfo WHERE TRIM(Semestre) = TRIM(?) AND TRIM(Palier) = TRIM(?)",
      [formattedSemestre, palier],
    )

    // Extraire les spécialités du résultat
    const specialites = rows.map((row) => row.Specialite)

    console.log(`Spécialités trouvées: ${specialites.join(", ")}`)

    // Si aucun résultat, essayons une requête plus permissive pour déboguer
    if (specialites.length === 0) {
      const [allValues] = await pool.execute("SELECT DISTINCT Semestre, Palier FROM allinfo")

      console.log("Valeurs disponibles dans la base de données:", allValues)
    }

    // Retourner les résultats
    return res.status(200).json({
      success: true,
      count: specialites.length,
      data: specialites,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error)
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des spécialités",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

module.exports = router