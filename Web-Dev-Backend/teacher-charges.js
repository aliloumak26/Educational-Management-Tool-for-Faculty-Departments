const express = require("express");
const router = express.Router();
const db = require("./config/db");

// Fonction commune pour les deux routes
const getTeacherCharges = async (tableName, teacherName, semester) => {
  let query = `SELECT * FROM ${tableName}`;
  let allInfoQuery = 'SELECT * FROM allinfo';
  
  let whereClauses = [];
  
  if (teacherName) {
    whereClauses.push(`
      (enseignant_cours LIKE '%${teacherName}%' OR
      enseignant_td1 LIKE '%${teacherName}%' OR
      enseignant_td2 LIKE '%${teacherName}%' OR
      enseignant_td3 LIKE '%${teacherName}%' OR
      enseignant_td4 LIKE '%${teacherName}%' OR
      enseignant_tp1 LIKE '%${teacherName}%' OR
      enseignant_tp2 LIKE '%${teacherName}%' OR
      enseignant_tp3 LIKE '%${teacherName}%' OR
      enseignant_tp4 LIKE '%${teacherName}%')
    `);
  }

  if (semester) {
    const semesterNumber = semester.replace('S', '');
    whereClauses.push(`semestre = '${semesterNumber}'`);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  const [organigrammes] = await db.execute(query);
  const [allInfos] = await db.execute(allInfoQuery);

  const modules = organigrammes.map(org => {
    const teacherCharges = [];
    let totalHours = 0;

    const moduleInfo = allInfos.find(info => 
      info.Module && info.Module.split(':')[0] === org.module.split(':')[0] && 
      info.Specialite === org.specialite && 
      info.Semestre.replace('S', '') === org.semestre
    );

    const countCharges = (typePrefix) => {
      return teacherCharges.filter(charge => charge.startsWith(typePrefix)).length;
    };

    const addCharge = (teacher, type) => {
      if (teacher && (!teacherName || teacher.includes(teacherName))) {
        teacherCharges.push(type);
      }
    };
    
    addCharge(org.enseignant_cours, 'Cours');
    addCharge(org.enseignant_td1, 'TD1');
    addCharge(org.enseignant_td2, 'TD2');
    addCharge(org.enseignant_td3, 'TD3');
    addCharge(org.enseignant_td4, 'TD4');
    addCharge(org.enseignant_tp1, 'TP1');
    addCharge(org.enseignant_tp2, 'TP2');
    addCharge(org.enseignant_tp3, 'TP3');
    addCharge(org.enseignant_tp4, 'TP4');

    if (moduleInfo) {
      const nbCours = countCharges('Cours');
      const nbTD = countCharges('TD');
      const nbTP = countCharges('TP');

      totalHours += nbCours * (moduleInfo.C || 0) * 3;
      totalHours += nbTD * (moduleInfo.TD || 0);
      totalHours += nbTP * (moduleInfo.TP || 0) * 1.5;
    }
    
    return {
      module: org.module.split(':')[0],
      year: org.palier.replace('L', ''),
      type: org.palier.includes('L') ? 'LIC' : org.palier.includes('M') ? 'MASTER' : 'ING',
      spec: org.specialite,
      section: org.section,
      semester: org.semestre,
      charges: teacherCharges,
      totalHours: totalHours
    };
  }).filter(module => !teacherName || module.charges.length > 0);

  return modules;
};

// Route standard (teachersorganigrammes)
router.get('/', async (req, res) => {
  try {
    const modules = await getTeacherCharges(
      'teachersorganigrammes',
      req.query.teacher,
      req.query.semester
    );

    res.json({
      success: true,
      modules,
      isFiltered: !!req.query.teacher
    });
    
  } catch (error) {
    console.error('Erreur dans /teacher-charges:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route admin (organigrammes)
router.get('/admin', async (req, res) => {
  try {
    const modules = await getTeacherCharges(
      'organigrammes',
      req.query.teacher,
      req.query.semester
    );

    res.json({
      success: true,
      modules,
      isFiltered: !!req.query.teacher
    });
    
  } catch (error) {
    console.error('Erreur dans /teacher-charges/admin:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;