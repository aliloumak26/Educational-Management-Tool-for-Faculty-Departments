"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./Sidebar.module.css"

// Import des images
import userImg from "./user.png"
import logoImg from "./logo2.png"
import teacherImg from "./teacher.png"
import sectionImg from "./section.png"
import diagramImg from "./diagram.png"
import settingsImg from "./settings.png"
import helpImg from "./help.png"
import logoutImg from "./logout.png"
import ficheImg from "./fiche.png"
import chargeImg from "./Charge.png"

const Sidebar = ({ user, setIsLoggedIn, setUser }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(false)
  const [activeLink, setActiveLink] = useState("Dashboard")
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [showHelpPanel, setShowHelpPanel] = useState(false);


  useEffect(() => {
    const body = document.body
    const header = document.getElementById("header")

    if (isNavbarVisible) {
      body.classList.add(styles.sidebarBodyPd)
      if (header) header.classList.add(styles.sidebarBodyPd)
    } else {
      body.classList.remove(styles.sidebarBodyPd)
      if (header) header.classList.remove(styles.sidebarBodyPd)
    }
  }, [isNavbarVisible])

  useEffect(() => {
    const pathToName = {
      "/admin/dashboard": "Dashboard",
      "/teacher/dashboard": "Dashboard",
      "/teachers": "Enseignants",
      "/teacher/fdv": "Fiches de voeux",
      "/admin/fdv": "Fiches de voeux",
      "/Cahierdescharges": "Cahier des charges",
      "/organigram": "Organigramme",
      "/infosEach": "Enseignants",
      "/Charges": "Charge",
      "/PersonalInfoCard": "Infos",
      "/ModifyEach": "Enseignants",
      "/moduleEach": "Enseignants",
      "/Chargesad": "Enseignants",
      "/modules": "Infos",
      "/Modify": "Infos",
      "/add-teacher": "Enseignants",
    }

    setActiveLink(pathToName[location.pathname] || "Dashboard")
  }, [location.pathname])

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible)
  }

  const handleLinkClick = (name, path) => {
    setActiveLink(name)
    navigate(path)
  }

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen)
  }

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.clear()
    setIsLoggedIn(false)
    setUser(null)
    navigate("/", { replace: true })
  }

  const getDashboardPath = () => {
    return user?.role === "admin" ? "/admin/dashboard" : "/teacher/dashboard"
  }

  return (
    
    <div 
  className={`${styles.sidebar} ${showHelpPanel ? styles.sidebarWithHelpPanel : ''}`}
  style={{ zIndex: showHelpPanel ? 1002 : 'auto' }}
>
      <header className={styles.sidebarHeader} id="header">
        <div className={styles.sidebarHeader__toggle} onClick={toggleNavbar}>
          <i className={`bx ${isNavbarVisible ? "bx-x" : "bx-menu"}`} id="header-toggle"></i>
        </div>
        <div className={styles.sidebarHeader__titleContainer}>
          <h2 className={styles.sidebarHeaderTitle} id="page-header">
            {activeLink}
          </h2>
        </div>

        <div className={styles.sidebarUserAvatar} onClick={toggleSubMenu}>
          <img src={userImg || "/placeholder.svg"} alt="User" />
          {user?.lastName} {user?.firstName}
        </div>
        <div
          className={`${styles.sidebarSubMenuWrap} ${isSubMenuOpen ? styles.sidebarSubMenuWrapOpen : ""}`}
          id="subMenu"
        >
          <div className={styles.sidebarSubMenu}>
            <div className={styles.sidebarUserInfo}>
              <img src={userImg || "/placeholder.svg"} alt="User" />
              <h2>
                {user?.lastName} {user?.firstName}
              </h2>
            </div>
            <hr />

            <a href="/PersonalInfoCard" className={styles.sidebarSubMenuLink}>
  <img src={settingsImg || "/placeholder.svg"} alt="Settings" />
  <p>Infos personnelles</p>
  <span>&gt;</span>
</a>
            <a href="#" className={styles.sidebarSubMenuLink} onClick={(e) => {
  e.preventDefault();
  setShowHelpPanel(!showHelpPanel);
}}>
  <img src={helpImg || "/placeholder.svg"} alt="Help" />
  <p>Assistance</p>
  <span>&gt;</span>
</a>


{showHelpPanel && (
  <div className={styles.helpPanelOverlay}>
    <div className={styles.helpPanel}>
      <div className={styles.helpPanelHeader}>
        <h3>Assistance Technique</h3>
        <button 
          className={styles.helpPanelClose}
          onClick={() => setShowHelpPanel(false)}
          aria-label="Fermer"
        >
          &times;
        </button>
      </div>
      <div className={styles.helpPanelContent}>
        
        <p className={styles.helpPanelText}>Pour toute assistance, veuillez contacter :</p>
        <div className={styles.contactItems}>
          <div className={styles.contactItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M22 6l-10 7L2 6"/>
            </svg>
            <a >organigramme.info@gmail.com</a>
          </div>
          <div className={styles.contactItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M22 6l-10 7L2 6"/>
            </svg>
            <a>fInfo.USTHB@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
            <a href="#" className={styles.sidebarSubMenuLink} onClick={handleLogout}>
              <img src={logoutImg || "/placeholder.svg"} alt="Logout" />
              <p>Se déconnecter</p>
              <span>&gt;</span>
            </a>
          </div>
        </div>
      </header>

      <div className={`${styles.sidebarNav} ${isNavbarVisible ? styles.sidebarShow : ""}`} id="nav-bar">
        <div className={styles.sidebarNavContainer}>
          <div>
            <a href="#" className={styles.sidebarNav__logo}>
              <img src={logoImg || "/placeholder.svg"} className={styles.sidebarNav__logoImg} alt="Logo" />
            </a>

            <div className={styles.sidebarNav__list}>
              <a
                href="#"
                className={`${styles.sidebarNav__link} ${activeLink === "Dashboard" ? styles.sidebarActive : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  handleLinkClick("Dashboard", getDashboardPath())
                }}
              >
                <i className="bx bx-grid-alt nav__icon"></i>
                <span className={styles.sidebarNav__name}>Dashboard</span>
              </a>

              {user?.role === "admin" && (
                <>
                  <a
                    href="#"
                    className={`${styles.sidebarNav__link} ${activeLink === "Enseignants" ? styles.sidebarActive : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick("Enseignants", "/teachers")
                    }}
                  >
                    <img src={teacherImg || "/placeholder.svg"} className={styles.sidebarNav__icon} alt="Enseignants" />
                    <span className={styles.sidebarNav__name}>Enseignants</span>
                  </a>

                  <a
                    href="#"
                    className={`${styles.sidebarNav__link} ${activeLink === "Fiches de voeux" ? styles.sidebarActive : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick("Fiches de voeux", "/admin/fdv")
                    }}
                  >
                    <img src={sectionImg || "/placeholder.svg"} className={styles.sidebarNav__icon} alt="Fiches" />
                    <span className={styles.sidebarNav__name}>Fiche de voeux</span>
                  </a>

                  <a
                    href="#"
                    className={`${styles.sidebarNav__link} ${activeLink === "Cahier des charges" ? styles.sidebarActive : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick("Cahier des charges", "/Cahierdescharges")
                    }}
                  >
                    <img
                      src={ficheImg || "/placeholder.svg"}
                      className={styles.sidebarNav__icon}
                      alt="Cahier des charges"
                    />
                    <span className={styles.sidebarNav__name}>Cahier des charges</span>
                  </a>
                </>
              )}

              {user?.role === "teacher" && (
                <>
                  <a
                    href="#"
                    className={`${styles.sidebarNav__link} ${activeLink === "Infos" ? styles.sidebarActive : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick("Infos", "/PersonalInfoCard")
                    }}
                  >
                    <img src={teacherImg || "/placeholder.svg"} className={styles.sidebarNav__icon} alt="Infos" />
                    <span className={styles.sidebarNav__name}>Infos</span>
                  </a>

                  <a
                    href="#"
                    className={`${styles.sidebarNav__link} ${activeLink === "Fiches de voeux" ? styles.sidebarActive : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick("Fiches de voeux", "/teacher/fdv")
                    }}
                  >
                    <img src={sectionImg || "/placeholder.svg"} className={styles.sidebarNav__icon} alt="Fiches" />
                    <span className={styles.sidebarNav__name}>Fiches de voeux</span>
                  </a>

                  <a
                    href="#"
                    className={`${styles.sidebarNav__link} ${activeLink === "Charge" ? styles.sidebarActive : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick("Charge", "/Charges")
                    }}
                  >
                    <img src={chargeImg || "/placeholder.svg"} className={styles.sidebarNav__icon} alt="Enseignants" />
                    <span className={styles.sidebarNav__name}>Charge</span>
                  </a>
                </>
              )}

              <a
                href="#"
                className={`${styles.sidebarNav__link} ${activeLink === "Organigramme" ? styles.sidebarActive : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  handleLinkClick("Organigramme", "/organigram")
                }}
              >
                <img src={diagramImg || "/placeholder.svg"} className={styles.sidebarNav__icon} alt="Organigramme" />
                <span className={styles.sidebarNav__name}>Organigramme</span>
              </a>
            </div>
          </div>
          <div className={styles.sidebarLogout}>
            <button className={styles.sidebarBtn} onClick={handleLogout}>
              <div className={styles.sidebarSign}>
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>
              <div className={styles.sidebarText}>Se déconnecter</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar