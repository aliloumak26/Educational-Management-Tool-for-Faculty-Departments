"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./moduleEach.css"

const ModuleEach = () => {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [moduleNameInput, setModuleNameInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prof, setProf] = useState(null)

  useEffect(() => {
    const loadProfData = () => {
      const profData = localStorage.getItem("currentProf")
      if (!profData) {
        navigate("/teachers")
        return
      }

      const parsedProf = JSON.parse(profData)
      setProf(parsedProf)
      fetchModules(parsedProf.id)
    }

    loadProfData()
  }, [])

  // Effet pour gérer la classe modal-open sur le body
  useEffect(() => {
    if (showAddModal || showDeleteModal) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    // Cleanup function pour retirer la classe quand le composant se démonte
    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [showAddModal, showDeleteModal])

  const fetchModules = async (profId) => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/profs/${profId}/modules`)
      setModules(response.data.modules || [])
    } catch (err) {
      console.error("Erreur:", err)
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateModules = async (newModules) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/profs/${prof.id}/modules`, {
        modules: newModules,
      })
      return response.data.success
    } catch (err) {
      console.error("Erreur:", err)
      alert(`Erreur: ${err.response?.data?.error || err.message}`)
      return false
    }
  }

  const handleAddModule = async () => {
    const trimmedName = moduleNameInput.trim()

    if (!trimmedName) {
      alert("Le nom du module ne peut pas être vide !")
      return
    }

    if (modules.includes(trimmedName)) {
      alert("Ce module existe déjà !")
      return
    }

    const newModules = [...modules, trimmedName]
    const success = await updateModules(newModules)

    if (success) {
      setModules(newModules)
      setShowAddModal(false)
      setModuleNameInput("")
      setSelectedModuleIndex(newModules.length - 1)
    }
  }

  const handleDeleteModule = async () => {
    if (selectedModuleIndex === null) return

    const newModules = modules.filter((_, index) => index !== selectedModuleIndex)
    const success = await updateModules(newModules)

    if (success) {
      setModules(newModules)
      setSelectedModuleIndex(null)
      setShowDeleteModal(false)
    }
  }

  const handleBackToList = () => {
    navigate("/teachers")
  }

  // Fonction pour fermer les modals avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (showAddModal) {
          setShowAddModal(false)
        }
        if (showDeleteModal) {
          setShowDeleteModal(false)
        }
      }
    }

    if (showAddModal || showDeleteModal) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showAddModal, showDeleteModal])

  if (loading) return <div className="loading">Chargement en cours...</div>

  if (error) {
    return (
      <div className="error-container">
        <div className="error">Erreur: {error}</div>
        <button className="action-btn" onClick={handleBackToList}>
          Retour à la liste
        </button>
      </div>
    )
  }

  return (
    <div className="module-each-container">
      <div className="module-header">
        <h2>Modules enseignés par {prof?.name}</h2>
        <div className="prof-info">
          <span>ID: {prof?.id}</span>
        </div>
        <button className="back-button" onClick={handleBackToList}>
          Retour à la liste
        </button>
      </div>

      <div className="module-content">
        {modules.length === 0 ? (
          <div className="empty-state">
            <p>Aucun module n'est attribué à ce prof</p>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              Ajouter un module
            </button>
          </div>
        ) : (
          <>
            <div className="module-list">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className={`module-item ${selectedModuleIndex === index ? "selected" : ""}`}
                  onClick={() => setSelectedModuleIndex(index)}
                >
                  {module}
                </div>
              ))}
            </div>

            <div className="module-actions">
              <button className="action-btn add-btn" onClick={() => setShowAddModal(true)}>
                Ajouter un module
              </button>
              <button
                className={`action-btn delete-btn ${selectedModuleIndex === null ? "disabled" : ""}`}
                onClick={() => setShowDeleteModal(true)}
                disabled={selectedModuleIndex === null}
              >
                Supprimer le module sélectionné
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false)
            }
          }}
        >
          <div className="modal">
            <h3>Nouveau module</h3>
            <input
              type="text"
              value={moduleNameInput}
              onChange={(e) => setModuleNameInput(e.target.value)}
              placeholder="Nom du module"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddModule()
                }
              }}
            />
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Annuler
              </button>
              <button className="confirm-btn" onClick={handleAddModule}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false)
            }
          }}
        >
          <div className="modal">
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer le module "{modules[selectedModuleIndex]}" ?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="delete-btn" onClick={handleDeleteModule}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuleEach
