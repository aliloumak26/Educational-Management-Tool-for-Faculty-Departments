"use client"
import { useState, useEffect } from "react"
import { FaSearch, FaFilter, FaPlus, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import "./Teachers.css"

const Teachers = () => {
  const API_URL = "http://localhost:5000/api/teachers"
  const ITEMS_PER_PAGE = 4
  const navigate = useNavigate()

  const [teachers, setTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [modalContent, setModalContent] = useState("info")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    department: "Tous",
    status: "Tous",
    charge: "Tous",
  })

  useEffect(() => {
    document.body.style.overflow = "hidden" // désactiver le scroll
    return () => {
      document.body.style.overflow = "auto" // réactiver après départ
    }
  }, [])

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(API_URL)
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setTeachers(data.teachers || [])
        setFilteredTeachers(data.teachers || [])
      } catch (err) {
        console.error("Erreur de chargement:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (teachers.length === 0) return

    const term = searchTerm.toLowerCase().trim()

    const filtered = teachers.filter((teacher) => {
      const name = String(teacher.name || "").toLowerCase()
      const id = String(teacher.id || "").toLowerCase()
      const email = String(teacher.email || "").toLowerCase()
      const department = String(teacher.department || "").toLowerCase()

      const matchesSearch =
        term === "" || name.includes(term) || id.includes(term) || email.includes(term) || department.includes(term)

      const matchesDepartment = filters.department === "Tous" || teacher.department === filters.department

      const matchesStatus = filters.status === "Tous" || teacher.status === filters.status

      const matchesCharge =
        filters.charge === "Tous" ||
        (filters.charge === "Complète" && teacher.charge >= 192) ||
        (filters.charge === "Incomplète" && teacher.charge < 192)

      return matchesSearch && matchesDepartment && matchesStatus && matchesCharge
    })

    setFilteredTeachers(filtered)
    setCurrentPage(1)
  }, [searchTerm, filters, teachers])

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  const handlePrevPage = () => handlePageChange(currentPage - 1)
  const handleNextPage = () => handlePageChange(currentPage + 1)

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 3

    pages.push(
      <button
        key={1}
        className={`page-number ${1 === currentPage ? "active" : ""}`}
        onClick={() => handlePageChange(1)}
      >
        1
      </button>,
    )

    if (currentPage > maxVisible + 1) {
      pages.push(
        <span key="left-ellipsis" className="ellipsis">
          ...
        </span>,
      )
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-number ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      )
    }

    if (currentPage < totalPages - maxVisible) {
      pages.push(
        <span key="right-ellipsis" className="ellipsis">
          ...
        </span>,
      )
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          className={`page-number ${totalPages === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>,
      )
    }

    return pages
  }

  // Fonction modifiée pour utiliser les routes existantes
  const showTeacherDetails = (teacher, action) => {
    // Stocker TOUTES les données de l'enseignant
    localStorage.setItem("currentProf", JSON.stringify(teacher))

    switch (action) {
      case "modules":
        navigate("/moduleEach")
        break

      case "info":
        navigate("/infosEach")
        break

      case "wishes":
  // Convertir "Nom Prénom" → "Nom, Prénom" pour correspondre à AdminFDV
  const nameWithComma = teacher.name.replace(/(\w+)\s(\w+)/, "$1, $2");
  navigate(`/admin/fdv?teacher=${encodeURIComponent(nameWithComma)}`);
  break;

      case "charge":
        // Si vous avez une page pour la charge
        navigate(`/Chargesad`)
        break

      default:
        setSelectedTeacher(teacher)
        setModalContent(action)
        setShowDetailsModal(true)
        break
    }
  }

  const renderDetailsContent = () => {
    if (!selectedTeacher) return null

    switch (modalContent) {
      case "info":
        return (
          <div className="details-section">
            <div className="details-row">
              <span className="details-label">ID:</span>
              <span className="details-value">{selectedTeacher.id}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Nom:</span>
              <span className="details-value">{selectedTeacher.name}</span>
            </div>
            {selectedTeacher.email && (
              <div className="details-row">
                <span className="details-label">Email:</span>
                <span className="details-value">{selectedTeacher.email}</span>
              </div>
            )}
            {selectedTeacher.department && (
              <div className="details-row">
                <span className="details-label">Département:</span>
                <span className="details-value">{selectedTeacher.department}</span>
              </div>
            )}
            {selectedTeacher.status && (
              <div className="details-row">
                <span className="details-label">Statut:</span>
                <span className="details-value">{selectedTeacher.status}</span>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="teachers-component">
      <div className="search-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un prof"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filtres
          </button>
        </div>
        <Link to="/add-teacher" className="add-button">
          <FaPlus /> Ajouter
        </Link>
      </div>

      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>Département:</label>
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
              <option value="Tous">Tous</option>
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              {/* Ajoutez d'autres départements selon vos besoins */}
            </select>
          </div>

          <div className="filter-group">
            <label>Statut:</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="Tous">Tous</option>
              <option value="Permanent">Permanent</option>
              <option value="Vacataire">Vacataire</option>
              {/* Ajoutez d'autres statuts selon vos besoins */}
            </select>
          </div>

          <div className="filter-group">
            <label>Charge:</label>
            <select value={filters.charge} onChange={(e) => setFilters({ ...filters, charge: e.target.value })}>
              <option value="Tous">Tous</option>
            </select>
          </div>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">Chargement en cours...</div>
        ) : error ? (
          <div className="error">Erreur: {error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Infos</th>
                <th>Modules</th>
                <th>Vœux</th>
                <th>Charge</th>
              </tr>
            </thead>
            <tbody>
              {currentTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    {searchTerm ||
                    filters.department !== "Tous" ||
                    filters.status !== "Tous" ||
                    filters.charge !== "Tous"
                      ? "Aucun résultat correspondant aux critères"
                      : "Aucun prof disponible"}
                  </td>
                </tr>
              ) : (
                currentTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td>{teacher.name}</td>
                    <td>
                      <button className="action-button" onClick={() => showTeacherDetails(teacher, "info")}>
                        Voir
                      </button>
                    </td>
                    <td>
                      <button className="action-button" onClick={() => showTeacherDetails(teacher, "modules")}>
                        Voir
                      </button>
                    </td>
                    <td>
                      <button className="action-button" onClick={() => showTeacherDetails(teacher, "wishes")}>
                        Voir
                      </button>
                    </td>
                    <td>
                      <button
                        className="action-button charge-button"
                        onClick={() => showTeacherDetails(teacher, "charge")}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
            <FaChevronLeft />
          </button>
          <div className="page-numbers">{renderPageNumbers()}</div>
          <button className="page-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <FaChevronRight />
          </button>
        </div>
      )}

      {showDetailsModal && selectedTeacher && (
        <div className="teachers-modal" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalContent === "info" && "Informations personnelles"}
                {modalContent === "wishes" && "Fiche de vœux"}
                {modalContent === "charge" && "Charge d'enseignement"}
              </h2>
              <button className="close-modal" onClick={() => setShowDetailsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">{renderDetailsContent()}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teachers
