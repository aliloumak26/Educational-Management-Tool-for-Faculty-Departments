"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./addTeacher.css"

function AddTeacher({ user, handleLogout }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    grade: "",
    phone: "",
    email: "",
    statut: "",
    role: "",
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone) => {
    const re = /^[0-9\s]{10,15}$/
    return re.test(phone)
  }

    const STATUS_OPTIONS = [
  { value: "Actif", label: "Actif" },
  { value: "Congé", label: "Congé" },
  { value: "Congé maladie", label: "Congé maladie" },
  { value: "Inactif", label: "Inactif" }
];


  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    // Vérifier les champs obligatoires
    const requiredFields = ["firstName", "lastName", "email"]
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = "Ce champ est obligatoire"
        isValid = false
      }
    })

    // Validation de l'email
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide"
      isValid = false
    }

    // Validation du téléphone
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Veuillez entrer un numéro valide"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccess("")

    try {
      const response = await fetch("http://localhost:5000/api/addteacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout du professeur")
      }

      // Message de succès amélioré
      setSuccess(
        `✅ Professeur créé avec succès !\n` +
          `📧 Un email de bienvenue avec le mot de passe a été envoyé à ${formData.email}\n` ,
      )
      resetForm()
    } catch (error) {
      console.error("Erreur complète:", error)
      setErrors({
        general: error.message || "Une erreur inattendue est survenue",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      grade: "",
      phone: "",
      email: "",
      statut: "",
      role: "",
    })
    setErrors({})
  }

  return (
    <div className="add-teacher-container">
      <div className="add-teacher-card">
        <h2>Entrer les informations personnelles</h2>

        {errors.general && <div className="add-teacher-general-error">{errors.general}</div>}
        {success && (
          <div className="add-teacher-success-message" style={{ whiteSpace: "pre-line" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="add-teacher-form-grid">
            <div className="add-teacher-form-group">
              <label>Prénom *</label>
              <div className="add-teacher-input-wrapper">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "add-teacher-error-input" : ""}
                  required
                />
              </div>
              {errors.firstName && <div className="add-teacher-error-message">{errors.firstName}</div>}
            </div>

            <div className="add-teacher-form-group">
              <label>Nom *</label>
              <div className="add-teacher-input-wrapper">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "add-teacher-error-input" : ""}
                  required
                />
              </div>
              {errors.lastName && <div className="add-teacher-error-message">{errors.lastName}</div>}
            </div>

            <div className="add-teacher-form-group">
              <label>Genre</label>
              <div className="add-teacher-input-wrapper">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={errors.gender ? "add-teacher-error-input" : ""}
                >
                  <option>Séléctionner un genre</option>
                  <option value="Woman">Femme</option>
                  <option value="Man">Homme</option>
                </select>
              </div>
              {errors.gender && <div className="add-teacher-error-message">{errors.gender}</div>}
            </div>

            <div className="add-teacher-form-group">
              <label>Grade</label>
              <div className="add-teacher-input-wrapper">
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className={errors.grade ? "add-teacher-error-input" : ""}
                >
                  <option>Séléctionner un grade</option>
                 <option >Maitre assistant</option>
                <option >Assistant</option>
                <option >Maitre de conference classe A</option>
                <option >Maitre de conference classe B</option>               
                <option >Vacataire </option>
                <option >Professeur</option>
                </select>
              </div>
              {errors.grade && <div className="add-teacher-error-message">{errors.grade}</div>}
            </div>

            <div className="add-teacher-form-group">
              <label>Numéro de téléphone</label>
              <div className="add-teacher-input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "add-teacher-error-input" : ""}
                />
              </div>
              {errors.phone && <div className="add-teacher-error-message">{errors.phone}</div>}
            </div>

            <div className="add-teacher-form-group">
              <label>Email personnel *</label>
              <div className="add-teacher-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "add-teacher-error-input" : ""}
                  required
                />
              </div>
              {errors.email && <div className="add-teacher-error-message">{errors.email}</div>}
            </div>

            <div className="add-teacher-form-group">
  <label>Statut *</label>
  <div className="add-teacher-input-wrapper">
    <select
      id="statut"
      name="statut"
      value={formData.statut}
      onChange={handleChange}
      className={errors.statut ? "add-teacher-error-input" : ""}
      required
    >
      <option value="">Sélectionner un statut</option>
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
  {errors.statut && <div className="add-teacher-error-message">{errors.statut}</div>}
</div>

            <div className="add-teacher-form-group">
              <label>Role</label>
              <div className="add-teacher-input-wrapper">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? "add-teacher-error-input" : ""}
                >
                  <option>Séléctionner un role</option>
                  <option value="teacher">Prof</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {errors.role && <div className="add-teacher-error-message">{errors.role}</div>}
            </div>
          </div>

          <div className="add-teacher-button-bar">
            <button type="button" className="add-teacher-cancel-btn" onClick={() => navigate("/teachers")}>
              Annuler
            </button>
            <button type="submit" className="add-teacher-submit-btn" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Ajouter Professeur"}
            </button>
          </div>
        </form>

        {/* Note informative */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#0c4a6e",
          }}
        >
          <strong>📧 Information :</strong> Lors de la création d'un nouveau professeur, un email de bienvenue contenant
          les identifiants de connexion sera automatiquement envoyé à l'adresse email fournie.
        </div>
      </div>
    </div>
  )
}

export default AddTeacher
