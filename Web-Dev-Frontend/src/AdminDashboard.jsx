"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const [cardsAnimated, setCardsAnimated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setCardsAnimated(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="action-buttons">
          <button onClick={() => navigate("/teachers")}>Enseignants</button>
          <button onClick={() => navigate("/Cahierdescharges")}>Cahier des charges</button>
          <button onClick={() => navigate("/organigram")}>Organigramme</button>
        </div>

        <h2 className="stats-title">La Faculté en Chiffres</h2>

        <div className="stats-grid">
          <div className={`stat-card blue ${cardsAnimated ? "animated" : ""}`}>
            <h3>Total Des Enseignants:</h3>
            <div className="stat-inline">
              <div className="stat-value">132</div>
              <div className="stat-label">Enseignants</div>
            </div>
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
          </div>

          <div className={`stat-card orange ${cardsAnimated ? "animated" : ""}`}>
            <h3>Total De Salles:</h3>
            <div className="stat-inline">
              <div className="stat-value">201</div>
              <div className="stat-label">Salles</div>
            </div>
            <div className="stat-icon">
              <i className="fas fa-door-open"></i>
            </div>
          </div>

          <div className={`stat-card green ${cardsAnimated ? "animated" : ""}`}>
            <h3>Total Des Amphis:</h3>
            <div className="stat-inline">
              <div className="stat-value">26</div>
              <div className="stat-label">Amphis</div>
            </div>
            <div className="stat-icon">
              <i className="fas fa-university"></i>
            </div>
          </div>

          <div className={`stat-card purple ${cardsAnimated ? "animated" : ""}`}>
            <h3>Total De Sections:</h3>
            <div className="stat-inline">
              <div className="stat-value">43</div>
              <div className="stat-label">Sections</div>
            </div>
            <div className="stat-icon">
              <i className="fas fa-table"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
