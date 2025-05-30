"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./TeacherDashboard.css"

const TeacherDashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Animation des cartes au chargement
    const cards = document.querySelectorAll(".stat-card")
    cards.forEach((card, i) => {
      card.style.opacity = "0"
      card.style.transform = "translateY(20px)"
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      setTimeout(
        () => {
          card.style.opacity = "1"
          card.style.transform = "translateY(0)"
        },
        150 * i + 100,
      )
    })
  }, [])

  const handleCardClick = (section) => {
    switch (section) {
      case "Mes informations personnelles":
        navigate("/PersonalInfoCard")
        break
      case "Ma charge et modules":
        navigate("/Charges")
        break
      case "Ma fiche de vœux":
        navigate("/teacher/fdv")
        break
      case "Organigramme":
        navigate("/organigram")
        break
      default:
        console.log(`No navigation defined for ${section}`)
    }
  }

  return (
    <div className="teacher-dashboard-container">
      <div className="card-box">
        <div className="stats-grid">
          <button className="stat-card blue" onClick={() => handleCardClick("Mes informations personnelles")}>
            <div className="stat-title">Mes informations personnelles</div>
            <div className="stat-bg">
              <i className="fa-solid fa-user fa-4x"></i>
            </div>
          </button>

          <button className="stat-card orange" onClick={() => handleCardClick("Ma charge et modules")}>
            <div className="stat-title">Ma charge et modules</div>
            <div className="stat-bg">
              <i className="fa-solid fa-square-poll-vertical fa-4x"></i>
            </div>
          </button>

          <button className="stat-card green" onClick={() => handleCardClick("Ma fiche de vœux")}>
            <div className="stat-title">Ma fiche de vœux</div>
            <div className="stat-bg">
              <i className="fa-solid fa-file fa-4x"></i>
            </div>
          </button>

          <button className="stat-card purple" onClick={() => handleCardClick("Organigramme")}>
            <div className="stat-title">Organigramme</div>
            <div className="stat-bg">
              <i className="fas fa-table fa-3x"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
