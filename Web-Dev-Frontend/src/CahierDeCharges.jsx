"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./CahierDeCharges.css"
import * as XLSX from 'xlsx';

// URL de l'API backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const CahierDeCharges = () => {
  // États pour les filtres
  const [semestre, setSemestre] = useState("")
  const [palier, setPalier] = useState("")
  const [specialite, setSpecialite] = useState("")
  const [openDropdown, setOpenDropdown] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Données statiques pour les filtres
  const specialitesParSemestreEtPalier = {
    "1-L1": ["I", "ING", "M", "MI"],
    "1-L2": ["ACAD", "GTR", "ISIL"],
    "1-L3": ["ACAD", "GTR", "ISIL"],
    "1-M1": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
    "1-M2": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
    "2-L1": ["I", "ING", "M", "MI"],
    "2-L2": ["ACAD", "GTR", "ISIL"],
    "2-L3": ["ACAD", "GTR", "ISIL"],
    "2-M1": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
    "2-M2": ["BIOINFO", "IV", "SII", "BIGDATA", "HPC", "IL", "RSD", "SSI"],
  }
      useEffect(() => {
    document.body.style.overflow = "hidden"; // désactiver le scroll
    return () => {
      document.body.style.overflow = "auto"; // réactiver après départ
    };
  }, []);

  const semestres = ["1", "2"]
  const paliers = ["L1", "L2", "L3", "M1", "M2"]
  const specialitesDisponibles = semestre && palier ? specialitesParSemestreEtPalier[`${semestre}-${palier}`] || [] : []

  // Fonction pour basculer l'état du dropdown
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id)
  }

  // Fonction pour sélectionner une option dans un dropdown
  const selectOption = (value, type) => {
    if (type === "semestre") {
      setSemestre(value)
      setPalier("")
      setSpecialite("")
      setModules([])
    } else if (type === "palier") {
      setPalier(value)
      setSpecialite("")
      setModules([])
    } else if (type === "specialite") {
      if (value === specialite) {
        fetchModules()
      } else {
        setSpecialite(value)
      }
    }
    setOpenDropdown(null)
  }

  // Fonction pour récupérer les modules depuis l'API
  const fetchModules = async () => {
    if (!semestre || !palier || !specialite) return

    setLoading(true)
    setError(null)

    try {
      console.log(`Recherche de modules avec: Semestre=${semestre}, Palier=${palier}, Specialite=${specialite}`)

      const response = await axios.get(`${API_URL}/cahier-de-charges`, {
        params: {
          semestre,
          palier,
          specialite,
        },
      })

      if (response.data.success) {
        console.log(`Modules trouvés: ${response.data.count}`)
        setModules(response.data.data)
      } else {
        setError(response.data.message || "Erreur lors de la récupération des modules")
        setModules([])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error)
      setError(error.response?.data?.message || error.message || "Erreur lors de la récupération des modules")
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  // Effet pour charger les modules lorsque tous les filtres sont sélectionnés
  useEffect(() => {
    if (semestre && palier && specialite) {
      fetchModules()
    }
  }, [semestre, palier, specialite])

  // Configuration des dropdowns
  const dropdowns = [
    {
      id: "semestre",
      title: "Semestre",
      options: semestres.map((s) => ({ value: s, label: `S${s}` })),
      selected: semestre ? `S${semestre}` : "",
      disabled: false,
    },
    {
      id: "palier",
      title: "Palier",
      options: paliers,
      selected: palier,
      disabled: !semestre,
    },
    {
      id: "specialite",
      title: "Spécialité",
      options: specialitesDisponibles,
      selected: specialite,
      disabled: !palier,
    },
  ]

const exportToExcel = () => {
  if (modules.length === 0) return;

  // Préparer les données
  const data = modules.map((module) => ({
    "Module": module.Module,
    "Unité": module.Unité || '',
    "Type": module.TypeInfo || '',
    "Cours": module.C || '',
    "TD": module.TD || '',
    "TP": module.TP || '',
    "Crédits": module.Credits || '',
    "Coefficient": module.Coef || '',
    "Cahier des Charges": module.CahierDesCharges || ''
  }));

  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();
  
  // Convertir les données en worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajouter le worksheet au workbook
  XLSX.utils.book_append_sheet(wb, ws, "Modules");
  
  // Générer le fichier Excel
  XLSX.writeFile(wb, `Modules_S${semestre}_${palier}_${specialite}.xlsx`);
};

  return (
    <div className="cahier-de-charges-container">

      <div className="filter-card">
        <div className="filter-header">
          <h2>Filtrer les modules</h2>
        </div>
        <div className="filter-content">
          <div className="dropdowns-container">
            {dropdowns.map((dropdown) => (
              <div key={dropdown.id} className="dropdown-wrapper">
                <div className="dropdown-title">{dropdown.title}</div>
                <div
                  className={`dropdown ${openDropdown === dropdown.id ? "open" : ""} ${dropdown.disabled ? "disabled" : ""}`}
                >
                  <button
                    className={`dropdown-btn ${dropdown.selected ? "selected" : ""}`}
                    onClick={() => !dropdown.disabled && toggleDropdown(dropdown.id)}
                    disabled={dropdown.disabled}
                  >
                    <span>{dropdown.selected || `Sélectionner ${dropdown.title}`}</span>
                    {!dropdown.disabled && <span className="dropdown-arrow">▼</span>}
                  </button>
                  {openDropdown === dropdown.id && (
                    <div className="dropdown-menu">
                      {dropdown.options.map((option) => {
                        const value = typeof option === "object" ? option.value : option
                        const label = typeof option === "object" ? option.label : option
                        return (
                          <div key={value} className="dropdown-item" onClick={() => selectOption(value, dropdown.id)}>
                            {label}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Chargement des modules...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchModules}>
            Réessayer
          </button>
        </div>
      ) : modules.length > 0 ? (
        <div className="modules-card">
          <div className="modules-header">
            <h2>Modules pour {`S${semestre} / ${palier} / ${specialite}`}</h2>
            <button className="export-btn" onClick={exportToExcel}>
              Exporter
            </button>
          </div>
          <div className="table-container">
            <table className="modules-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Unité</th>
                  <th>Type</th>
                  <th>C</th>
                  <th>TD</th>
                  <th>TP</th>
                  <th>Crédits</th>
                  <th>Coef</th>
                  <th>Cahier des Charges</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module, index) => (
                  <tr key={index}>
                    <td className="module-name">{module.Module}</td>
                    <td>{module.Unité}</td>
                    <td>{module.TypeInfo}</td>
                    <td>{module.C}</td>
                    <td>{module.TD}</td>
                    <td>{module.TP}</td>
                    <td>{module.Credits}</td>
                    <td>{module.Coef}</td>
                    <td>{module.CahierDesCharges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : semestre && palier && specialite ? (
        <div className="no-data-message">
          <p>Aucun module trouvé pour cette sélection</p>
          <p className="debug-hint">
            Vérifiez que les valeurs correspondent exactement à celles de la base de données (S1 au lieu de 1, etc.)
          </p>
        </div>
      ) : (
        <div className="instructions-message">
          <p>Veuillez sélectionner un semestre, un palier et une spécialité pour afficher les modules</p>
        </div>
      )}
    </div>
  )
}

export default CahierDeCharges