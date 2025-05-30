"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaEnvelope, FaPaperPlane, FaSpinner, FaShieldAlt, FaArrowLeft } from "react-icons/fa"
import "./Forgot-password.css"

// URL de l'API backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    if (!email) {
      return setMessage({ text: "Veuillez entrer votre adresse email.", type: "error" })
    }

    if (!isValidEmail(email)) {
      return setMessage({ text: "Veuillez entrer une adresse email valide.", type: "error" })
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({
          text: data.message || "Mot de passe envoyé ! Vérifiez votre email.",
          type: "success",
        })
        setEmail("")
        // Plus de redirection automatique
      } else {
        setMessage({ text: data.message || "Échec de l'envoi du mot de passe.", type: "error" })
      }
    } catch (err) {
      console.error("Erreur réseau:", err)
      setMessage({ text: "Erreur réseau. Veuillez réessayer.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/")
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>Récupérer votre mot de passe</h1>
        <p className="instruction">Entrez votre email et nous vous enverrons votre mot de passe.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {message.text && (
            <div className={`alert-message ${message.type}`}>
              {message.text}
              {message.type === "success" && (
                <div className="spam-notice">
                  <br />
                  <small>
                    💡 <strong>Important :</strong> Si vous ne recevez pas l'email , vérifiez votre
                    dossier <strong>spam/indésirables</strong>
                  </small>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Envoi en cours...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Envoyer le mot de passe
              </>
            )}
          </button>
        </form>

        <div className="security-info">
          <FaShieldAlt className="shield-icon" />
          <span>Vos données sont protégées et sécurisées</span>
        </div>

        <button onClick={handleBackToLogin} className="back-link">
          <FaArrowLeft />
          Retour à la connexion
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword