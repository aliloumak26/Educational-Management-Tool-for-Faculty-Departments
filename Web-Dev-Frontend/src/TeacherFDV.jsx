"use client"

import { useState, useEffect } from "react"
import "./TeacherFDV.css"

const TeacherFDV = ({ user }) => {
  // État pour le filtre de semestre
  const [selectedSemester, setSelectedSemester] = useState("S1")

  // État pour les données de l'enseignant
  const [teacherData, setTeacherData] = useState(null)

  // État pour le chargement
  const [loading, setLoading] = useState(true)

  // État pour les erreurs
  const [error, setError] = useState(null)

  // Récupérer le nom de l'utilisateur connecté
  const teacherName = user ? `${user.lastName}, ${user.firstName}` : "ABADA, LYES"
  const year = "2025-2026"

  // Charger les données depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `http://localhost:5000/api/fdv/teacher?nom_prenom=${encodeURIComponent(teacherName)}&semestre=${selectedSemester}`,
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data && data.length > 0) {
          setTeacherData(data[0])
        } else {
          setTeacherData(null)
        }

        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger vos choix. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teacherName, selectedSemester])

  return (
    <div className="fdv-page">
      <div className="fdv-filter-container">
        <div className="fdv-filter-label">Filtrer par semestre:</div>
        <div className="fdv-filter-options">
          <button
            className={`fdv-filter-button ${selectedSemester === "S1" ? "active" : ""}`}
            onClick={() => setSelectedSemester("S1")}
          >
            S1
          </button>
          <button
            className={`fdv-filter-button ${selectedSemester === "S2" ? "active" : ""}`}
            onClick={() => setSelectedSemester("S2")}
          >
            S2
          </button>
        </div>
      </div>

      <div className="fdv-container">
        <div className="fdv-header">
          <div className="fdv-student-name">{teacherName}</div>
          <div className="fdv-semester">
            {selectedSemester} - Année {year}
          </div>
        </div>

        {loading ? (
          <div className="fdv-loading">Chargement des données...</div>
        ) : error ? (
          <div className="fdv-error">{error}</div>
        ) : teacherData ? (
          <>
            <table className="fdv-table">
            <thead>
              <tr>
                <th>Choix</th>
                <th>Palier</th>
                <th>Spécialité</th>
                <th>Module</th>
                <th>Cours</th>
                <th>TD</th>
                <th>TP</th>
                <th>H. Sup</th> {/* Nouvelle colonne ajoutée */}
              </tr>
            </thead>
            <tbody>
              {/* Choix 1 */}
              {teacherData.palier1 && teacherData.specialite1 && teacherData.module1 && (
                <tr>
                  <td>1</td>
                  <td>{teacherData.palier1}</td>
                  <td>{teacherData.specialite1}</td>
                  <td>{teacherData.module1}</td>
                  <td className={teacherData.cours1 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.cours1 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.td1 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.td1 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.tp1 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.tp1 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.hsup === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.hsup === 1 ? "Oui" : "Non"}
                  </td>
                </tr>
              )}

              {/* Choix 2 */}
              {teacherData.palier2 && teacherData.specialite2 && teacherData.module2 && (
                <tr>
                  <td>2</td>
                  <td>{teacherData.palier2}</td>
                  <td>{teacherData.specialite2}</td>
                  <td>{teacherData.module2}</td>
                  <td className={teacherData.cours2 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.cours2 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.td2 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.td2 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.tp2 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.tp2 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.hsup === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.hsup === 1 ? "Oui" : "Non"}
                  </td>
                </tr>
              )}

              {/* Choix 3 */}
              {teacherData.palier3 && teacherData.specialite3 && teacherData.module3 && (
                <tr>
                  <td>3</td>
                  <td>{teacherData.palier3}</td>
                  <td>{teacherData.specialite3}</td>
                  <td>{teacherData.module3}</td>
                  <td className={teacherData.cours3 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.cours3 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.td3 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.td3 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.tp3 === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.tp3 === 1 ? "Oui" : "Non"}
                  </td>
                  <td className={teacherData.hsup === 1 ? "fdv-yes" : "fdv-no"}>
                    {teacherData.hsup === 1 ? "Oui" : "Non"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </>
        ) : (
          <div className="fdv-no-data">Aucun choix pour {selectedSemester}</div>
        )}
      </div>
    </div>
  )
}

export default TeacherFDV
