"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Modify.css"

const Modify = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [showNotification, setShowNotification] = useState(false)

  // Protection contre les données manquantes
  useEffect(() => {
    if (!state?.user) {
      navigate("/")
    }
  }, [state, navigate])
  const STATUS_OPTIONS = [
  { value: "Actif", label: "Actif" },
  { value: "Congé", label: "Congé" },
  { value: "Congé maladie", label: "Congé maladie" },
  { value: "Inactif", label: "Inactif" }
];

  // État initial avec toutes les propriétés requises
  const [formData, setFormData] = useState({
    firstName: state?.user?.firstName || "",
    lastName: state?.user?.lastName || "",
    grade: state?.user?.grade || "1, Master Assistant",
    teacherId: state?.user?.id || "",
    gender: state?.user?.gender || "Woman",
  statut: state?.user?.statut || "Actif", // Valeur par défaut si non fournie
    phoneNumber: state?.user?.phone || "",
    personalEmail: state?.user?.email || "",
  })

  // État pour gérer les champs modifiables
  const [disabledFields, setDisabledFields] = useState({
    firstName: false,
    lastName: false,
    grade: false,
    teacherId: true,
    gender: false,
    statut: false,
    phoneNumber: false,
    personalEmail: false,
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
  }

  const handleSave = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/teachers/${formData.teacherId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        grade: formData.grade,
        gender: formData.gender,
        phone: formData.phoneNumber,
        email: formData.personalEmail,
        statut: formData.statut,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur de sauvegarde");
    }

    const result = await response.json();
    
    // Update local storage and state with the complete user data
    localStorage.setItem('user', JSON.stringify(result.user));
    
    setFormData({
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      grade: result.user.grade,
      gender: result.user.gender,
      teacherId: result.user.id,
      phoneNumber: result.user.phone,
      personalEmail: result.user.email,
      statut: result.user.statut
    });

    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  } catch (err) {
    console.error("Erreur:", err);
    alert(`Échec de la sauvegarde: ${err.message}`);
  }
}

  if (!state?.user) {
    return null
  }

  return (
    <div className="modify-page"> {/* Conteneur principal ajouté */}
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
                disabled={true}
                onChange={handleChange}
              />
              
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
                disabled={true}
                onChange={handleChange}
              />
              
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
    className={`status-select ${formData.statut.toLowerCase().replace(' ', '-')}`}
  >
    {STATUS_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  <span className="edit-icon" onClick={() => toggleFieldEdit("statut")} aria-label="Modifier le statut">
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
          <div className="buttons">
          <button className="btn btn-save" onClick={handleSave}>
            💾 Enregistrer les modifications
          </button>
        </div>
        </div>

        {/* Notification de succès */}
        <div className={`notification notification-success ${showNotification ? "show" : ""}`}>
          <div className="notification-icon">✓</div>
          <div className="notification-content">
            <div className="notification-title">Enregistré avec succès</div>
            <div className="notification-message">Les modifications ont été sauvegardées.</div>
          </div>
          <button className="notification-close" onClick={closeNotification} aria-label="Fermer la notification">
            ×
          </button>
          <div className="notification-progress"></div>
        </div>
      </div>
    </div>
  )
}

export default Modify