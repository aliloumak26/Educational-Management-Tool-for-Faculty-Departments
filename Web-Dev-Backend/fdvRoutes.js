const express = require("express")
const router = express.Router()
const db = require("./config/db")
const multer = require("multer")
const xlsx = require("xlsx") // Importez votre connexion à la base de données
const upload = multer({ dest: "uploads/" })

// Route pour récupérer les choix d'un enseignant pour un semestre spécifique
router.get("/teacher", async (req, res) => {
  const { nom_prenom, semestre } = req.query

  if (!nom_prenom) {
    return res.status(400).json({ error: "Le nom de l'enseignant est requis" })
  }

  try {
    const connection = await db.getConnection()

    // Construire la requête en fonction des paramètres
    let query = "SELECT * FROM fdv WHERE nom_prenom = ?"
    const params = [nom_prenom]

    // Ajouter le filtre de semestre si fourni
    if (semestre) {
      query += " AND semestre = ?"
      params.push(semestre)
    }

    const [rows] = await connection.query(query, params)
    connection.release()

    // Si aucun enregistrement n'existe, vérifier si l'enseignant existe
    if (rows.length === 0) {
      // Vérifier si l'enseignant existe dans la table des enseignants
      const [teachers] = await connection.query("SELECT * FROM teachers WHERE enseignant = ?", [nom_prenom])

      if (teachers.length > 0) {
        // L'enseignant existe, créer des enregistrements vides
        await createEmptyRecordsForTeacher(nom_prenom)

        // Récupérer les nouveaux enregistrements
        const connection2 = await db.getConnection()
        const [newRows] = await connection2.query(query, params)
        connection2.release()

        return res.json(newRows)
      }

      // Si l'enseignant n'existe pas, renvoyer un tableau vide
      return res.json([])
    }

    res.json(rows)
  } catch (error) {
    console.error("Erreur lors de la récupération des choix:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des choix" })
  }
})

// Fonction pour créer des enregistrements vides pour un enseignant
async function createEmptyRecordsForTeacher(nom_prenom) {
  try {
    const connection = await db.getConnection()

    // Vérifier si des enregistrements existent déjà
    const [existingRows] = await connection.query("SELECT * FROM fdv WHERE nom_prenom = ?", [nom_prenom])

    connection.release()
    return true
  } catch (error) {
    console.error("Erreur lors de la création d'enregistrements vides:", error)
    throw error
  }
}

// Route pour récupérer tous les choix (pour l'administration)

// Dans votre fichier de routes Express (par exemple routes/api.js)

router.get("/all", async (req, res) => {
  const { semestre } = req.query

  if (!semestre) {
    return res.status(400).json({ error: "Le paramètre 'semestre' est requis" })
  }

  try {
    const connection = await db.getConnection()

    try {
      // Récupérer toutes les fiches de vœux pour le semestre spécifié
      const [rows] = await connection.query("SELECT * FROM fdv WHERE semestre = ?", [semestre])

      res.json(rows)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des fiches de vœux:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier téléchargé" })
  }

  try {
    const workbook = xlsx.readFile(req.file.path)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(worksheet)

    // Vérifier que les colonnes nécessaires sont présentes
    const requiredColumns = ["nom_prenom", "semestre", "hsup", "palier1", "specialite1", "module1"]
    if (data.length > 0) {
      const firstRow = data[0]
      for (const col of requiredColumns) {
        if (firstRow[col] === undefined) {
          return res.status(400).json({
            error: `Colonne manquante dans le fichier Excel: ${col}`,
            details: `Colonnes reçues: ${Object.keys(firstRow).join(", ")}`,
          })
        }
      }
    }

    const connection = await db.getConnection()

    try {
      // Commencer une transaction
      await connection.beginTransaction()

      // Étape 1: Supprimer toutes les données existantes
      await connection.query("DELETE FROM fdv")

      // Étape 2: Insérer les nouvelles données
      const insertPromises = data.map(async (row) => {
        // Normaliser les noms de colonnes (remplacer les espaces par des underscores)
        const normalizedRow = {}
        for (const key in row) {
          normalizedRow[key.replace(/ /g, "_")] = row[key]
        }

        // Convertir les valeurs booléennes en 1/0 si nécessaire
        const convertBool = (val) => {
          if (val === true) return 1
          if (val === false) return 0
          return val
        }

        // Insertion des données
        await connection.query(
          `INSERT INTO fdv (
            nom_prenom, semestre, hsup,
            palier1, specialite1, module1, cours1, td1, tp1,
            palier2, specialite2, module2, cours2, td2, tp2,
            palier3, specialite3, module3, cours3, td3, tp3
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalizedRow.nom_prenom,
            normalizedRow.semestre,
            convertBool(normalizedRow.hsup),
            normalizedRow.palier1,
            normalizedRow.specialite1,
            normalizedRow.module1,
            convertBool(normalizedRow.cours1),
            convertBool(normalizedRow.td1),
            convertBool(normalizedRow.tp1),
            normalizedRow.palier2 || null,
            normalizedRow.specialite2 || null,
            normalizedRow.module2 || null,
            convertBool(normalizedRow.cours2),
            convertBool(normalizedRow.td2),
            convertBool(normalizedRow.tp2),
            normalizedRow.palier3 || null,
            normalizedRow.specialite3 || null,
            normalizedRow.module3 || null,
            convertBool(normalizedRow.cours3),
            convertBool(normalizedRow.td3),
            convertBool(normalizedRow.tp3),
          ],
        )
      })

      await Promise.all(insertPromises)

      // Valider la transaction
      await connection.commit()

      res.json({
        success: true,
        message: `${data.length} enregistrements importés avec succès`,
      })
    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur lors de l'importation:", error)
    res.status(500).json({
      error: "Erreur lors de l'importation",
      details: error.message,
    })
  }
})

module.exports = router