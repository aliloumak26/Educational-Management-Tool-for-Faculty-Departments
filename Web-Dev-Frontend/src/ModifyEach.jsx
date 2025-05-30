"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Modify.css"

const ModifyEach = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showDeleteNotification, setShowDeleteNotification] = useState(false)
  const [teacherData, setTeacherData] = useState(null)

  useEffect(() => {
  if (!location.state?.teacher) {
    navigate("/")
    return
  }

  const teacher = location.state.teacher

  setTeacherData(teacher)

    
  // Initialisez formData avec toutes les propriétés nécessaires
  setFormData({
    firstName: teacher.firstName || "",
    lastName: teacher.lastName || "",
    grade: teacher.grade ,
    teacherId: teacher.id || "",
    gender: teacher.gender ,
    statut: teacher.statut || "",
    phoneNumber: teacher.phone || "",
    personalEmail: teacher.email || "",
  })
}, [location.state?.teacher, navigate])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    grade: "",
    teacherId: "",
    gender: "Woman",
    statut: "Actif",
    phoneNumber: "",
    personalEmail: "",
  })

  const [disabledFields, setDisabledFields] = useState({
    firstName: true,
    lastName: true,
    grade: true,
    teacherId: true,
    gender: true,
    statut: true,
    phoneNumber: true,
    personalEmail: true,
  })

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const toggleFieldEdit = (field) => {
    setDisabledFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const closeNotification = () => {
    setShowNotification(false)
    navigate(-1)
  }

  const closeDeleteNotification = () => {
    setShowDeleteNotification(false)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/infos/${formData.teacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          grade: formData.grade,
          gender: formData.gender,
          phone: formData.phoneNumber,
          email: formData.personalEmail,
          statut: formData.statut,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur de sauvegarde")
      }

      const updatedTeacher = {
        ...teacherData,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.personalEmail,
        gender: formData.gender ,
        phone: formData.phoneNumber,
        statut: formData.statut,
        grade: formData.grade,
      }

      localStorage.setItem("currentProf", JSON.stringify(updatedTeacher))
      setShowNotification(true)

      setTimeout(() => {
        closeNotification()
      }, 5000)
    } catch (err) {
      console.error("Erreur:", err)
      alert(`Échec de la sauvegarde: ${err.message}`)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`http://localhost:5000/api/infos/${formData.teacherId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      const contentType = response.headers.get("content-type")

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la suppression")
        } else {
          const textResponse = await response.text()
          console.error("Réponse non-JSON:", textResponse)
          throw new Error(`Erreur ${response.status}: L'endpoint DELETE n'existe peut-être pas`)
        }
      }

      const result = contentType && contentType.includes("application/json") ? await response.json() : { success: true }
      localStorage.removeItem("currentProf")
      setShowDeleteConfirmation(false)
      setShowDeleteNotification(true)

      setTimeout(() => {
        navigate(-1)
      }, 3000)
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      alert(`Échec de la suppression: ${err.message}`)
      setShowDeleteConfirmation(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  return (
    <div className="modify-page">
      <div className="main-container">
        

        <div className="form-section">
          <h2 className="section-title">Modifier le profil enseignant</h2>

          <div className="form-grid">
            {/* Colonne 1 */}
            <div className="form-group">
              <label htmlFor="firstName">Prénom :</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                disabled={disabledFields.firstName}
                onChange={handleChange}
              />
              <span className="edit-icon" onClick={() => toggleFieldEdit("firstName")} aria-label="Modifier le prénom">
                ✏️
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="grade">Grade :</label>
              <select id="grade" value={formData.grade} disabled={disabledFields.grade} onChange={handleChange}>
                 <option >Maitre assistant</option>
                <option >Assistant</option>
                <option >Maitre de conference classe A</option>
                <option >Maitre de conference classe B</option>               
                <option >Vacataire </option>
                <option >Professeur</option>
              </select>
              <span className="edit-icon" onClick={() => toggleFieldEdit("grade")} aria-label="Modifier le grade">
                ✏️
              </span>
            </div>

            {/* Colonne 2 */}
            <div className="form-group">
              <label htmlFor="lastName">Nom :</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                disabled={disabledFields.lastName}
                onChange={handleChange}
              />
              <span className="edit-icon" onClick={() => toggleFieldEdit("lastName")} aria-label="Modifier le nom">
                ✏️
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="teacherId">ID :</label>
              <input
                type="text"
                id="teacherId"
                value={formData.teacherId}
                disabled={true}
              />
            </div>

            {/* Colonne 3 */}
            <div className="form-group">
              <label htmlFor="gender">Sexe :</label>
              <select id="gender" value={formData.gender} disabled={disabledFields.gender} onChange={handleChange}>
                <option value="Woman">Femme</option>
                <option value="Man">Homme</option>
              </select>
              <span className="edit-icon" onClick={() => toggleFieldEdit("gender")} aria-label="Modifier le genre">
                ✏️
              </span>
            </div>

           <div className="form-group">
  <label htmlFor="statut">Statut :</label>
  <select 
    id="statut" 
    value={formData.statut} 
    disabled={disabledFields.statut} 
    onChange={handleChange}
  >
    <option value="Actif">Actif</option>
    <option value="Congé">Congé</option>
    <option value="Congé maladie">Congé maladie</option>
    <option value="Inactif">Inactif</option>
  </select>
  <span className="edit-icon" onClick={() => toggleFieldEdit("statut")}>
    ✏️
  </span>
</div>

            {/* Colonne 4 */}
            <div className="form-group">
              <label htmlFor="phoneNumber">Téléphone :</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                disabled={disabledFields.phoneNumber}
                onChange={handleChange}
              />
              <span className="edit-icon" onClick={() => toggleFieldEdit("phoneNumber")} aria-label="Modifier le téléphone">
                ✏️
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="personalEmail">Email personnel :</label>
              <input
                type="email"
                id="personalEmail"
                value={formData.personalEmail}
                disabled={disabledFields.personalEmail}
                onChange={handleChange}
              />
              <span className="edit-icon" onClick={() => toggleFieldEdit("personalEmail")} aria-label="Modifier l'email personnel">
                ✏️
              </span>
            </div>
          </div>
        </div>
        <div className="buttons">
          <button className="btn btn-delete" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "🗑️ Supprimer le profil"}
          </button>
          <button className="btn btn-save" onClick={handleSave}>
            💾 Enregistrer les modifications
          </button>
        </div>

        {/* Notification de sauvegarde réussie */}
        <div className={`notification notification-success ${showNotification ? "show" : ""}`}>
          <div className="notification-icon">✓</div>
          <div className="notification-content">
            <div className="notification-title">Modifications enregistrées</div>
            <div className="notification-message">Les modifications ont été enregistrées avec succès.</div>
          </div>
          <button className="notification-close" onClick={closeNotification} aria-label="Fermer la notification">
            ×
          </button>
          <div className="notification-progress"></div>
        </div>

        {/* Confirmation de suppression */}
        {showDeleteConfirmation && (
          <div className="notification-overlay">
            <div className="delete-confirmation">
              <div className="delete-confirmation-icon">🗑️</div>
              <h3>Supprimer le profil</h3>
              <p>
                Voulez-vous vraiment supprimer le profil de{" "}
                <strong>
                  {formData.firstName} {formData.lastName}
                </strong>{" "}
                ?
              </p>
              <div className="delete-confirmation-buttons">
                <button className="btn-cancel" onClick={cancelDelete}>
                  Annuler
                </button>
                <button className="btn-confirm-delete" onClick={confirmDelete}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification de suppression réussie */}
        <div className={`notification notification-delete ${showDeleteNotification ? "show" : ""}`}>
          <div className="notification-icon-delete">✓</div>
          <div className="notification-content">
            <div className="notification-title">Suppression réussie</div>
            <div className="notification-message">Le profil a été supprimé. Redirection vers la page précédente...</div>
          </div>
          <button className="notification-close" onClick={closeDeleteNotification} aria-label="Fermer la notification">
            ×
          </button>
          <div className="notification-progress-delete"></div>
        </div>
      </div>
    </div>
  )
}

export default ModifyEach