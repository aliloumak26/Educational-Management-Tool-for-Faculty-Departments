const express = require("express")
const router = express.Router()
const db = require("./config/db") // Importez votre connexion à la base de données
const fs = require("fs")
const exceljs = require("exceljs")
const multer = require("multer")
const upload = multer({ dest: "uploads/" })

// Fonction pour initialiser la table teachersorganigrammes si elle n'existe pas
async function initTeachersOrganigramTable() {
  try {
    const connection = await db.getConnection()

    // Vérifier si la table existe
    const [tables] = await connection.query("SHOW TABLES LIKE 'teachersorganigrammes'")

    if (tables.length === 0) {
      console.log("La table teachersorganigrammes n'existe pas, création en cours...")

      // Créer la table avec la même structure que organigrammes
      await connection.query(`
        CREATE TABLE teachersorganigrammes LIKE organigrammes
      `)

      console.log("Table teachersorganigrammes créée avec succès")
    } else {
      console.log("La table teachersorganigrammes existe déjà")
    }

    connection.release()
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la table teachersorganigrammes:", error)
  }
}

// Appeler la fonction d'initialisation au démarrage
initTeachersOrganigramTable()
router.post("/export-tous", async (req, res) => {
  const { semestre, palier, specialite } = req.body

  try {
    const connection = await db.getConnection()

    const [rows] = await connection.query(
      `SELECT 
        semestre,
        palier,
        specialite,
        module,
        section,
        enseignant_cours,
        enseignant_td1,
        enseignant_td2,
        enseignant_td3,
        enseignant_td4,
        enseignant_tp1,
        enseignant_tp2,
        enseignant_tp3,
        enseignant_tp4
      FROM organigrammes
`,
    )

    connection.release()

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée à exporter" })
    }

    const workbook = new exceljs.Workbook()
    const worksheet = workbook.addWorksheet("Organigramme")

    // Colonnes sans les charges
    worksheet.columns = [
      { header: "Semestre", key: "semestre", width: 10 },
      { header: "Palier", key: "palier", width: 10 },
      { header: "Spécialité", key: "specialite", width: 15 },
      { header: "Module", key: "module", width: 30 },
      { header: "Section", key: "section", width: 10 },
      { header: "Enseignant Cours", key: "enseignant_cours", width: 30 },
      { header: "Enseignant TD1", key: "enseignant_td1", width: 30 },
      { header: "Enseignant TD2", key: "enseignant_td2", width: 30 },
      { header: "Enseignant TD3", key: "enseignant_td3", width: 30 },
      { header: "Enseignant TD4", key: "enseignant_td4", width: 30 },
      { header: "Enseignant TP1", key: "enseignant_tp1", width: 30 },
      { header: "Enseignant TP2", key: "enseignant_tp2", width: 30 },
      { header: "Enseignant TP3", key: "enseignant_tp3", width: 30 },
      { header: "Enseignant TP4", key: "enseignant_tp4", width: 30 },
    ]

    rows.forEach((row) => {
      worksheet.addRow({
        semestre: row.semestre,
        palier: row.palier,
        specialite: row.specialite,
        module: row.module,
        section: row.section,
        enseignant_cours: row.enseignant_cours,
        enseignant_td1: row.enseignant_td1,
        enseignant_td2: row.enseignant_td2,
        enseignant_td3: row.enseignant_td3,
        enseignant_td4: row.enseignant_td4,
        enseignant_tp1: row.enseignant_tp1,
        enseignant_tp2: row.enseignant_tp2,
        enseignant_tp3: row.enseignant_tp3,
        enseignant_tp4: row.enseignant_tp4,
      })
    })

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename=Organigramme_ALL.xlsx`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Erreur export:", error)
    res.status(500).json({ error: "Erreur lors de l'export" })
  }
})
// Route pour exporter vers Excel
router.post("/export-exact", async (req, res) => {
  const { semestre, palier, specialite } = req.body

  try {
    const connection = await db.getConnection()

    const [rows] = await connection.query(
      `SELECT 
        semestre,
        palier,
        specialite,
        module,
        section,
        enseignant_cours,
        enseignant_td1,
        enseignant_td2,
        enseignant_td3,
        enseignant_td4,
        enseignant_tp1,
        enseignant_tp2,
        enseignant_tp3,
        enseignant_tp4
      FROM organigrammes
      WHERE semestre = ? AND palier = ? AND specialite = ?
      ORDER BY section, module`,
      [semestre, palier, specialite],
    )

    connection.release()

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée à exporter" })
    }

    const workbook = new exceljs.Workbook()
    const worksheet = workbook.addWorksheet("Organigramme")

    // Colonnes sans les charges
    worksheet.columns = [
      { header: "Semestre", key: "semestre", width: 10 },
      { header: "Palier", key: "palier", width: 10 },
      { header: "Spécialité", key: "specialite", width: 15 },
      { header: "Module", key: "module", width: 30 },
      { header: "Section", key: "section", width: 10 },
      { header: "Enseignant Cours", key: "enseignant_cours", width: 30 },
      { header: "Enseignant TD1", key: "enseignant_td1", width: 30 },
      { header: "Enseignant TD2", key: "enseignant_td2", width: 30 },
      { header: "Enseignant TD3", key: "enseignant_td3", width: 30 },
      { header: "Enseignant TD4", key: "enseignant_td4", width: 30 },
      { header: "Enseignant TP1", key: "enseignant_tp1", width: 30 },
      { header: "Enseignant TP2", key: "enseignant_tp2", width: 30 },
      { header: "Enseignant TP3", key: "enseignant_tp3", width: 30 },
      { header: "Enseignant TP4", key: "enseignant_tp4", width: 30 },
    ]

    rows.forEach((row) => {
      worksheet.addRow({
        semestre: row.semestre,
        palier: row.palier,
        specialite: row.specialite,
        module: row.module,
        section: row.section,
        enseignant_cours: row.enseignant_cours,
        enseignant_td1: row.enseignant_td1,
        enseignant_td2: row.enseignant_td2,
        enseignant_td3: row.enseignant_td3,
        enseignant_td4: row.enseignant_td4,
        enseignant_tp1: row.enseignant_tp1,
        enseignant_tp2: row.enseignant_tp2,
        enseignant_tp3: row.enseignant_tp3,
        enseignant_tp4: row.enseignant_tp4,
      })
    })

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename=Organigramme_${semestre}_${palier}_${specialite}.xlsx`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Erreur export:", error)
    res.status(500).json({ error: "Erreur lors de l'export" })
  }
})

// Route pour importer depuis Excel
router.post("/import-exact", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier uploadé" })
  }

  try {
    const workbook = new exceljs.Workbook()
    await workbook.xlsx.readFile(req.file.path)
    const worksheet = workbook.getWorksheet(1)

    if (!worksheet) {
      fs.unlinkSync(req.file.path) // Nettoyer le fichier temporaire
      return res.status(400).json({ error: "Feuille de calcul non trouvée" })
    }

    // Vérification des en-têtes
    const headerRow = worksheet.getRow(1)
    const expectedHeaders = [
      "Semestre",
      "Palier",
      "Spécialité",
      "Module",
      "Section",
      "Enseignant Cours",
      "Enseignant TD1",
      "Enseignant TD2",
      "Enseignant TD3",
      "Enseignant TD4",
      "Enseignant TP1",
      "Enseignant TP2",
      "Enseignant TP3",
      "Enseignant TP4",
    ]

    // Vérifier les en-têtes
    for (let i = 0; i < expectedHeaders.length; i++) {
      const cellValue = headerRow.getCell(i + 1).value
      if (cellValue !== expectedHeaders[i]) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          error: `En-tête invalide en colonne ${i + 1}. Attendu: "${expectedHeaders[i]}", Reçu: "${cellValue}"`,
        })
      }
    }

    // Extraction des données
    const data = []
    const combinaisons = new Set() // Pour suivre les combinaisons uniques semestre/palier/spécialité

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) {
        // Ignorer la ligne d'en-tête
        return
      }

      const rowData = {
        semestre: row.getCell(1).value,
        palier: row.getCell(2).value,
        specialite: row.getCell(3).value,
        module: row.getCell(4).value,
        section: row.getCell(5).value,
        enseignant_cours: row.getCell(6).value,
        enseignant_td1: row.getCell(7).value,
        enseignant_td2: row.getCell(8).value,
        enseignant_td3: row.getCell(9).value,
        enseignant_td4: row.getCell(10).value,
        enseignant_tp1: row.getCell(11).value,
        enseignant_tp2: row.getCell(12).value,
        enseignant_tp3: row.getCell(13).value,
        enseignant_tp4: row.getCell(14).value,
      }

      // Validation des données obligatoires
      if (!rowData.module || !rowData.semestre || !rowData.palier || !rowData.specialite) {
        throw new Error(`Ligne ${rowNumber}: Données obligatoires manquantes`)
      }

      // Ajouter cette combinaison à l'ensemble des combinaisons uniques
      combinaisons.add(`${rowData.semestre}-${rowData.palier}-${rowData.specialite}`)

      data.push({
        ...rowData,
        rowNumber, // Ajouter le numéro de ligne pour les messages d'erreur
      })
    })

    if (data.length === 0) {
      fs.unlinkSync(req.file.path) // Nettoyer le fichier temporaire
      return res.status(400).json({ error: "Aucune donnée valide dans le fichier" })
    }

    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      // Convertir l'ensemble des combinaisons en tableau pour le logging
      const combinaisonsArray = Array.from(combinaisons)
      console.log(`${combinaisonsArray.length} combinaisons semestre/palier/spécialité trouvées dans le fichier:`)
      combinaisonsArray.forEach((combo) => console.log(`- ${combo}`))

      // Validation des modules et des enseignants
      const validationErrors = []
      const validModules = new Map() // Cache pour les modules valides
      const validTeachers = new Map() // Cache pour les enseignants valides
      const teacherModuleQualifications = new Map() // Cache pour les qualifications des enseignants

      // 1. Vérifier tous les modules
      for (const row of data) {
        const moduleKey = `${row.module}-${row.semestre}-${row.palier}-${row.specialite}`

        if (!validModules.has(moduleKey)) {
          // Vérifier si le module existe dans la table allinfo
          const [moduleExists] = await connection.query(
            `SELECT COUNT(*) as count FROM allinfo 
             WHERE Module LIKE ? AND Semestre = ? AND Palier = ? AND Specialite = ?`,
            [`${row.module.split(":")[0]}%`, `S${row.semestre}`, row.palier, row.specialite],
          )

          const isValid = moduleExists[0].count > 0
          validModules.set(moduleKey, isValid)

          if (!isValid) {
            validationErrors.push(
              `Ligne ${row.rowNumber}: Le module "${row.module}" n'existe pas pour S${row.semestre} ${row.palier} ${row.specialite}`,
            )
          }
        } else if (!validModules.get(moduleKey)) {
          validationErrors.push(
            `Ligne ${row.rowNumber}: Le module "${row.module}" n'existe pas pour S${row.semestre} ${row.palier} ${row.specialite}`,
          )
        }
      }

      // Modifier la partie de validation des enseignants dans la fonction d'importation (route /import-exact)
      // Remplacer la section de vérification des enseignants et leurs qualifications par:

      // 2. Vérifier tous les enseignants et leurs qualifications
      for (const row of data) {
        // Fonction pour vérifier un enseignant
        const checkTeacher = async (teacher, type, rowNumber) => {
          if (!teacher) return // Ignorer les cellules vides

          // Vérifier si l'enseignant existe
          if (!validTeachers.has(teacher)) {
            // Modifier la requête qui cause l'erreur dans la fonction checkTeacher
            // Remplacer cette ligne:
            // const [teacherExists] = await connection.query(
            //   "SELECT COUNT(*) as count, specialite FROM teachers WHERE enseignant = ?",
            //   [teacher],
            // )

            // Par celle-ci:
            const [teacherRows] = await connection.query(
              "SELECT enseignant, specialite FROM teachers WHERE enseignant = ?",
              [teacher],
            )

            const isValid = teacherRows.length > 0
            validTeachers.set(teacher, isValid)

            if (!isValid) {
              validationErrors.push(
                `Ligne ${rowNumber}: L'enseignant "${teacher}" n'existe pas dans la base de données`,
              )
              return
            }

            // Stocker les spécialités de l'enseignant pour les vérifications futures
            if (teacherRows[0].specialite) {
              const teacherSpecialities = teacherRows[0].specialite.split(",").map((s) => s.trim())
              validTeachers.set(`${teacher}-specialites`, teacherSpecialities)
            } else {
              validTeachers.set(`${teacher}-specialites`, [])
            }
          } else if (!validTeachers.get(teacher)) {
            validationErrors.push(`Ligne ${rowNumber}: L'enseignant "${teacher}" n'existe pas dans la base de données`)
            return
          }

          // Trouver la spécialité requise pour ce module
          const moduleBase = row.module.split(":")[0].trim()
          const qualificationKey = `${moduleBase}-${type}`

          if (!teacherModuleQualifications.has(qualificationKey)) {
            // Chercher dans la table de mapping pour trouver la spécialité correspondant à ce module
            const [mappings] = await connection.query(
              "SELECT teacher_specialite FROM module_teacher_mapping WHERE module_pattern LIKE ? AND course_type = ?",
              [`${moduleBase}%`, type === "cours" ? "C" : type],
            )

            if (mappings.length === 0) {
              console.log(`Aucun mapping trouvé pour le module ${moduleBase} et le type ${type}`)
              // Si aucun mapping n'est trouvé, on suppose que n'importe quel enseignant peut l'enseigner
              teacherModuleQualifications.set(qualificationKey, { isValid: true, requiredSpeciality: null })
            } else {
              const requiredSpeciality = mappings[0].teacher_specialite
              teacherModuleQualifications.set(qualificationKey, {
                isValid: true,
                requiredSpeciality: requiredSpeciality,
              })
            }
          }

          // Vérifier si l'enseignant a la spécialité requise
          const mapping = teacherModuleQualifications.get(qualificationKey)
          if (mapping && mapping.requiredSpeciality) {
            const teacherSpecialities = validTeachers.get(`${teacher}-specialites`) || []
            const isQualified =
              teacherSpecialities.includes(mapping.requiredSpeciality) ||
              teacherSpecialities.includes("*") ||
              teacherSpecialities.length === 0 // Si aucune spécialité n'est spécifiée, on suppose que l'enseignant peut enseigner n'importe quelle spécialité

            if (!isQualified) {
              validationErrors.push(
                `Ligne ${rowNumber}: L'enseignant "${teacher}" n'est pas qualifié pour enseigner le module "${row.module}" qui requiert la spécialité "${mapping.requiredSpeciality}"`,
              )
            }
          }
        }

        // Vérifier tous les enseignants de la ligne
        if (row.enseignant_cours) await checkTeacher(row.enseignant_cours, "cours", row.rowNumber)
        if (row.enseignant_td1) await checkTeacher(row.enseignant_td1, "td", row.rowNumber)
        if (row.enseignant_td2) await checkTeacher(row.enseignant_td2, "td", row.rowNumber)
        if (row.enseignant_td3) await checkTeacher(row.enseignant_td3, "td", row.rowNumber)
        if (row.enseignant_td4) await checkTeacher(row.enseignant_td4, "td", row.rowNumber)
        if (row.enseignant_tp1) await checkTeacher(row.enseignant_tp1, "tp", row.rowNumber)
        if (row.enseignant_tp2) await checkTeacher(row.enseignant_tp2, "tp", row.rowNumber)
        if (row.enseignant_tp3) await checkTeacher(row.enseignant_tp3, "tp", row.rowNumber)
        if (row.enseignant_tp4) await checkTeacher(row.enseignant_tp4, "tp", row.rowNumber)
      }

      // Si des erreurs de validation sont trouvées, annuler l'importation
      if (validationErrors.length > 0) {
        await connection.rollback()
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          error: "Erreurs de validation détectées",
          validationErrors: validationErrors,
        })
      }

      // 3. Pour chaque combinaison unique, supprimer les données existantes
      for (const combo of combinaisons) {
        const [semestre, palier, specialite] = combo.split("-")

        console.log(`Suppression des données existantes pour S${semestre} ${palier} ${specialite}...`)

        await connection.query("DELETE FROM organigrammes WHERE semestre = ? AND palier = ? AND specialite = ?", [
          semestre,
          palier,
          specialite,
        ])
      }

      // 4. Insertion des nouvelles données (sans le champ rowNumber)
      for (const row of data) {
        await connection.query(
          `INSERT INTO organigrammes 
          (semestre, palier, specialite, module, section,
           enseignant_cours, enseignant_td1, enseignant_td2, enseignant_td3, enseignant_td4,
           enseignant_tp1, enseignant_tp2, enseignant_tp3, enseignant_tp4)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.semestre,
            row.palier,
            row.specialite,
            row.module,
            row.section,
            row.enseignant_cours,
            row.enseignant_td1,
            row.enseignant_td2,
            row.enseignant_td3,
            row.enseignant_td4,
            row.enseignant_tp1,
            row.enseignant_tp2,
            row.enseignant_tp3,
            row.enseignant_tp4,
          ],
        )
      }

      // 5. Récupérer tous les semestres uniques pour recalculer les charges
      const semestresUniques = new Set()
      for (const combo of combinaisons) {
        const semestre = combo.split("-")[0]
        semestresUniques.add(semestre)
      }

      // 6. Pour chaque semestre, recalculer toutes les charges
      for (const semestre of semestresUniques) {
        console.log(`Recalcul des charges pour le semestre ${semestre}...`)

        // Réinitialiser les charges pour ce semestre
        await connection.query("UPDATE charges SET charge = 0 WHERE semestre = ?", [`S${semestre}`])

        // Récupérer toutes les affectations pour ce semestre
        const [allAssignments] = await connection.query(
          `SELECT o.module, o.semestre, o.palier, o.specialite, 
           o.enseignant_cours, 
           o.enseignant_td1, o.enseignant_td2, o.enseignant_td3, o.enseignant_td4,
           o.enseignant_tp1, o.enseignant_tp2, o.enseignant_tp3, o.enseignant_tp4
           FROM organigrammes o
           WHERE o.semestre = ?`,
          [semestre],
        )

        console.log(`${allAssignments.length} affectations trouvées pour le semestre ${semestre}`)

        // Recalculer les charges
        const charges = {}

        for (const assignment of allAssignments) {
          // Récupérer les informations du module
          const [moduleInfo] = await connection.query(
            `SELECT Module, C, TD, TP FROM allinfo 
             WHERE Module LIKE ? AND Semestre = ? AND Palier = ? AND Specialite = ?`,
            [
              `${assignment.module.split(":")[0]}%`,
              `S${assignment.semestre}`,
              assignment.palier,
              assignment.specialite,
            ],
          )

          if (moduleInfo.length === 0) {
            console.log(`Module non trouvé: ${assignment.module}`)
            continue
          }

          const info = moduleInfo[0]

          // Fonction pour ajouter une charge
          const addCharge = (teacher, value) => {
            if (teacher) {
              charges[teacher] = (charges[teacher] || 0) + value
            }
          }

          // Ajouter les charges
          addCharge(assignment.enseignant_cours, Number(info.C || 0) * 3)
          ;[
            assignment.enseignant_td1,
            assignment.enseignant_td2,
            assignment.enseignant_td3,
            assignment.enseignant_td4,
          ].forEach((teacher) => addCharge(teacher, Number(info.TD || 0)))
          ;[
            assignment.enseignant_tp1,
            assignment.enseignant_tp2,
            assignment.enseignant_tp3,
            assignment.enseignant_tp4,
          ].forEach((teacher) => addCharge(teacher, Number(info.TP || 0) * 1.5))
        }

        // Mettre à jour les charges dans la base de données
        for (const [teacher, charge] of Object.entries(charges)) {
          const [lastName, firstName] = teacher.split(", ")
          if (lastName && firstName) {
            await connection.query(
              "UPDATE charges SET charge = ? WHERE lastName = ? AND firstName = ? AND semestre = ?",
              [charge, lastName, firstName, `S${semestre}`],
            )
          }
        }
      }

      await connection.commit()

      res.json({
        success: true,
        message: "Import réussi",
        importedRows: data.length,
        combinaisons: Array.from(combinaisons),
        semestresTraites: Array.from(semestresUniques),
      })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur import:", error)
    res.status(400).json({
      error: error.message || "Erreur lors de l'import",
      details: error.stack,
    })
  } finally {
    // Nettoyage du fichier temporaire
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
  }
})

// Nouvelle route pour publier l'organigramme
// Route pour publier l'organigramme
// Route pour publier l'organigramme
router.post("/publish", async (req, res) => {
  const { versionTitle } = req.body // Récupérer le titre de la version

  try {
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      console.log("Publication de l'organigramme et des charges...")

      // 1. Vider complètement la table teachersorganigrammes
      await connection.query("DELETE FROM teachersorganigrammes")

      // 2. Vider complètement la table teachercharges
      await connection.query("DELETE FROM teachercharges")

      // 3. Vider et mettre à jour le titre dans titleorg
      await connection.query("DELETE FROM titreorg")
      await connection.query("INSERT INTO titreorg (titre) VALUES (?)", [versionTitle])

      // 4. Copier toutes les données de organigrammes vers teachersorganigrammes
      const [insertOrgResult] = await connection.query(
        `INSERT INTO teachersorganigrammes
         (semestre, palier, specialite, module, section,
          enseignant_cours, enseignant_td1, enseignant_td2, enseignant_td3, enseignant_td4,
          enseignant_tp1, enseignant_tp2, enseignant_tp3, enseignant_tp4)
         SELECT 
          semestre, palier, specialite, module, section,
          enseignant_cours, enseignant_td1, enseignant_td2, enseignant_td3, enseignant_td4,
          enseignant_tp1, enseignant_tp2, enseignant_tp3, enseignant_tp4
         FROM organigrammes`,
      )

      // 5. Copier toutes les données de charges vers teachercharges
      const [insertChargesResult] = await connection.query(
        `INSERT INTO teachercharges
         (id, lastName, firstName, semestre, charge)
         SELECT 
          id, lastName, firstName, semestre, charge
         FROM charges`,
      )

      await connection.commit()

      res.json({
        success: true,
        message: "Publication réussie de l'organigramme et des charges",
        rowsPublished: {
          organigrammes: insertOrgResult.affectedRows,
          charges: insertChargesResult.affectedRows,
        },
        versionTitle: versionTitle,
      })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur lors de la publication:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la publication",
    })
  }
})

// Route pour récupérer tous les enseignants
router.get("/teachers", async (req, res) => {
  try {
    const connection = await db.getConnection()
    // Récupérer les enseignants uniques (sans doublons)
    const [rows] = await connection.query("SELECT DISTINCT enseignant FROM teachers ORDER BY enseignant")
    connection.release()
    res.json(rows)
  } catch (error) {
    console.error("Erreur de récupération des enseignants:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des enseignants" })
  }
})

// Route pour récupérer les détails d'un enseignant spécifique
router.get("/teachers/:name", async (req, res) => {
  const { name } = req.params
  try {
    const connection = await db.getConnection()
    const [rows] = await connection.query("SELECT * FROM teachers WHERE enseignant = ?", [name])
    connection.release()

    if (rows.length > 0) {
      res.json(rows)
    } else {
      res.status(404).json({ message: "Enseignant non trouvé" })
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'enseignant:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de l'enseignant" })
  }
})

// Route pour récupérer les charges d'un enseignant pour un semestre donné
router.get("/teacher-charges", async (req, res) => {
  const { semestre } = req.query

  try {
    const connection = await db.getConnection()

    // Récupérer toutes les charges pour ce semestre
    const [rows] = await connection.query("SELECT id, lastName, firstName, charge FROM charges WHERE semestre = ?", [
      semestre,
    ])

    connection.release()
    res.json(rows)
  } catch (error) {
    console.error("Erreur de chargement des charges:", error)
    res.status(500).json({ error: "Erreur lors du chargement des charges" })
  }
})

router.get("/teacher-charges1", async (req, res) => {
  const { semestre } = req.query

  try {
    const connection = await db.getConnection()

    // Récupérer toutes les charges pour ce semestre
    const [rows] = await connection.query(
      "SELECT id, lastName, firstName, charge FROM teachercharges WHERE semestre = ?",
      [semestre],
    )

    connection.release()
    res.json(rows)
  } catch (error) {
    console.error("Erreur de chargement des charges:", error)
    res.status(500).json({ error: "Erreur lors du chargement des charges" })
  }
})
// Ajouter cette nouvelle route pour récupérer les charges globales
router.get("/global-charges", async (req, res) => {
  const { semestre } = req.query

  try {
    const connection = await db.getConnection()

    // Récupérer toutes les charges pour ce semestre
    const [rows] = await connection.query("SELECT id, lastName, firstName, charge FROM charges WHERE semestre = ?", [
      semestre,
    ])

    connection.release()
    res.json(rows)
  } catch (error) {
    console.error("Erreur lors de la récupération des charges globales:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des charges globales" })
  }
})

// Route pour mettre à jour la charge d'un enseignant (ajouter ou soustraire)
router.post("/update-teacher-charge", async (req, res) => {
  const { semestre, teacher, chargeToSubtract, chargeToAdd, operation } = req.body

  if (!semestre || !teacher) {
    return res.status(400).json({
      success: false,
      message: "Le semestre et l'enseignant sont requis",
    })
  }

  try {
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      // Extraire le nom et prénom du format "NOM, PRENOM"
      const [lastName, firstName] = teacher.split(", ")

      if (!lastName || !firstName) {
        throw new Error(`Format de nom incorrect: ${teacher}`)
      }

      // Récupérer la charge actuelle
      const [currentChargeResult] = await connection.query(
        "SELECT charge FROM charges WHERE lastName = ? AND firstName = ? AND semestre = ?",
        [lastName, firstName, semestre],
      )

      if (currentChargeResult.length === 0) {
        throw new Error(`Enseignant ${teacher} non trouvé pour le semestre ${semestre}`)
      }

      const currentCharge = currentChargeResult[0].charge || 0
      let newCharge = currentCharge

      // Calculer la nouvelle charge selon l'opération
      if (operation === "subtract") {
        newCharge = Math.max(0, currentCharge - (chargeToSubtract || 0))
      } else if (operation === "add") {
        newCharge = currentCharge + (chargeToAdd || 0)
      } else if (operation === "set") {
        newCharge = chargeToAdd || 0
      }

      console.log(`Mise à jour de la charge pour ${teacher}:`)
      console.log(`  Charge actuelle: ${currentCharge}`)
      console.log(`  Opération: ${operation}`)
      console.log(`  Valeur: ${operation === "subtract" ? chargeToSubtract : chargeToAdd}`)
      console.log(`  Nouvelle charge: ${newCharge}`)

      // Mettre à jour la charge
      const [updateResult] = await connection.query(
        "UPDATE charges SET charge = ? WHERE lastName = ? AND firstName = ? AND semestre = ?",
        [newCharge, lastName, firstName, semestre],
      )

      if (updateResult.affectedRows === 0) {
        throw new Error(`Échec de la mise à jour pour ${teacher}`)
      }

      await connection.commit()

      res.json({
        success: true,
        message: `Charge mise à jour pour ${teacher}`,
        previousCharge: currentCharge,
        newCharge: newCharge,
      })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la charge:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la charge",
    })
  }
})

// Route pour sauvegarder l'organigramme
// Route pour sauvegarder l'organigramme
router.post("/save", async (req, res) => {
  const { semestre, palier, specialite, modules, calculatedCharges } = req.body

  try {
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      console.log("Début de la sauvegarde de l'organigramme...")
      console.log(`Semestre: ${semestre}, Palier: ${palier}, Specialite: ${specialite}`)
      console.log(`Nombre de modules: ${modules.length}`)
      console.log("Charges calculées par le frontend:", calculatedCharges)

      // 1. Supprimer les anciennes affectations pour cette combinaison
      await connection.query(
        `DELETE FROM organigrammes 
         WHERE semestre = ? AND palier = ? AND specialite = ?`,
        [semestre, palier, specialite],
      )

      // 2. Insérer les nouvelles affectations
      for (const module of modules) {
        await connection.query(
          `INSERT INTO organigrammes 
          (semestre, palier, specialite, module, section, enseignant_cours, 
           enseignant_td1, enseignant_td2, enseignant_td3, enseignant_td4,
           enseignant_tp1, enseignant_tp2, enseignant_tp3, enseignant_tp4)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            semestre,
            palier,
            specialite,
            module.module,
            module.section,
            module.cours,
            module.tds[0] || null,
            module.tds[1] || null,
            module.tds[2] || null,
            module.tds[3] || null,
            module.tps[0] || null,
            module.tps[1] || null,
            module.tps[2] || null,
            module.tps[3] || null,
          ],
        )
      }

      // 3. Mettre à jour les charges directement avec les valeurs calculées par le frontend
      if (calculatedCharges) {
        for (const [teacher, charge] of Object.entries(calculatedCharges)) {
          // Normaliser le format du nom (supprimer les espaces après la virgule)
          const normalizedTeacher = teacher.replace(/, /g, ",").trim()
          const [lastName, firstName] = normalizedTeacher.split(",").map((part) => part.trim())

          if (!lastName || !firstName) {
            console.log(`Format de nom incorrect pour ${teacher}, impossible de mettre à jour la charge`)
            continue
          }

          console.log(`Mise à jour directe de la charge pour ${lastName}, ${firstName}: ${charge} heures`)

          // Mise à jour insensible à la casse
          const [updateResult] = await connection.query(
            "UPDATE charges SET charge = ? WHERE LOWER(lastName) = LOWER(?) AND LOWER(firstName) = LOWER(?) AND semestre = ?",
            [charge, lastName, firstName, `S${semestre}`],
          )

          if (updateResult.affectedRows === 0) {
            console.log(`Aucune ligne mise à jour pour ${lastName}, ${firstName}. Vérification alternative...`)

            // Essayer avec le format "NOM, PRENOM" (avec espace après la virgule)
            const [updateResultAlt] = await connection.query(
              "UPDATE charges SET charge = ? WHERE LOWER(lastName) = LOWER(?) AND LOWER(firstName) = LOWER(?) AND semestre = ?",
              [charge, lastName, firstName, `S${semestre}`],
            )

            if (updateResultAlt.affectedRows === 0) {
              console.log(`Enseignant ${lastName}, ${firstName} non trouvé dans la table charges`)
            }
          }
        }
      }

      await connection.commit()
      console.log("Transaction validée avec succès")
      res.status(200).json({ message: "Organigramme sauvegardé avec succès" })
    } catch (err) {
      await connection.rollback()
      console.error("Erreur dans la transaction :", err)
      res.status(500).json({ error: `Échec de la sauvegarde: ${err.message}` })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur de connexion ou de transaction :", error)
    res.status(500).json({ error: `Erreur serveur: ${error.message}` })
  }
})

// Route pour mettre à jour directement une charge
router.post("/update-charge-direct", async (req, res) => {
  const { enseignant, semestre, charge } = req.body

  try {
    const connection = await db.getConnection()

    // Extraire le nom et prénom du format "NOM, PRENOM"
    const [lastName, firstName] = enseignant.split(", ").map((part) => part.trim())

    if (!lastName || !firstName) {
      return res.status(400).json({
        success: false,
        message: `Format de nom incorrect: ${enseignant}`,
      })
    }

    // Mise à jour directe par nom et prénom (insensible à la casse)
    const [updateResult] = await connection.query(
      "UPDATE charges SET charge = ? WHERE LOWER(lastName) = LOWER(?) AND LOWER(firstName) = LOWER(?) AND semestre = ?",
      [charge, lastName, firstName, semestre],
    )

    connection.release()

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Enseignant ${lastName} ${firstName} non trouvé pour le semestre ${semestre}`,
      })
    }

    res.json({
      success: true,
      message: `Charge mise à jour pour ${lastName} ${firstName}`,
      affectedRows: updateResult.affectedRows,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour directe:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour directe de la charge",
      systemError: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Route pour charger l'organigramme
// Modifiez la route /load dans organigramRoutes.js
router.get("/load", async (req, res) => {
  const { semestre, palier, specialite } = req.query

  try {
    const connection = await db.getConnection()

    // Joindre les informations du module pour obtenir les valeurs C, TD, TP
    const [rows] = await connection.query(
      `SELECT o.*, a.C, a.TD, a.TP 
       FROM organigrammes o
       LEFT JOIN allinfo a ON a.Module LIKE CONCAT(SUBSTRING_INDEX(o.module, ':', 1), '%')
                          AND a.Semestre = ? AND a.Palier = ? AND a.Specialite = ?
       WHERE o.semestre = ? AND o.palier = ? AND o.specialite = ?`,
      [`S${semestre}`, palier, specialite, semestre, palier, specialite],
    )

    connection.release()
    res.json(rows)
  } catch (error) {
    console.error("Erreur de chargement:", error)
    res.status(500).json({ error: "Erreur lors du chargement de l'organigramme" })
  }
})

// Route pour supprimer une section
// Correction pour la route /remove-section dans organigramRoutes.js
router.post("/remove-section", async (req, res) => {
  const { semestre, palier, specialite, sectionId, chargesToSubtract } = req.body

  if (!semestre || !palier || !specialite || !sectionId) {
    return res.status(400).json({
      success: false,
      message: "Paramètres manquants",
    })
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    // 1. Sauvegarder temporairement les charges actuelles
    const currentCharges = {}
    if (chargesToSubtract) {
      for (const teacher of Object.keys(chargesToSubtract)) {
        const [lastName, firstName] = teacher.split(", ")
        const [charge] = await connection.query(
          "SELECT charge FROM charges WHERE lastName = ? AND firstName = ? AND semestre = ?",
          [lastName, firstName, `S${semestre}`],
        )
        currentCharges[teacher] = charge[0]?.charge || 0
      }
    }

    // 2. Supprimer la section
    const [deleteResult] = await connection.query(
      "DELETE FROM organigrammes WHERE semestre = ? AND palier = ? AND specialite = ? AND section = ?",
      [semestre, palier, specialite, sectionId],
    )

    // 3. Mettre à jour les charges
    if (chargesToSubtract) {
      for (const [teacher, charge] of Object.entries(chargesToSubtract)) {
        const [lastName, firstName] = teacher.split(", ")
        const currentCharge = currentCharges[teacher] || 0
        const newCharge = Math.max(0, currentCharge - charge)

        await connection.query("UPDATE charges SET charge = ? WHERE lastName = ? AND firstName = ? AND semestre = ?", [
          newCharge,
          lastName,
          firstName,
          `S${semestre}`,
        ])
      }
    }

    await connection.commit()
    res.json({
      success: true,
      message: "Section supprimée avec succès",
      deletedCount: deleteResult.affectedRows,
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    })
  } finally {
    connection.release()
  }
})
// Route pour récupérer le titre de l'organigramme
router.get("/titreorg", async (req, res) => {
  try {
    const connection = await db.getConnection()

    // Récupérer le titre depuis la table titreorg
    const [rows] = await connection.query("SELECT titre FROM titreorg LIMIT 1")

    connection.release()

    if (rows.length > 0) {
      res.json({ titre: rows[0].titre })
    } else {
      res.json({ titre: "Organigramme des enseignements" }) // Titre par défaut
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du titre:", error)
    res.status(500).json({ error: "Erreur lors de la récupération du titre" })
  }
})
// Route pour synchroniser toutes les charges d'un semestre
router.post("/sync-all-charges", async (req, res) => {
  const { semestre } = req.body

  if (!semestre) {
    return res.status(400).json({ error: "Le semestre est requis" })
  }

  try {
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      // 1. Réinitialiser toutes les charges à zéro
      await connection.query("UPDATE charges SET charge = 0 WHERE semestre = ?", [semestre])

      // 2. Récupérer toutes les affectations pour ce semestre
      const [allAssignments] = await connection.query(
        `SELECT o.module, o.semestre, o.palier, o.specialite, 
         o.enseignant_cours, 
         o.enseignant_td1, o.enseignant_td2, o.enseignant_td3, o.enseignant_td4,
         o.enseignant_tp1, o.enseignant_tp2, o.enseignant_tp3, o.enseignant_tp4
         FROM organigrammes o
         WHERE o.semestre = ?`,
        [semestre],
      )

      console.log(`${allAssignments.length} affectations trouvées pour le semestre ${semestre}`)

      // 3. Recalculer toutes les charges
      const charges = {}

      for (const assignment of allAssignments) {
        // Récupérer les informations du module
        const [moduleInfo] = await connection.query(
          `SELECT Module, C, TD, TP FROM allinfo 
           WHERE Module LIKE ? AND Semestre = ? AND Palier = ? AND Specialite = ?`,
          [`${assignment.module.split(":")[0]}%`, assignment.semestre, assignment.palier, assignment.specialite],
        )

        if (moduleInfo.length === 0) {
          console.log(`Module non trouvé: ${assignment.module}`)
          continue
        }

        const info = moduleInfo[0]

        // Fonction pour ajouter une charge
        const addCharge = (teacher, value) => {
          if (teacher) {
            charges[teacher] = (charges[teacher] || 0) + value
          }
        }

        // Ajouter les charges
        addCharge(assignment.enseignant_cours, Number(info.C || 0) * 3)
        ;[
          assignment.enseignant_td1,
          assignment.enseignant_td2,
          assignment.enseignant_td3,
          assignment.enseignant_td4,
        ].forEach((teacher) => addCharge(teacher, Number(info.TD || 0)))
        ;[
          assignment.enseignant_tp1,
          assignment.enseignant_tp2,
          assignment.enseignant_tp3,
          assignment.enseignant_tp4,
        ].forEach((teacher) => addCharge(teacher, Number(info.TP || 0) * 1.5))
      }

      // 4. Mettre à jour les charges dans la base de données
      const updatePromises = Object.entries(charges).map(([teacher, charge]) => {
        const [lastName, firstName] = teacher.split(", ")
        if (!lastName || !firstName) return Promise.resolve()

        return connection.query("UPDATE charges SET charge = ? WHERE lastName = ? AND firstName = ? AND semestre = ?", [
          charge,
          lastName,
          firstName,
          semestre,
        ])
      })

      await Promise.all(updatePromises)

      await connection.commit()

      res.json({
        success: true,
        message: `Charges synchronisées avec succès pour ${Object.keys(charges).length} enseignants`,
        teachersUpdated: Object.keys(charges).length,
      })
    } catch (err) {
      await connection.rollback()
      console.error("Erreur lors de la synchronisation:", err)
      res.status(500).json({
        success: false,
        error: `Erreur lors de la synchronisation: ${err.message}`,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur de connexion:", error)
    res.status(500).json({
      success: false,
      error: `Erreur de connexion: ${error.message}`,
    })
  }
})

// Route pour déboguer la structure de la table charges
router.get("/debug-charges", async (req, res) => {
  try {
    const connection = await db.getConnection()

    // Récupérer la structure de la table
    const [tableInfo] = await connection.query("DESCRIBE charges")

    // Récupérer quelques exemples de données
    const [sampleData] = await connection.query("SELECT * FROM charges LIMIT 10")

    connection.release()

    res.json({
      tableStructure: tableInfo,
      sampleData: sampleData,
    })
  } catch (error) {
    console.error("Erreur lors du débogage:", error)
    res.status(500).json({ error: "Erreur lors du débogage de la table charges" })
  }
})

// Route pour forcer la mise à jour de toutes les charges
router.post("/force-update-charges", async (req, res) => {
  const { semestre } = req.body

  if (!semestre) {
    return res.status(400).json({ error: "Le semestre est requis" })
  }

  try {
    const connection = await db.getConnection()

    // Récupérer tous les enseignants de la table charges
    const [teachers] = await connection.query("SELECT id, lastName, firstName FROM charges WHERE semestre = ?", [
      semestre,
    ])

    console.log(`${teachers.length} enseignants trouvés dans la table charges pour le semestre ${semestre}`)

    // Mettre à jour chaque enseignant avec une charge de test
    let updatedCount = 0
    for (const teacher of teachers) {
      // Charge de test (2 heures)
      const testCharge = 2

      const [updateResult] = await connection.query("UPDATE charges SET charge = ? WHERE id = ? AND semestre = ?", [
        testCharge,
        teacher.id,
        semestre,
      ])

      if (updateResult.affectedRows > 0) {
        updatedCount++
      }
    }

    connection.release()

    res.json({
      success: true,
      message: `${updatedCount} charges mises à jour sur ${teachers.length} enseignants`,
      updatedCount,
      totalTeachers: teachers.length,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour forcée des charges:", error)
    res.status(500).json({ error: "Erreur lors de la mise à jour forcée des charges" })
  }
})

// Route pour réinitialiser toutes les données (vider organigrammes et remettre charges à 0)
router.post("/reset-all", async (req, res) => {
  try {
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      console.log("Début de la réinitialisation complète...")

      // 1. Vider complètement la table organigrammes
      const [deleteOrgResult] = await connection.query("DELETE FROM organigrammes")
      console.log(`${deleteOrgResult.affectedRows} lignes supprimées de la table organigrammes`)

      // 2. Remettre toutes les charges à 0
      const [updateChargesResult] = await connection.query("UPDATE charges SET charge = 0")
      console.log(`${updateChargesResult.affectedRows} charges remises à zéro`)

      
      console.log("Tables des enseignants également réinitialisées")

      await connection.commit()

      res.json({
        success: true,
        message: "Réinitialisation complète réussie",
        details: {
          organigrammesDeleted: deleteOrgResult.affectedRows,
          chargesReset: updateChargesResult.affectedRows,
        },
      })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur lors de la réinitialisation complète:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la réinitialisation complète",
    })
  }
})

// Route pour charger l'organigramme des enseignants
router.get("/teacher-organigram/load", async (req, res) => {
  const { semestre, palier, specialite } = req.query

  try {
    const connection = await db.getConnection()

    // Joindre les informations du module pour obtenir les valeurs C, TD, TP
    const [rows] = await connection.query(
      `SELECT o.*, a.C, a.TD, a.TP 
       FROM teachersorganigrammes o
       LEFT JOIN allinfo a ON a.Module LIKE CONCAT(SUBSTRING_INDEX(o.module, ':', 1), '%')
                          AND a.Semestre = ? AND a.Palier = ? AND a.Specialite = ?
       WHERE o.semestre = ? AND o.palier = ? AND o.specialite = ?`,
      [`S${semestre}`, palier, specialite, semestre, palier, specialite],
    )

    connection.release()
    res.json(rows)
  } catch (error) {
    console.error("Erreur de chargement:", error)
    res.status(500).json({ error: "Erreur lors du chargement de l'organigramme" })
  }
})

// Add a new route to verify teacher assignments across all sections and specialties
router.get("/verify-teacher-assignments", async (req, res) => {
  const { semestre, teacher, modulePattern } = req.query

  if (!semestre || !teacher || !modulePattern) {
    return res.status(400).json({ error: "Semestre, teacher et modulePattern sont requis" })
  }

  try {
    const connection = await db.getConnection()

    // Rechercher toutes les affectations de cet enseignant pour ce module dans toutes les spécialités
    const [assignments] = await connection.query(
      `SELECT palier, specialite, module, section FROM organigrammes 
       WHERE semestre = ? AND module LIKE ? AND 
       (enseignant_cours = ? OR 
        enseignant_td1 = ? OR enseignant_td2 = ? OR enseignant_td3 = ? OR enseignant_td4 = ? OR
        enseignant_tp1 = ? OR enseignant_tp2 = ? OR enseignant_tp3 = ? OR enseignant_tp4 = ?)`,
      [semestre, `${modulePattern}%`, teacher, teacher, teacher, teacher, teacher, teacher, teacher, teacher, teacher],
    )

    connection.release()

    res.json({
      success: true,
      assignments: assignments,
      count: assignments.length,
    })
  } catch (error) {
    console.error("Erreur lors de la vérification des affectations:", error)
    res.status(500).json({ error: "Erreur lors de la vérification des affectations" })
  }
})

// Add a new route to recalculate all charges for a specific teacher
router.post("/recalculate-teacher-charges", async (req, res) => {
  const { semestre, teacher } = req.body

  if (!semestre || !teacher) {
    return res.status(400).json({ error: "Le semestre et l'enseignant sont requis" })
  }

  try {
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      // Extraire le nom et prénom
      const [lastName, firstName] = teacher.split(", ")

      if (!lastName || !firstName) {
        throw new Error(`Format de nom incorrect: ${teacher}`)
      }

      // Réinitialiser la charge de cet enseignant
      await connection.query("UPDATE charges SET charge = 0 WHERE lastName = ? AND firstName = ? AND semestre = ?", [
        lastName,
        firstName,
        semestre,
      ])

      // Récupérer toutes les affectations de cet enseignant
      const [assignments] = await connection.query(
        `SELECT o.module, o.semestre, o.palier, o.specialite, o.section,
         CASE WHEN o.enseignant_cours = ? THEN 'cours' ELSE NULL END as cours,
         CASE WHEN o.enseignant_td1 = ? OR o.enseignant_td2 = ? OR o.enseignant_td3 = ? OR o.enseignant_td4 = ? THEN 'td' ELSE NULL END as td,
         CASE WHEN o.enseignant_tp1 = ? OR o.enseignant_tp2 = ? OR o.enseignant_tp3 = ? OR o.enseignant_tp4 = ? THEN 'tp' ELSE NULL END as tp
         FROM organigrammes o
         WHERE o.semestre = ? AND 
         (o.enseignant_cours = ? OR 
          o.enseignant_td1 = ? OR o.enseignant_td2 = ? OR o.enseignant_td3 = ? OR o.enseignant_td4 = ? OR
          o.enseignant_tp1 = ? OR o.enseignant_tp2 = ? OR o.enseignant_tp3 = ? OR o.enseignant_tp4 = ?)`,
        [
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          semestre,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
          teacher,
        ],
      )

      // Calculer la charge totale
      let totalCharge = 0
      const processedModules = new Set() // Pour éviter de compter deux fois le même module/type

      for (const assignment of assignments) {
        // Récupérer les informations du module
        const [moduleInfo] = await connection.query(
          `SELECT Module, C, TD, TP FROM allinfo 
           WHERE Module LIKE ? AND Semestre = ? AND Palier = ? AND Specialite = ?`,
          [`${assignment.module.split(":")[0]}%`, assignment.semestre, assignment.palier, assignment.specialite],
        )

        if (moduleInfo.length === 0) continue

        const info = moduleInfo[0]

        // Ajouter la charge selon le type d'affectation
        if (assignment.cours && !processedModules.has(`${assignment.module}-cours`)) {
          totalCharge += Number(info.C || 0) * 3
          processedModules.add(`${assignment.module}-cours`)
        }

        if (assignment.td && !processedModules.has(`${assignment.module}-td`)) {
          totalCharge += Number(info.TD || 0)
          processedModules.add(`${assignment.module}-td`)
        }

        if (assignment.tp && !processedModules.has(`${assignment.module}-tp`)) {
          totalCharge += Number(info.TP || 0) * 1.5
          processedModules.add(`${assignment.module}-tp`)
        }
      }

      // Mettre à jour la charge
      await connection.query("UPDATE charges SET charge = ? WHERE lastName = ? AND firstName = ? AND semestre = ?", [
        totalCharge,
        lastName,
        firstName,
        semestre,
      ])

      await connection.commit()

      res.json({
        success: true,
        message: `Charge recalculée pour ${teacher}: ${totalCharge}`,
        newCharge: totalCharge,
        assignmentsCount: assignments.length,
      })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erreur lors du recalcul des charges:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors du recalcul des charges",
    })
  }
})

module.exports = router
