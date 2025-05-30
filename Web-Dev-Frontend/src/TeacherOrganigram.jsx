"use client"

import { useState, useEffect } from "react"
import "./TeacherOrganigram.css"

const TeacherOrganigram = ({ user, setIsLoggedIn, setUser }) => {
  const [semestre, setSemestre] = useState("")
  const [palier, setPalier] = useState("")
  const [specialite, setSpecialite] = useState("")
  const [modules, setModules] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sections, setSections] = useState([])
  const [teacherCharges, setTeacherCharges] = useState({})
  // Ajouter un état pour stocker le titre de l'organigramme
  const [organigramTitle, setOrganigramTitle] = useState("")

  const isSelectionComplete = Boolean(semestre && palier && specialite)

  const specialitesParSemestreEtPalier = {
    "1-L1": ["I", "ING", "M", "MI"],
    "1-L2": ["ACAD", "GTR", "ISIL"],
    "1-L3": ["ACAD", "GTR", "ISIL"],
    "1-M1": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
    "1-M2": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
    "2-L1": ["I", "ING", "M", "MI"],
    "2-L2": ["ACAD", "GTR", "ISIL"],
    "2-L3": ["ACAD", "GTR", "ISIL"],
    "2-M1": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
    "2-M2": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
  }

  const semestres = ["1", "2"]
  const paliers = ["L1", "L2", "L3", "M1", "M2"]
  const specialitesDisponibles = semestre && palier ? specialitesParSemestreEtPalier[`${semestre}-${palier}`] || [] : []

  // Ajouter une fonction pour récupérer le titre de l'organigramme
  const fetchOrganigramTitle = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/organigram/titreorg`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()
      if (data.titre) {
        setOrganigramTitle(data.titre)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du titre:", err)
    }
  }

  // Charger les charges des enseignants
  const fetchTeacherCharges = async () => {
    if (!semestre) return

    try {
      const response = await fetch(`http://localhost:5000/api/organigram/teacher-charges1?semestre=S${semestre}`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()

      // Mettre à jour les charges des enseignants
      const chargesMap = {}
      data.forEach((teacher) => {
        const fullName = `${teacher.lastName}, ${teacher.firstName}`
        chargesMap[fullName] = teacher.charge || 0
      })

      setTeacherCharges(chargesMap)
    } catch (err) {
      console.error("Erreur lors de la récupération des charges:", err)
    }
  }

  // Charger les modules pour la combinaison sélectionnée
  const fetchModules = async () => {
    if (semestre && palier && specialite) {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `http://localhost:5000/api/modules?semestre=S${semestre}&palier=${palier}&specialite=${specialite}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Erreur ${response.status}: ${errorText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          throw new Error(`Réponse non-JSON reçue: ${text.substring(0, 100)}...`)
        }

        const data = await response.json()
        setModules(data)
      } catch (err) {
        console.error("Erreur de chargement:", err)
        setError(err.message)
        setModules([])
      } finally {
        setLoading(false)
      }
    }
  }

  // Charger l'organigramme depuis la table teachersorganigrammes
  const loadTeacherOrganigram = async () => {
    if (!semestre || !palier || !specialite) return

    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:5000/api/organigram/teacher-organigram/load?semestre=${semestre}&palier=${palier}&specialite=${specialite}`,
      )

      if (!response.ok) {
        throw new Error("Erreur lors du chargement")
      }

      const data = await response.json()

      // Organiser les données par section
      const sectionsMap = {}

      data.forEach((row) => {
        const sectionId = row.section || 1

        if (!sectionsMap[sectionId]) {
          sectionsMap[sectionId] = {
            id: sectionId,
            modules: [],
          }
        }

        // Vérifier si le module existe déjà dans cette section
        const existingModule = sectionsMap[sectionId].modules.find((m) => m.Module === row.module)

        if (!existingModule) {
          // Ajouter le module à la section
          sectionsMap[sectionId].modules.push({
            Module: row.module,
            C: row.C || 0,
            TD: row.TD || 0,
            TP: row.TP || 0,
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
        }
      })

      // Convertir l'objet en tableau et trier par ID de section
      const loadedSections = Object.values(sectionsMap).sort((a, b) => a.id - b.id)
      setSections(loadedSections)
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur lors du chargement de l'organigramme: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Ajouter un useEffect pour charger le titre au chargement initial
  useEffect(() => {
    fetchOrganigramTitle()
  }, [])

  useEffect(() => {
    if (semestre) {
      fetchTeacherCharges()
    }
  }, [semestre])

  useEffect(() => {
    if (semestre && palier && specialite) {
      fetchModules()
      loadTeacherOrganigram()
    }
  }, [semestre, palier, specialite])

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const selectOption = (value, type) => {
    if (type === "semestre") {
      setSemestre(value)
      setPalier("")
      setSpecialite("")
    } else if (type === "palier") {
      setPalier(value)
      setSpecialite("")
    } else if (type === "specialite") {
      // Si on clique sur la même spécialité, on force le rechargement
      if (value === specialite) {
        loadTeacherOrganigram()
      } else {
        setSpecialite(value)
      }
    }
    setOpenDropdown(null)

    // Réinitialiser les sections si on change de semestre, palier ou spécialité
    if (type === "semestre" || type === "palier" || (type === "specialite" && value !== specialite)) {
      setSections([])
    }
  }

  const dropdowns = [
    {
      id: "semestre",
      title: "Semestre",
      options: semestres.map((s) => ({ value: s, label: `S${s}` })),
      selected: semestre ? `S${semestre}` : "",
      disabled: false,
    },
    {
      id: "palier",
      title: "Palier",
      options: paliers,
      selected: palier,
      disabled: !semestre,
    },
    {
      id: "specialite",
      title: "Spécialité",
      options: specialitesDisponibles,
      selected: specialite,
      disabled: !palier,
    },
  ]

  // Fonction pour afficher la charge d'un enseignant avec un indicateur visuel
  const renderTeacherWithCharge = (teacher) => {
    if (!teacher) return null

    // Vérifier si c'est l'utilisateur connecté
    const isCurrentUser = user && `${user.lastName}, ${user.firstName}` === teacher

    // Afficher la charge uniquement pour l'utilisateur connecté
    const charge = isCurrentUser ? teacherCharges[teacher] || 0 : null
    let chargeClass = ""

    if (charge !== null) {
      if (charge >= 10) {
        chargeClass = "high"
      } else if (charge >= 8) {
        chargeClass = "medium"
      }
    }

    return (
      <div className={`teacher-assigned ${isCurrentUser ? "current-user" : ""}`}>
        <span className="teacher-assigned-icon">👤</span>
        {teacher}
        {charge !== null && <span className={`teacher-charge ${chargeClass}`}>({charge}/12)</span>}
      </div>
    )
  }

  // Ajouter le titre dans le rendu du composant, juste après la div "teacher-organigram-container"
  return (
    <div className="teacher-organigram-container">
      {/* Titre de l'organigramme */}
      {organigramTitle && <h1 className="teacher-organigram-title">{organigramTitle}</h1>}

      {/* Dropdowns de filtrage */}
      <div className="teacher-organigram-dropdown-container">
        {dropdowns.map((dropdown) => (
          <div key={dropdown.id} className="teacher-organigram-dropdown-wrapper">
            <div className={`teacher-organigram-dropdown-title dropdown-title-spacing`}>{dropdown.title}</div>
            <div className={`teacher-organigram-dropdown ${openDropdown === dropdown.id ? "open" : ""}`}>
              <button
                className={`teacher-organigram-dropdown-btn ${dropdown.selected ? "selected" : ""} ${dropdown.disabled ? "disabled" : ""}`}
                onClick={() => !dropdown.disabled && toggleDropdown(dropdown.id)}
                disabled={dropdown.disabled}
              >
                {dropdown.selected || `Sélectionner ${dropdown.title}`}
                {!dropdown.disabled && <span className="teacher-organigram-arrow">▼</span>}
              </button>
              {openDropdown === dropdown.id && (
                <div className="teacher-organigram-dropdown-menu">
                  {dropdown.options.map((option) => {
                    const value = typeof option === "object" ? option.value : option
                    const label = typeof option === "object" ? option.label : option
                    return (
                      <div
                        key={value}
                        className="teacher-organigram-dropdown-item"
                        onClick={() => selectOption(value, dropdown.id)}
                      >
                        {label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loader et erreurs */}
      {loading && (
        <div className="teacher-loading-message">
          <div className="teacher-loading-spinner"></div>
          Chargement en cours...
        </div>
      )}

      {error && <p className="teacher-error-message">{error}</p>}

      {/* Affichage des informations de sélection */}
      {isSelectionComplete && !loading && !error && (
        <div className="teacher-section-controls">
          <div className="teacher-info-banner">
            <span className="teacher-info-item">
              Type: <span className="teacher-info-value">{palier?.startsWith("L") ? "Licence" : "Master" || "-"}</span>
            </span>
            <span className="teacher-info-separator">, </span>
            <span className="teacher-info-item">
              Année: <span className="teacher-info-value">{palier?.replace("L", "").replace("M", "") || "-"}</span>
            </span>
            <span className="teacher-info-separator">, </span>
            <span className="teacher-info-item">
              Spécialité: <span className="teacher-info-value">{specialite || "-"}</span>
            </span>
          </div>
        </div>
      )}

      {/* Sections affichées */}
      {!loading && !error && sections.length > 0 ? (
        <div className="teacher-section-list">
          {/* Un tableau par section */}
          {sections.map((section) => (
            <div key={section.id} className="teacher-section-container">
              <div className="teacher-section-header">
                <h3 className="teacher-section-title">Section {section.id}</h3>
              </div>
              <div className="teacher-table-responsive-container">
                <table className="teacher-compact-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Cours</th>
                      <th>TD1</th>
                      <th>TD2</th>
                      <th>TD3</th>
                      <th>TD4</th>
                      <th>TP1</th>
                      <th>TP2</th>
                      <th>TP3</th>
                      <th>TP4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.modules.map((module, moduleIndex) => (
                      <tr key={`${section.id}-${moduleIndex}`}>
                        <td>{module.Module}</td>

                        {/* Cours */}
                        <td>
                          {module.enseignant_cours ? (
                            renderTeacherWithCharge(module.enseignant_cours)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TD1 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_td1 ? (
                            renderTeacherWithCharge(module.enseignant_td1)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TD2 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_td2 ? (
                            renderTeacherWithCharge(module.enseignant_td2)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TD3 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_td3 ? (
                            renderTeacherWithCharge(module.enseignant_td3)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TD4 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_td4 ? (
                            renderTeacherWithCharge(module.enseignant_td4)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TP1 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_tp1 ? (
                            renderTeacherWithCharge(module.enseignant_tp1)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TP2 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_tp2 ? (
                            renderTeacherWithCharge(module.enseignant_tp2)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TP3 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_tp3 ? (
                            renderTeacherWithCharge(module.enseignant_tp3)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>

                        {/* TP4 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="teacher-non-existent-component">
                              <span className="teacher-non-existent-icon">❌</span>
                            </div>
                          ) : module.enseignant_tp4 ? (
                            renderTeacherWithCharge(module.enseignant_tp4)
                          ) : (
                            <div className="teacher-not-assigned">Non assigné</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !error && isSelectionComplete ? (
        <p className="teacher-no-data-message">Il n'y a pas encore d'organigramme pour cette spécialité.</p>
      ) : null}
    </div>
  )
}

export default TeacherOrganigram
