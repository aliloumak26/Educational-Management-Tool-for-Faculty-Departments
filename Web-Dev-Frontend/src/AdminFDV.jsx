"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./AdminFDV.css"

const AdminFDV = ({ user }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // État pour le filtre de semestre
  const [selectedSemester, setSelectedSemester] = useState("S1")

  // État pour la recherche d'enseignant
  const [searchQuery, setSearchQuery] = useState("")

  // État pour les données de tous les enseignants
  const [teachersData, setTeachersData] = useState([])

  // État pour l'enseignant sélectionné pour voir les détails
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  // État pour le chargement
  const [loading, setLoading] = useState(true)

  // État pour les erreurs
  const [error, setError] = useState(null)

  const [importMessage, setImportMessage] = useState(null)

  // État pour indiquer si on vient de la page Teachers
  const [isFromTeachers, setIsFromTeachers] = useState(false)

  const year = "2025-2026"

  // Effet pour gérer les paramètres URL et la recherche automatique
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const teacherParam = urlParams.get("teacher")

    if (teacherParam) {
      setSearchQuery(decodeURIComponent(teacherParam))
      setIsFromTeachers(true)

      // Nettoyer l'URL après avoir récupéré le paramètre
      navigate("/admin/fdv", { replace: true })
    }
  }, [location.search, navigate])

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/fdv/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (response.ok) {
        setImportMessage({
          type: "success",
          text: result.message,
          details: `${result.length || ""} enregistrements importés`,
        })
        // Recharger les données après import
        await fetchData()

        // Faire disparaître le message après 5 secondes
        setTimeout(() => {
          setImportMessage((prev) => {
            if (prev?.type === "success") return null
            return prev
          })
        }, 3000)
      } else {
        setImportMessage({
          type: "error",
          text: result.error || "Erreur lors de l'importation",
          details: result.details,
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error)
      setImportMessage({
        type: "error",
        text: "Erreur lors de l'importation",
        details: error.message,
      })
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/fdv/all?semestre=${selectedSemester}`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        setTeachersData(data)
        setSelectedTeacher(null)
      } else {
        setTeachersData([])
      }

      setError(null)
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err)
      setError("Impossible de charger les fiches de vœux. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  // Charger les données depuis le backend
  useEffect(() => {
    fetchData()
  }, [selectedSemester])

  // Filtrer les enseignants en fonction de la recherche
// Modifiez la partie filtre comme suit :
const filteredTeachers = teachersData.filter((teacher) => {
  // Si pas de recherche ou pas de query, affiche tous les profs
  if (!searchQuery || searchQuery.trim() === "") {
    return true;
  }
  
  // Sinon, fait la recherche normalisée
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/,/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return normalizeName(teacher.nom_prenom).includes(normalizeName(searchQuery));
});

  // Effet pour auto-sélectionner l'enseignant si on vient de la page Teachers et qu'il n'y a qu'un résultat
  useEffect(() => {
    if (isFromTeachers && filteredTeachers.length === 1 && !selectedTeacher) {
      setSelectedTeacher(filteredTeachers[0])
    }
  }, [filteredTeachers, isFromTeachers, selectedTeacher])

  // Sélectionner un enseignant pour voir ses détails
  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher === selectedTeacher ? null : teacher)
  }




  return (
    <div className="admin-fdv-page">
      <div className="admin-fdv-fixed-content">
        <h1 className="admin-fdv-title">Administration des Fiches de Vœux</h1>

        <div className="admin-fdv-controls">
          <div className="admin-fdv-filter-container">
            <div className="admin-fdv-filter-label">Semestre:</div>
            <div className="admin-fdv-filter-options">
              <button
                className={`admin-fdv-filter-button ${selectedSemester === "S1" ? "active" : ""}`}
                onClick={() => setSelectedSemester("S1")}
              >
                S1
              </button>
              <button
                className={`admin-fdv-filter-button ${selectedSemester === "S2" ? "active" : ""}`}
                onClick={() => setSelectedSemester("S2")}
              >
                S2
              </button>
            </div>
          </div>

          <div className="admin-fdv-search-container">
            <input
              type="text"
              placeholder="Rechercher un enseignant..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsFromTeachers(false) // Reset le flag quand l'utilisateur tape manuellement
              }}
              className="admin-fdv-search-input"
            />
            
          </div>

          <div className="admin-fdv-import-container">
            <label htmlFor="file-upload" className="admin-fdv-import-button">
              {loading ? "Import en cours..." : "Importer depuis Excel"}
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
              style={{ display: "none" }}
              disabled={loading}
            />
          </div>
        </div>

        
      </div>

      {importMessage && (
        <div
          className={`admin-fdv-import-message ${importMessage.type} ${importMessage.fadeOut ? "fade-out" : ""}`}
          onAnimationEnd={() => importMessage.fadeOut && setImportMessage(null)}
        >
          <span className="icon">{importMessage.type === "success" ? "✓" : "⚠"}</span>
          <div className="message-content">
            <div>{importMessage.text}</div>
            {importMessage.details && <div className="admin-fdv-import-details">{importMessage.details}</div>}
          </div>
          {importMessage.type === "error" && (
            <button className="close-message-button" onClick={() => setImportMessage(null)}>
              ×
            </button>
          )}
        </div>
      )}

      <div className="admin-fdv-scrollable-content">
        {loading ? (
          <div className="admin-fdv-loading">Chargement des données...</div>
        ) : error ? (
          <div className="admin-fdv-error">{error}</div>
        ) : filteredTeachers.length > 0 ? (
          <div className="admin-fdv-container">
            <div className="admin-fdv-header">
              <div className="admin-fdv-semester">
                {selectedSemester} - Année {year}
              </div>
              <div className="admin-fdv-count">
                {filteredTeachers.length} enseignant{filteredTeachers.length > 1 ? "s" : ""}
                {searchQuery && ` (filtré${filteredTeachers.length > 1 ? "s" : ""} par "${searchQuery}")`}
              </div>
            </div>

            <div className="admin-fdv-teachers-list">
              {filteredTeachers.map((teacher, index) => (
                <div key={index} className="admin-fdv-teacher-item">
                  <div
                    className={`admin-fdv-teacher-header ${selectedTeacher === teacher ? "active" : ""}`}
                    onClick={() => handleSelectTeacher(teacher)}
                  >
                    <div className="admin-fdv-teacher-name">{teacher.nom_prenom}</div>
                    <div className="admin-fdv-teacher-choices">
                      {(teacher.module1 ? 1 : 0) + (teacher.module2 ? 1 : 0) + (teacher.module3 ? 1 : 0)} choix
                    </div>
                    <div className="admin-fdv-expand-icon">{selectedTeacher === teacher ? "▼" : "▶"}</div>
                  </div>

                  {selectedTeacher === teacher && (
                    <div className="admin-fdv-teacher-details">
                      <table className="admin-fdv-table">
                        <thead>
                          <tr>
                            <th>Choix</th>
                            <th>Palier</th>
                            <th>Spécialité</th>
                            <th>Module</th>
                            <th>Cours</th>
                            <th>TD</th>
                            <th>TP</th>
                            <th>H. Sup</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Choix 1 */}
                          {teacher.palier1 && teacher.specialite1 && teacher.module1 && (
                            <tr>
                              <td>1</td>
                              <td>{teacher.palier1}</td>
                              <td>{teacher.specialite1}</td>
                              <td>{teacher.module1}</td>
                              <td className={teacher.cours1 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.cours1 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.td1 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.td1 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.tp1 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.tp1 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.hsup === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.hsup === 1 ? "Oui" : "Non"}
                              </td>
                            </tr>
                          )}

                          {/* Choix 2 */}
                          {teacher.palier2 && teacher.specialite2 && teacher.module2 && (
                            <tr>
                              <td>2</td>
                              <td>{teacher.palier2}</td>
                              <td>{teacher.specialite2}</td>
                              <td>{teacher.module2}</td>
                              <td className={teacher.cours2 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.cours2 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.td2 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.td2 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.tp2 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.tp2 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.hsup === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.hsup === 1 ? "Oui" : "Non"}
                              </td>
                            </tr>
                          )}

                          {/* Choix 3 */}
                          {teacher.palier3 && teacher.specialite3 && teacher.module3 && (
                            <tr>
                              <td>3</td>
                              <td>{teacher.palier3}</td>
                              <td>{teacher.specialite3}</td>
                              <td>{teacher.module3}</td>
                              <td className={teacher.cours3 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.cours3 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.td3 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.td3 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.tp3 === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.tp3 === 1 ? "Oui" : "Non"}
                              </td>
                              <td className={teacher.hsup === 1 ? "admin-fdv-yes" : "admin-fdv-no"}>
                                {teacher.hsup === 1 ? "Oui" : "Non"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="admin-fdv-no-data">
            Aucune fiche de vœux trouvée pour "{searchQuery}" dans {selectedSemester}
            
          </div>
        ) : (
          <div className="admin-fdv-no-data">Aucune fiche de vœux trouvée pour {selectedSemester}</div>
        )}
      </div>
    </div>
  )
}

export default AdminFDV
