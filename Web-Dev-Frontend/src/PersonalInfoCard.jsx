"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./PersonalInfoCard.css"

const PersonalInfoCard = ({ user, handleLogout }) => {
  const navigate = useNavigate()
  
  // Fonction pour gérer les valeurs manquantes
  const displayValue = (value) => {
    return value ? value : "/"
  }
  useEffect(() => {
      document.body.style.overflow = "hidden"; // désactiver le scroll
      return () => {
        document.body.style.overflow = "auto"; // réactiver après départ
      };
    }, []);

  // Affiche un loader pendant le chargement
  if (user === null) {
    return (
      <div className="pic-loadingContainer">
        <div className="pic-loader"></div>
        <p>Chargement des données...</p>
      </div>
    )
  }
    const translateGender = (gender) => {
  if (!gender) return "/";
  
  switch(gender.toLowerCase()) {
    case 'man':
      return 'Homme';
    case 'woman':
      return 'Femme';
    default:
      return gender; // Retourne la valeur originale si non reconnue
  }
}
  // Si user est undefined (problème de connexion)
  if (!user) {
    return (
      <div className="pic-errorContainer">
        <h3>❌ Erreur de connexion</h3>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    )
  }

  // Génération des initiales avec gestion des valeurs manquantes
  const initials = `${user.lastName ? user.lastName.charAt(0) : ""}${
    user.firstName ? user.firstName.charAt(0) : ""
  }`.toUpperCase() || "//"

  const goToEditPage = () => {
    console.log("Navigation vers Modify avec user:", user)
    navigate("/Modify", {
      state: {
        user: {
          ...user,
          phone: user.phone || "",
          email: user.email || "",
          statut: user.statut || "",
        },
      },
    })
  }
  
  return (
    <div className="pic-personalInfoPage">
      <div className="pic-topBar">
        <div className="pic-nameTag">
          <div className="pic-circle">{initials}</div>
          <div>
            <span>{displayValue(user.lastName)}</span>{" "}
            <span>{displayValue(user.firstName)}</span>
          </div>
        </div>
        <div className="pic-buttonGroup">
          <div className="pic-modulesButtonContainer">
            <button className="pic-modulesButton" onClick={() => navigate("/modules")}>
              Modules
            </button>
          </div>
          <button className="pic-modifyButton" onClick={goToEditPage}>
            ✏️ Modifier
          </button>
        </div>
      </div>

      <div className="pic-infoCard">
        <h2>Informations Personnelles</h2>
        <div className="pic-infoGrid">
          <div className="pic-infoColumn">
            <div className="pic-infoRow">
              <span className="pic-label">Prénom:</span>
              <span className="pic-value">{displayValue(user.firstName)}</span>
            </div>
            <div className="pic-infoRow">
              <span className="pic-label">Nom:</span>
              <span className="pic-value">{displayValue(user.lastName)}</span>
            </div>
            <div className="pic-infoRow">
              <span className="pic-label">Sexe:</span>
              <span className="pic-value">{translateGender(user.gender)}</span>
            </div>
            <div className="pic-infoRow">
              <span className="pic-label">Téléphone:</span>
              <span className="pic-value">{displayValue(user.phone)}</span>
            </div>
          </div>
          <div className="pic-infoColumn">
            <div className="pic-infoRow">
              <span className="pic-label">Grade:</span>
              <span className="pic-value">{displayValue(user.grade)}</span>
            </div>
            <div className="pic-infoRow">
              <span className="pic-label">ID:</span>
              <span className="pic-value">{displayValue(user.id)}</span>
            </div>
            <div className="pic-infoRow">
              <span className="pic-label">Statut:</span>
              <span className="pic-value">{displayValue(user.statut)}</span>
            </div>
            <div className="pic-infoRow">
              <span className="pic-label">Email:</span>
              <span className="pic-value">{displayValue(user.email)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoCard