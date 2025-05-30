"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./ModuleManager.css"

const ModuleManager = ({ user, handleLogout }) => {
  // États
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teacherInfo, setTeacherInfo] = useState(null)

  // Debug
  console.log("ModuleManager - User reçu:", user)

    useEffect(() => {
    document.body.style.overflow = "hidden"; // désactiver le scroll
    return () => {
      document.body.style.overflow = "auto"; // réactiver après départ
    };
  }, []);
  // Récupérer l'utilisateur du localStorage si non fourni en props
  useEffect(() => {
    if (!user) {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("Utilisateur récupéré du localStorage:", parsedUser)
          // Mettre à jour l'état local avec l'utilisateur du localStorage
          setTeacherInfo({
            name:
              parsedUser.enseignant ||
              `${parsedUser.firstName || parsedUser.prenom || ""} ${parsedUser.lastName || parsedUser.nom || ""}`,
            role: parsedUser.role || "enseignant",
            id: parsedUser.id,
          })

          // Charger les modules pour cet utilisateur
          if (parsedUser.id) {
            fetchModules(parsedUser.id)
          } else {
            setError("ID utilisateur manquant dans localStorage")
            setLoading(false)
          }
        } else {
          setError("Utilisateur non trouvé. Veuillez vous reconnecter.")
          setLoading(false)
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err)
        setError("Erreur lors de la récupération des données utilisateur")
        setLoading(false)
      }
    } else if (user.id) {
      // Si l'utilisateur est fourni en props et a un ID, charger ses modules
      fetchModules(user.id)
    } else {
      setError("ID utilisateur manquant dans les props")
      setLoading(false)
    }
  }, [user])

  // Fonction pour charger les modules
  const fetchModules = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/module/${userId}`)
      console.log("Réponse API:", response.data)

      if (response.data?.modules) {
        setModules(response.data.modules)
        setTeacherInfo((prev) => ({
          ...prev,
          name: response.data.teacherName,
          role: response.data.role || user?.role || "enseignant",
        }))
      } else {
        setModules([])
        console.warn("Aucun module trouvé ou format inattendu")
      }
    } catch (err) {
      console.error("Erreur API:", err)
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
  const redirectToLogin = () => {
    window.location.href = "/"
  }

  if (loading) return <div className="loading">Chargement en cours...</div>

  if (error) {
    return (
      <div className="error-container3">
        <div className="error3">Erreur: {error}</div>
        <button className="action-btn add-btn3" style={{ marginTop: "20px", width: "auto" }} onClick={redirectToLogin}>
          Retour à la page de connexion
        </button>
      </div>
    )
  }

  return (
    <div className="module-manager3">
      <div className="module-heade3">
        <h2>Liste des Modules</h2>
        
        
      </div>

      <div className="module-content3">
        <div className="module-list-container3">
          {modules.length === 0 ? (
            <div className="empty-state3">
              <p>Aucun module n'est disponible pour cet enseignant.</p>
            </div>
          ) : (
            <div className="specialite-group3">
              <h3 className="specialite-title3">Mes modules</h3>
              <div className="modules-list3">
                {modules.map((module, index) => (
                  <div key={index} className="module-item3">
                    <span className="module-text3">{module}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="module-actions3">
        </div>
      </div>
    </div>
  )
}

export default ModuleManager