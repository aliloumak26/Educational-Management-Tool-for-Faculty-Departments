const express = require("express")
const router = express.Router()
const db = require("./config/db")

router.get("/", async (req, res) => {
  const { semestre, palier, specialite } = req.query;
  
  // Validation des paramètres
  if (!semestre || !palier || !specialite) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  // Configuration de la requête
  const queryConfig = {
    sql: `
      SELECT 
        a.Module, 
        a.C, 
        a.TD, 
        a.TP,
        (
          SELECT GROUP_CONCAT(DISTINCT t.enseignant SEPARATOR '\n')
          FROM teachers t
          JOIN module_teacher_mapping m ON t.specialite = m.teacher_specialite
          WHERE a.Module LIKE CONCAT('%', m.module_pattern, '%')
        ) as enseignants
      FROM allinfo a
      WHERE a.Semestre = ? 
        AND a.Palier = ? 
        AND a.Specialite = ?
      GROUP BY a.Module, a.C, a.TD, a.TP
    `,
    values: [semestre, palier, specialite],
    timeout: 5000 // Timeout de 5 secondes
  };

  // Tentative avec réessai automatique
  let attempt = 0;
  const maxAttempts = 3;
  
  while (attempt < maxAttempts) {
    try {
      const [modules] = await db.query(queryConfig);
      
      // Si résultat vide mais pas d'erreur
      if (!modules.length && attempt < maxAttempts - 1) {
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 300 * attempt)); // Backoff exponentiel
        continue;
      }
      
      // Formatage cohérent des résultats
      const formattedModules = modules.map(module => ({
        ...module,
        enseignants: module.enseignants || "" // Garantit un string même si NULL
      }));
      
      return res.json(formattedModules);
      
    } catch (err) {
      attempt++;
      console.error(`Tentative ${attempt} échouée:`, err);
      
      if (attempt >= maxAttempts) {
        // En production, ne pas renvoyer le message d'erreur complet
        const errorMessage = process.env.NODE_ENV === 'development' 
          ? err.message 
          : "Erreur temporaire, veuillez réessayer";
        
        return res.status(500).json({ 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? {
            query: queryConfig.sql,
            params: queryConfig.values
          } : undefined
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300 * attempt));
    }
  }
});
router.get("/teachers", async (req, res) => {
  try {
    const { module, type, semestre, palier, specialite } = req.query
    const typeForApi = type.replace(/[0-9]/g, "")
    const typeNum = type.match(/\d+/)?.[0] || "1"

    // Normaliser le nom du module (supprimer les espaces multiples)
    const normalizedModule = module.replace(/\s+/g, " ").trim()

const [teachers] = await db.query(
  `SELECT DISTINCT
    t.enseignant,
    f.nom_prenom IS NOT NULL as has_fdv,
    f.semestre,
    f.hsup,
    f.palier1, f.specialite1, f.module1, f.cours1, f.td1, f.tp1,
    f.palier2, f.specialite2, f.module2, f.cours2, f.td2, f.tp2,
    f.palier3, f.specialite3, f.module3, f.cours3, f.td3, f.tp3,
    u.statut
  FROM teachers t
  LEFT JOIN fdv f ON t.enseignant = f.nom_prenom AND f.semestre = ?
  JOIN module_teacher_mapping m ON t.specialite = m.teacher_specialite
  LEFT JOIN users u ON 
    CONCAT(t.enseignant) = CONCAT(u.lastName, ', ', u.firstName) OR
    CONCAT(t.enseignant) = CONCAT(u.lastName, ' ', u.firstName)
  WHERE ? LIKE CONCAT('%', m.module_pattern, '%')
    AND u.statut = 'Actif'
  ORDER BY t.enseignant`,
  [semestre, module]
);

    const filteredTeachers = teachers.filter((teacher) => {
      // Si pas de FDV pour ce semestre, inclure l'enseignant
      if (!teacher.has_fdv) return true

      // Si l'enseignant accepte les heures supplémentaires (hsup=1) pour ce semestre, l'inclure sans filtrer par ses choix
      if (teacher.hsup === 1) return true

      // Pour les autres enseignants (qui ont une FDV pour ce semestre mais pas hsup=1), vérifier leurs choix
      const hasValidChoice = [1, 2, 3].some((choiceNum) => {
        const palierCol = `palier${choiceNum}`
        const specialiteCol = `specialite${choiceNum}`
        const moduleCol = `module${choiceNum}`

        // Normaliser le module FDV
        const normalizedFdvModule = teacher[moduleCol]?.replace(/\s+/g, " ").trim()
        const moduleCode = normalizedModule.split(":")[0].trim() // Partie avant ":"

        // Vérifier si ce choix concerne le contexte actuel
        const matchesContext =
          teacher[palierCol] === palier &&
          teacher[specialiteCol] === specialite &&
          normalizedFdvModule?.includes(moduleCode)

        // Si ce choix ne concerne pas ce contexte, passer au suivant
        if (!matchesContext) return false

        // Si contexte match, vérifier le type d'activité demandé
        const typeCol = `${typeForApi}${choiceNum}`
        return teacher[typeCol] == 1
      })

      return hasValidChoice
    })

    res.json(
      filteredTeachers.map((t) => ({
        name: t.enseignant,
        hsup: t.hsup === 1,
      })),
    )
  } catch (err) {
    console.error("Error fetching teachers:", err)
    res.status(500).json({ error: err.message })
  }
})
module.exports = router