"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./infosEach.css"

const InfosEach = ({user}) => {
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
    useEffect(() => {
    document.body.style.overflow = "hidden"; // désactiver le scroll
    return () => {
      document.body.style.overflow = "auto"; // réactiver après départ
    };
  }, []);
  useEffect(() => {
    try {
      const storedTeacher = JSON.parse(localStorage.getItem("currentProf"))
      if (storedTeacher) {
        setTeacher(storedTeacher)
      } else {
        setError("Aucune information d'enseignant trouvée")
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err)
      setError("Erreur lors de la récupération des données")
    } finally {
      setLoading(false)
    }
  }, [])

  const goBack = () => {
    navigate(-1)
  }
  const translateStatus = (status) => {
  if (!status) return "/";
  const statusMap = {
    'Actif': 'Actif',
    'Congé': 'Congé',
    'Congé maladie': 'Congé maladie',
    'Inactif': 'Inactif'
  };
  return statusMap[status] || status;
};

  const goToEditPage = () => {
    navigate("/ModifyEach", {
      state: {
        teacher: {
          id: teacher.id,
          name: teacher.name,
          lastName: teacher.lastName,
          firstName: teacher.firstName, 
          gender: teacher.gender,
          phone: teacher.phone,
          email: teacher.email,
          grade: teacher.grade,
          statut: teacher.statut
        }
      }
    })
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
  // Fonction pour gérer les valeurs manquantes
  const displayValue = (value) => {
    return value ? value : "/"
  }

  if (loading) {
    return (
      <div className="ie-loadingContainer">
        <div className="ie-loader"></div>
        <p>Chargement des données...</p>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="ie-errorContainer">
        <h3>❌ Erreur de connexion</h3>
        <p>{error}</p>
        <button onClick={goBack}>Retour</button>
      </div>
    )
  }

  const initials = teacher.name
    ? teacher.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "//"

  return (
    <div className="ie-personalInfoContainer">
      <div className="ie-topBar">
        <div className="ie-nameTag">
          <div className="ie-circle">{initials}</div>
          <div>
            <span>{displayValue(teacher.name)}</span>
          </div>
        </div>
        <button className="ie-modifyButton" onClick={goToEditPage}>
          ✏️ Modifier
        </button>
      </div>
      <div className="ie-infoCard">
        <h2>Informations de l'enseignant</h2>
        <div className="ie-infoGrid">
          <div className="ie-infoColumn">
            <div className="ie-infoRow">
              <span className="ie-label">ID:</span>
              <span className="ie-value">{displayValue(teacher.id)}</span>
            </div>
            <div className="ie-infoRow">
              <span className="ie-label">NOM:</span>
              <span className="ie-value">{displayValue(teacher.lastName)}</span>
            </div>
            <div className="ie-infoRow">
              <span className="ie-label">Prénom:</span>
              <span className="ie-value">{displayValue(teacher.firstName)}</span>
            </div>
            <div className="ie-infoRow">
              <span className="ie-label">Sexe:</span>
<span className="ie-value">{translateGender(teacher.gender)}</span>            </div>
          </div>
          <div className="ie-infoColumn">
            <div className="ie-infoRow">
              <span className="ie-label">Téléphone:</span>
              <span className="ie-value">{displayValue(teacher.phone)}</span>
            </div>
            <div className="ie-infoRow">
              <span className="ie-label">Email:</span>
              <span className="ie-value">{displayValue(teacher.email)}</span>
            </div>
            <div className="ie-infoRow">
  <span className="ie-label">Statut:</span>
  <span className="ie-value">
    {translateStatus(teacher.statut)}
  </span>
</div>
            <div className="ie-infoRow">
              <span className="ie-label">Grade:</span>
              <span className="ie-value">{displayValue(teacher.grade)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfosEach