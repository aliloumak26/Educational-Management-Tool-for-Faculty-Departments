"use client"

import { useState, useEffect } from "react"
import "./Organigram.css"

const Organigram = () => {
  const [semestre, setSemestre] = useState("")
  const [palier, setPalier] = useState("")
  const [specialite, setSpecialite] = useState("")
  const [modules, setModules] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedModules, setExpandedModules] = useState({})
  const [teachersLoading, setTeachersLoading] = useState({})
  const [selectedTeachers, setSelectedTeachers] = useState({})
  const [sections, setSections] = useState([{ id: 1, modules: [] }])
  const [teacherCharges, setTeacherCharges] = useState({})
  const [teacherIds, setTeacherIds] = useState({})
  // Pour suivre les affectations actuelles et éviter les doublons
  const [currentAssignments, setCurrentAssignments] = useState({})
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [saveStatus, setSaveStatus] = useState(null) // 'success', 'error', ou null
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState({ value: null, type: null })
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [lastSavedState, setLastSavedState] = useState(null)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [teachersWithHsup, setTeachersWithHsup] = useState({})
  // Ajouter un état pour contrôler l'affichage de la modal
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const isSelectionComplete = Boolean(semestre && palier && specialite)

  const isSectionCompleteCheck = (section) => {
    // Vérifier chaque module de la section
    return section.modules.every((module) => {
      // Vérifier le cours
      const hasCours =
        selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-cours-section${section.id}`]

      // Vérifier les TDs (seulement si le module a des TDs)
      const needsTD = Number(module.TD) > 0
      const hasTDs =
        !needsTD ||
        [1, 2, 3, 4].every(
          (num) =>
            selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-td${num}-section${section.id}`],
        )

      // Vérifier les TPs (seulement si le module a des TPs)
      const needsTP = Number(module.TP) > 0
      const hasTPs =
        !needsTP ||
        [1, 2, 3, 4].every(
          (num) =>
            selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-tp${num}-section${section.id}`],
        )

      return hasCours && hasTDs && hasTPs
    })
  }

  const publishOrganigram = async (versionTitle) => {
    if (!isSelectionComplete || loading) return

    try {
      setLoading(true)
      setSaveStatus("saving")
      setShowSaveNotification(true)

      const response = await fetch("http://localhost:5000/api/organigram/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semestre,
          palier,
          specialite,
          versionTitle: versionTitle.trim(),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur lors de la publication: ${errorText}`)
      }

      await response.json()

      setSaveStatus("success")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Erreur:", error)
      setSaveStatus("error")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  // Ajoutez cette fonction pour gérer le clic sur le bouton Publier
  const handlePublishClick = () => {
    setShowTitleModal(true)
  }

  // Ajoutez cette fonction pour gérer la sauvegarde du titre
  const handleTitleSave = (title) => {
    setShowTitleModal(false)
    if (title) {
      publishOrganigram(title)
    }
  }

  // Fonction pour exporter vers Excel
  // Fonction pour exporter vers Excel
  const exportallToExcel = async () => {
    try {
      setLoading(true)

      const response = await fetch("http://localhost:5000/api/organigram/export-tous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semestre,
          palier,
          specialite,
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Organigramme_ALL.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSaveStatus("success")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      setSaveStatus("error")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }
  // Modifier la fonction resetAllData
  const resetAllData = async () => {
    setShowResetConfirm(true)
  }

  const handleConfirmReset = async () => {
    setShowResetConfirm(false)

    try {
      setLoading(true)
      setSaveStatus("saving")
      setShowSaveNotification(true)

      const response = await fetch("http://localhost:5000/api/organigram/reset-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur lors de la réinitialisation: ${errorText}`)
      }

      const result = await response.json()

      // Réinitialiser les états locaux
      setSelectedTeachers({})
      setCurrentAssignments({})
      setTeacherCharges({})
      setSections([{ id: 1, modules: [] }])
      setModules([])

      // Recharger les charges globales
      if (semestre) {
        await fetchGlobalCharges()
      }

      setSaveStatus("success")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)

      console.log("Réinitialisation réussie:", result)
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error)
      setSaveStatus("error")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReset = () => {
    setShowResetConfirm(false)
  }
  const exportToExcel = async () => {
    try {
      setLoading(true)

      const response = await fetch("http://localhost:5000/api/organigram/export-exact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semestre,
          palier,
          specialite,
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Organigramme_S${semestre}_${palier}_${specialite}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSaveStatus("success")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      setSaveStatus("error")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour importer depuis Excel
  const importFromExcel = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:5000/api/organigram/import-exact", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(await response.text())

      const data = await response.json()

      if (data.success) {
        // 1. Réinitialiser les états locaux
        setSelectedTeachers({})
        setCurrentAssignments({})
        setTeacherCharges({})

        // 2. Recharger les données
        await fetchModules()
        await loadOrganigram()

        // 3. Forcer le recalcul des charges globales
        await fetchGlobalCharges()

        setSaveStatus("success")
        setShowSaveNotification(true)
        setTimeout(() => {
          setShowSaveNotification(false)
          setSaveStatus(null)
        }, 3000)
      }
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      setSaveStatus("error")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  // Charger les charges des enseignants
  const fetchTeacherCharges = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/organigram/teacher-charges?semestre=S${semestre}`)
      const data = await response.json()
      const chargesMap = {}
      const teacherIdsMap = {}

      data.forEach((teacher) => {
        const fullName = `${teacher.lastName}, ${teacher.firstName}`
        chargesMap[fullName] = teacher.charge || 0
        teacherIdsMap[fullName] = teacher.id
      })

      console.log("Charges chargées:", chargesMap)
      console.log("IDs des enseignants:", teacherIdsMap)
      setTeacherCharges(chargesMap)
      setTeacherIds(teacherIdsMap)
    } catch (err) {
      console.error("Erreur de chargement des charges:", err)
    }
  }

  // Fonction pour récupérer les charges globales des enseignants
  const fetchGlobalCharges = async () => {
    if (!semestre) return

    try {
      const response = await fetch(`http://localhost:5000/api/organigram/global-charges?semestre=S${semestre}`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()
      console.log("Charges globales récupérées:", data)

      // Mettre à jour les charges des enseignants
      const chargesMap = {}
      data.forEach((teacher) => {
        const fullName = `${teacher.lastName}, ${teacher.firstName}`
        chargesMap[fullName] = teacher.charge || 0
      })

      setTeacherCharges(chargesMap)
    } catch (err) {
      console.error("Erreur lors de la récupération des charges globales:", err)
    }
  }

  useEffect(() => {
    if (semestre) {
      fetchGlobalCharges()
      // Réinitialiser les affectations actuelles lors du changement de semestre
      setCurrentAssignments({})
    }
  }, [semestre])

  useEffect(() => {
    if (semestre) {
      fetchGlobalCharges()
    }
  }, [palier, specialite])

  // Modifier la fonction removeSection pour ne permettre que la suppression de la dernière section
  // Modifier la fonction removeSection dans Organigram.jsx
  const removeSection = async (sectionId) => {
    if (sections.length <= 1) {
      alert("Vous ne pouvez pas supprimer la dernière section")
      return
    }

    // Vérifier si c'est bien la dernière section
    const lastSection = Math.max(...sections.map((section) => section.id))
    if (sectionId !== lastSection || sections.length <= 1) {
      alert("Vous ne pouvez supprimer que la dernière section")
      return
    }

    try {
      // 1. Calculer les charges UNIQUEMENT pour la section à supprimer
      const sectionToRemove = sections.find((s) => s.id === sectionId)
      const chargesToSubtract = {}

      sectionToRemove.modules.forEach((module) => {
        // Fonction pour ajouter une charge
        const addCharge = (teacherKey) => {
          const teacher = selectedTeachers[teacherKey]
          if (teacher) {
            if (teacherKey.includes("-cours-")) {
              chargesToSubtract[teacher] = (chargesToSubtract[teacher] || 0) + Number(module.C || 0) * 3
            } else if (teacherKey.includes("-td")) {
              chargesToSubtract[teacher] = (chargesToSubtract[teacher] || 0) + Number(module.TD || 0)
            } else if (teacherKey.includes("-tp")) {
              chargesToSubtract[teacher] = (chargesToSubtract[teacher] || 0) + Number(module.TP || 0) * 1.5
            }
          }
        }

        // Cours
        addCharge(`${semestre}-${palier}-${specialite}-${module.Module}-cours-section${sectionId}`)

        // TDs et TPs
        for (let i = 1; i <= 4; i++) {
          addCharge(`${semestre}-${palier}-${specialite}-${module.Module}-td${i}-section${sectionId}`)
          addCharge(`${semestre}-${palier}-${specialite}-${module.Module}-tp${i}-section${sectionId}`)
        }
      })

      // 2. Mettre à jour les charges LOCALES avant suppression
      setTeacherCharges((prev) => {
        const newCharges = { ...prev }
        Object.keys(chargesToSubtract).forEach((teacher) => {
          newCharges[teacher] = Math.max(0, (newCharges[teacher] || 0) - chargesToSubtract[teacher])
        })
        return newCharges
      })

      // 3. Supprimer la section localement
      setSections((prev) => prev.filter((section) => section.id !== sectionId))

      // 4. Nettoyer les sélections
      setSelectedTeachers((prev) => {
        const newTeachers = { ...prev }
        Object.keys(newTeachers).forEach((key) => {
          if (key.includes(`-section${sectionId}`)) delete newTeachers[key]
        })
        return newTeachers
      })

      setCurrentAssignments((prev) => {
        const newAssignments = { ...prev }
        Object.keys(newAssignments).forEach((key) => {
          if (key.includes(`-section${sectionId}`)) delete newAssignments[key]
        })
        return newAssignments
      })

      // 5. Envoyer la suppression au backend (optionnel si non sauvegardé)
      if (hasUnsavedChanges) {
        // Si non sauvegardé, on ne contacte pas le backend
        console.log("Modifications locales seulement (non sauvegardées)")
      } else {
        const response = await fetch("http://localhost:5000/api/organigram/remove-section", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            semestre,
            palier,
            specialite,
            sectionId,
            chargesToSubtract,
          }),
        })
        if (!response.ok) throw new Error("Erreur backend")
      }

      setHasUnsavedChanges(true)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Échec de la suppression: " + error.message)
      // Recharger les données pour éviter les incohérences
      fetchGlobalCharges()
      loadOrganigram()
    }
  }

  useEffect(() => {
    if (modules.length > 0) {
      setSections((prevSections) => {
        if (prevSections.length === 0) {
          return [{ id: 1, modules: JSON.parse(JSON.stringify(modules)) }]
        }
        return prevSections.map((section, index) =>
          index === 0 ? { ...section, modules: JSON.parse(JSON.stringify(modules)) } : section,
        )
      })
    }
  }, [modules])

  const addNewSection = () => {
    if (modules.length === 0) return

    const newModules = JSON.parse(JSON.stringify(modules)).map((module) => ({
      ...module,
      enseignants_cours: module.enseignants_cours,
      enseignants_td: module.enseignants_td,
      enseignants_tp: module.enseignants_tp,
    }))

    setSections((prevSections) => [
      ...prevSections,
      {
        id: prevSections.length + 1,
        modules: newModules,
      },
    ])

    // Marquer qu'il y a des changements non sauvegardées
    setHasUnsavedChanges(true)
  }

  // Calculer la charge estimée pour un enseignant et un type de cours
  const calculateEstimatedCharge = (teacher, moduleIndex, type, sectionId) => {
    const module = sections.find((s) => s.id === sectionId)?.modules[moduleIndex]
    if (!module) return 0

    let chargeValue = 0
    if (type.startsWith("cours")) {
      chargeValue = Number(module.C || 0)
    } else if (type.startsWith("td")) {
      chargeValue = Number(module.TD || 0)
    } else if (type.startsWith("tp")) {
      chargeValue = Number(module.TP || 0)
    }

    return chargeValue
  }

  // Modifier la fonction handleTeacherSelect pour mettre à jour correctement les charges
  const handleTeacherSelect = async (sectionId, moduleIndex, type, teacher, num = "") => {
    const module = sections.find((s) => s.id === sectionId)?.modules[moduleIndex]
    if (!module) return

    const moduleName = module.Module
    const key = `${semestre}-${palier}-${specialite}-${moduleName}-${type}${num}-section${sectionId}`

    // Vérifier si c'est le même enseignant qui est déjà sélectionné
    if (selectedTeachers[key] === teacher) {
      return
    }
    // Marquer qu'il y a des changements non sauvegardés
    setHasUnsavedChanges(true)

    // Récupérer l'enseignant précédent
    const previousTeacher = selectedTeachers[key]

    // Calculer la charge pour cette affectation
    let chargeValue = 0
    if (type.startsWith("cours")) {
      chargeValue = Number(module.C || 0) * 3
    } else if (type.startsWith("td")) {
      chargeValue = Number(module.TD || 0)
    } else if (type.startsWith("tp")) {
      chargeValue = Number(module.TP || 0) * 1.5
    }

    // Déterminer la limite de charge en fonction de hsup
    const currentCharge = teacherCharges[teacher] || 0
    const chargeLimit = teachersWithHsup[teacher] ? 18 : 12

    if (currentCharge + chargeValue <= chargeLimit) {
      // Mettre à jour les charges localement pour TOUTES les sections
      setTeacherCharges((prev) => {
        const newCharges = { ...prev }

        // Si un enseignant précédent existe, soustraire sa charge de TOUTES les sections
        if (previousTeacher) {
          newCharges[previousTeacher] = Math.max(0, (newCharges[previousTeacher] || 0) - chargeValue)
          console.log(
            `Soustraction de ${chargeValue} pour ${previousTeacher}, nouvelle charge locale: ${newCharges[previousTeacher]}`,
          )
        }

        // Ajouter la charge au nouvel enseignant pour TOUTES les sections
        if (teacher) {
          newCharges[teacher] = (newCharges[teacher] || 0) + chargeValue
          console.log(`Ajout de ${chargeValue} pour ${teacher}, nouvelle charge locale: ${newCharges[teacher]}`)
        }

        return newCharges
      })

      // Mettre à jour les sélections
      setSelectedTeachers((prev) => ({
        ...prev,
        [key]: teacher,
      }))
    }
  }

  // Ajouter cette fonction après la fonction handleTeacherSelect
  const generateAutomaticOrganigram = async () => {
    if (!isSelectionComplete || loading) return

    setLoading(true)

    try {
      // Créer une copie locale des charges pour les suivre pendant la génération
      const localTeacherCharges = { ...teacherCharges }

      // Pour chaque section
      for (const section of sections) {
        // Pour chaque module dans la section
        for (const [moduleIndex, module] of section.modules.entries()) {
          // Charger les enseignants pour ce module s'ils ne sont pas déjà chargés
          if (!module.enseignants_cours) {
            const coursTeachers = await fetchTeachers(module.Module, "cours")
            module.enseignants_cours = coursTeachers.join("\n")
          }
          if (!module.enseignants_td) {
            const tdTeachers = await fetchTeachers(module.Module, "td")
            module.enseignants_td = tdTeachers.join("\n")
          }
          if (!module.enseignants_tp) {
            const tpTeachers = await fetchTeachers(module.Module, "tp")
            module.enseignants_tp = tpTeachers.join("\n")
          }

          // Affecter un enseignant pour le cours
          const coursKey = `${semestre}-${palier}-${specialite}-${module.Module}-cours-section${section.id}`
          if (!selectedTeachers[coursKey]) {
            // Calculer la charge pour ce cours
            const coursCharge = Number(module.C || 0) * 3

            // Filtrer les enseignants disponibles en tenant compte de la charge actuelle
            const availableTeachers = module.enseignants_cours.split("\n").filter((teacher) => {
              const chargeLimit = teachersWithHsup[teacher] ? 18 : 12
              return (localTeacherCharges[teacher] || 0) + coursCharge <= chargeLimit
            })

            if (availableTeachers.length > 0) {
              // Mettre à jour la charge locale avant d'affecter l'enseignant
              const selectedTeacher = availableTeachers[0]
              localTeacherCharges[selectedTeacher] = (localTeacherCharges[selectedTeacher] || 0) + coursCharge

              await handleTeacherSelect(section.id, moduleIndex, "cours", selectedTeacher)
            }
          }

          // Affecter des enseignants pour les TDs
          for (let tdNum = 1; tdNum <= 4; tdNum++) {
            const tdKey = `${semestre}-${palier}-${specialite}-${module.Module}-td${tdNum}-section${section.id}`
            if (!selectedTeachers[tdKey] && Number(module.TD) > 0) {
              // Calculer la charge pour ce TD
              const tdCharge = Number(module.TD || 0)

              // Filtrer les enseignants disponibles en tenant compte de la charge actuelle
              const availableTeachers = module.enseignants_td.split("\n").filter((teacher) => {
                const chargeLimit = teachersWithHsup[teacher] ? 18 : 12
                return (localTeacherCharges[teacher] || 0) + tdCharge <= chargeLimit
              })

              if (availableTeachers.length > 0) {
                // Mettre à jour la charge locale avant d'affecter l'enseignant
                const selectedTeacher = availableTeachers[0]
                localTeacherCharges[selectedTeacher] = (localTeacherCharges[selectedTeacher] || 0) + tdCharge

                await handleTeacherSelect(section.id, moduleIndex, "td", selectedTeacher, tdNum)
              }
            }
          }

          // Affecter des enseignants pour les TPs
          for (let tpNum = 1; tpNum <= 4; tpNum++) {
            const tpKey = `${semestre}-${palier}-${specialite}-${module.Module}-tp${tpNum}-section${section.id}`
            if (!selectedTeachers[tpKey] && Number(module.TP) > 0) {
              // Calculer la charge pour ce TP
              const tpCharge = Number(module.TP || 0) * 1.5

              // Filtrer les enseignants disponibles en tenant compte de la charge actuelle
              const availableTeachers = module.enseignants_tp.split("\n").filter((teacher) => {
                const chargeLimit = teachersWithHsup[teacher] ? 18 : 12
                return (localTeacherCharges[teacher] || 0) + tpCharge <= chargeLimit
              })

              if (availableTeachers.length > 0) {
                // Mettre à jour la charge locale avant d'affecter l'enseignant
                const selectedTeacher = availableTeachers[0]
                localTeacherCharges[selectedTeacher] = (localTeacherCharges[selectedTeacher] || 0) + tpCharge

                await handleTeacherSelect(section.id, moduleIndex, "tp", selectedTeacher, tpNum)
              }
            }
          }
        }
      }

      // Marquer les changements comme non sauvegardés
      setHasUnsavedChanges(true)

      // Afficher une notification de succès
      setSaveStatus("success")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Erreur lors de la génération automatique:", error)
      setSaveStatus("error")
      setShowSaveNotification(true)
      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }


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

  const semestres = ["1", "2"]
  const paliers = ["L1", "L2", "L3", "M1", "M2"]
  const specialitesDisponibles = semestre && palier ? specialitesParSemestreEtPalier[`${semestre}-${palier}`] || [] : []

  const fetchModules = async () => {
    if (semestre && palier && specialite) {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `http://localhost:5000/api/modules?semestre=S${semestre}&palier=${palier}&specialite=${specialite}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Erreur ${response.status}: ${errorText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          throw new Error(`Réponse non-JSON reçue: ${text.substring(0, 100)}...`)
        }

        const data = await response.json()
        setModules(data)
        setExpandedModules({})
      } catch (err) {
        console.error("Erreur de chargement:", err)
        setError(err.message)
        setModules([])
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleTeachers = async (sectionId, moduleIndex, type, num = "") => {
    const fullType = `${type}${num}`
    const module = sections.find((s) => s.id === sectionId)?.modules[moduleIndex]
    if (!module) return

    const key = `${module.Module}-${fullType}-section${sectionId}`

    // Toujours recharger les enseignants pour cette section
    setTeachersLoading((prev) => ({ ...prev, [key]: true }))
    try {
      const teachers = await fetchTeachers(module.Module, type.replace(/[0-9]/g, ""))
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              modules: section.modules.map((m, i) => {
                if (i === moduleIndex) {
                  return {
                    ...m,
                    [`enseignants_${type.replace(/[0-9]/g, "")}`]: teachers.join("\n"),
                  }
                }
                return m
              }),
            }
          }
          return section
        }),
      )
    } catch (err) {
      console.error("Erreur:", err)
    } finally {
      setTeachersLoading((prev) => ({ ...prev, [key]: false }))
    }

    setExpandedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const fetchTeachers = async (moduleName, type) => {
    try {
      const typeForApi = type.replace(/[0-9]/g, "")
      const response = await fetch(
        `http://localhost:5000/api/modules/teachers?module=${encodeURIComponent(moduleName)}&type=${typeForApi}&semestre=S${semestre}&palier=${palier}&specialite=${specialite}`,
      )
      const data = await response.json()

      // Mettre à jour l'état des enseignants avec hsup
      const hsupMap = {}
      data.forEach((teacher) => {
        if (teacher.hsup) {
          hsupMap[teacher.name] = true
        }
      })
      setTeachersWithHsup((prev) => ({ ...prev, ...hsupMap }))

      return data.map((teacher) => teacher.name)
    } catch (err) {
      console.error("Erreur de chargement des enseignants:", err)
      return []
    }
  }

  // Modifier la fonction saveChanges pour s'assurer que les données sont envoyées correctement
  const saveChanges = async () => {
    const selectionsToSave = sections.flatMap((section) =>
      section.modules.map((module, index) => ({
        section: section.id,
        module: module.Module,
        cours:
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-cours-section${section.id}`] || null,
        tds: [
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-td1-section${section.id}`] || null,
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-td2-section${section.id}`] || null,
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-td3-section${section.id}`] || null,
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-td4-section${section.id}`] || null,
        ],
        tps: [
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-tp1-section${section.id}`] || null,
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-tp2-section${section.id}`] || null,
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-tp3-section${section.id}`] || null,
          selectedTeachers[`${semestre}-${palier}-${specialite}-${module.Module}-tp4-section${section.id}`] || null,
        ],
      })),
    )

    try {
      setLoading(true)
      setSaveStatus("saving")
      setShowSaveNotification(true)

      const response = await fetch("http://localhost:5000/api/organigram/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semestre,
          palier,
          specialite,
          modules: selectionsToSave,
          calculatedCharges: teacherCharges,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur lors de la sauvegarde: ${errorText}`)
      }

      const data = await response.json()

      setSaveStatus("success")
      setHasUnsavedChanges(false)
      await fetchGlobalCharges()

      // Mettre à jour lastSavedState avec l'état actuel
      setLastSavedState({
        sections: JSON.parse(JSON.stringify(sections)),
        selectedTeachers: JSON.parse(JSON.stringify(selectedTeachers)),
        teacherCharges: JSON.parse(JSON.stringify(teacherCharges)),
        currentAssignments: JSON.parse(JSON.stringify(currentAssignments)),
      })

      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)

      return true // Indiquer que la sauvegarde a réussi
    } catch (error) {
      console.error("Erreur:", error)
      setSaveStatus("error")

      setTimeout(() => {
        setShowSaveNotification(false)
        setSaveStatus(null)
      }, 3000)

      return false // Indiquer que la sauvegarde a échoué
    } finally {
      setLoading(false)
    }
  }

  // Modifiez la fonction loadOrganigram pour précharger les listes d'enseignants
  const loadOrganigram = async () => {
    if (!semestre || !palier || !specialite) return

    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:5000/api/organigram/load?semestre=${semestre}&palier=${palier}&specialite=${specialite}`,
      )

      if (!response.ok) {
        throw new Error("Erreur lors du chargement")
      }

      const data = await response.json()

      const sectionsMap = {} // { sectionId: { id: sectionId, modules: [] } }
      const newSelections = {}
      const newAssignments = {}

      // Récupérer d'abord tous les modules uniques pour précharger les enseignants
      const uniqueModules = [...new Set(data.map((row) => row.module))]
      const moduleTeachersMap = {}

      // Précharger les enseignants pour chaque module
      for (const moduleName of uniqueModules) {
        try {
          // Précharger les enseignants de cours
          const coursTeachers = await fetchTeachers(moduleName, "cours")
          moduleTeachersMap[`${moduleName}-cours`] = coursTeachers.join("\n")

          // Précharger les enseignants de TD
          const tdTeachers = await fetchTeachers(moduleName, "td")
          moduleTeachersMap[`${moduleName}-td`] = tdTeachers.join("\n")

          // Précharger les enseignants de TP
          const tpTeachers = await fetchTeachers(moduleName, "tp")
          moduleTeachersMap[`${moduleName}-tp`] = tpTeachers.join("\n")
        } catch (err) {
          console.error(`Erreur lors du préchargement des enseignants pour ${moduleName}:`, err)
        }
      }

      data.forEach((row) => {
        const sectionId = row.section || 1

        if (!sectionsMap[sectionId]) {
          sectionsMap[sectionId] = {
            id: sectionId,
            modules: [],
          }
        }

        // Vérifier si le module existe déjà dans cette section
        const existingModule = sectionsMap[sectionId].modules.find((m) => m.Module === row.module)

        if (!existingModule) {
          // Ajouter le module à la section avec les enseignants préchargés
          sectionsMap[sectionId].modules.push({
            Module: row.module,
            enseignants_cours: moduleTeachersMap[`${row.module}-cours`] || "",
            enseignants_td: moduleTeachersMap[`${row.module}-td`] || "",
            enseignants_tp: moduleTeachersMap[`${row.module}-tp`] || "",
            // Ajouter les valeurs C, TD, TP pour les calculs de charge
            C: row.C || 0,
            TD: row.TD || 0,
            TP: row.TP || 0,
          })
        }

        // Enregistrer les enseignants sélectionnés
        const courseKey = `${semestre}-${palier}-${specialite}-${row.module}-cours-section${sectionId}`
        newSelections[courseKey] = row.enseignant_cours
        if (row.enseignant_cours) {
          newAssignments[courseKey] = row.enseignant_cours
        }
        // TD assignments
        ;[
          { num: 1, teacher: row.enseignant_td1 },
          { num: 2, teacher: row.enseignant_td2 },
          { num: 3, teacher: row.enseignant_td3 },
          { num: 4, teacher: row.enseignant_td4 },
        ].forEach(({ num, teacher }) => {
          const tdKey = `${semestre}-${palier}-${specialite}-${row.module}-td${num}-section${sectionId}`
          newSelections[tdKey] = teacher
          if (teacher) {
            newAssignments[tdKey] = teacher
          }
        })

        // TP assignments
        ;[
          { num: 1, teacher: row.enseignant_tp1 },
          { num: 2, teacher: row.enseignant_tp2 },
          { num: 3, teacher: row.enseignant_tp3 },
          { num: 4, teacher: row.enseignant_tp4 },
        ].forEach(({ num, teacher }) => {
          const tpKey = `${semestre}-${palier}-${specialite}-${row.module}-tp${num}-section${sectionId}`
          newSelections[tpKey] = teacher
          if (teacher) {
            newAssignments[tpKey] = teacher
          }
        })
      })

      // Mise à jour des sections
      const loadedSections = Object.values(sectionsMap)
      setSections(loadedSections)

      // Mise à jour des enseignants sélectionnés
      setSelectedTeachers(newSelections)

      // Mise à jour des affectations actuelles
      setCurrentAssignments(newAssignments)
      const localCharges = { ...teacherCharges }

      Object.entries(newSelections).forEach(([key, teacher]) => {
        if (!teacher) return

        // Extraire les infos de la clé
        const match = key.match(/(cours|td\d+|tp\d+)-section(\d+)/)
        if (!match) return

        const [_, type, sectionId] = match
        const moduleName = key.split("-")[3]

        // Trouver le module correspondant
        const section = sectionsMap[sectionId]
        if (!section) return

        const module = section.modules.find((m) => m.Module === moduleName)
        if (!module) return

        // Calculer la charge
        let charge = 0
        if (type === "cours") charge = Number(module.C || 0)
        else if (type.startsWith("td")) charge = Number(module.TD || 0)
        else if (type.startsWith("tp")) charge = Number(module.TP || 0)

        // Mettre à jour la charge locale
        localCharges[teacher] = (localCharges[teacher] || 0) + charge
      })
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur lors du chargement de l'organigramme: " + error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (semestre && palier && specialite) {
      fetchModules()
      loadOrganigram()
    }
  }, [semestre, palier, specialite])

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const selectOption = (value, type) => {
    // Vérifier s'il y a des modifications non sauvegardées
    if (hasUnsavedChanges) {
      setPendingNavigation({ value, type })
      setShowExitConfirm(true)
      return
    }

    if (type === "semestre") {
      setSemestre(value)
      setPalier("")
      setSpecialite("")
      // Réinitialiser les affectations actuelles lors du changement de semestre
      setCurrentAssignments({})
      // Réinitialiser l'état des modifications non sauvegardées
      setHasUnsavedChanges(false)
    } else if (type === "palier") {
      setPalier(value)
      setSpecialite("")
      // Réinitialiser l'état des modifications non sauvegardées
      setHasUnsavedChanges(false)
    } else if (type === "specialite") {
      // Si on clique sur la même spécialité, on ne fait rien mais on force le rechargement
      if (value === specialite) {
        // Forcer le rechargement des données
        fetchModules()
        loadOrganigram()
      } else {
        // Nouvelle spécialité
        setSpecialite(value)
        // Réinitialiser l'état des modifications non sauvegardées
        setHasUnsavedChanges(false)
      }
    }
    setOpenDropdown(null)

    // Ne réinitialiser les modules et sections que si on change de semestre ou de palier
    // ou si on sélectionne une nouvelle spécialité (pas la même)
    if (type === "semestre" || type === "palier" || (type === "specialite" && value !== specialite)) {
      setModules([])
      setSections([{ id: 1, modules: [] }])
    }
  }

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

  // Fonction pour afficher la charge d'un enseignant avec un indicateur visuel
  const renderTeacherWithCharge = (teacher) => {
    const charge = teacherCharges[teacher] || 0
    const chargeLimit = teachersWithHsup[teacher] ? 18 : 12
    let chargeClass = "charge-normal"

    if (charge >= chargeLimit * 0.8) {
      chargeClass = "charge-high"
    } else if (charge >= chargeLimit * 0.6) {
      chargeClass = "charge-medium"
    }

    return (
      <span>
        {teacher}{" "}
        <span className={`teacher-charge ${chargeClass}`}>
          ({charge}/{chargeLimit})
        </span>
      </span>
    )
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue =
          "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter sans sauvegarder?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  return (
    <div className="organigram-container">
      {/* Dropdowns */}
      <div className="organigram-dropdown-container">
        {dropdowns.map((dropdown) => (
          <div key={dropdown.id} className="organigram-dropdown-wrapper">
            <div className="organigram-dropdown-title">{dropdown.title}</div>
            <div className={`organigram-dropdown ${openDropdown === dropdown.id ? "open" : ""}`}>
              <button
                className={`organigram-dropdown-btn ${dropdown.selected ? "selected" : ""} ${dropdown.disabled ? "disabled" : ""}`}
                onClick={() => !dropdown.disabled && toggleDropdown(dropdown.id)}
                disabled={dropdown.disabled}
              >
                {dropdown.selected || `Select ${dropdown.title}`}
                {!dropdown.disabled && <span className="organigram-arrow">▼</span>}
              </button>
              {openDropdown === dropdown.id && (
                <div className="organigram-dropdown-menu">
                  {dropdown.options.map((option) => {
                    const value = typeof option === "object" ? option.value : option
                    const label = typeof option === "object" ? option.label : option
                    return (
                      <div
                        key={value}
                        className="organigram-dropdown-item"
                        onClick={() => selectOption(value, dropdown.id)}
                      >
                        {label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
          </div>
          
        ))}
        <button
                onClick={resetAllData}
                className="preferences-btn"
                disabled={loading}
                title="Réinitialiser toutes les données (vider organigrammes et remettre charges à 0)"
              >
<span style={{ fontWeight: '700' }}>TOUT SUPPRIMER 🗑️</span>              </button>

      </div>

      {/* Loader et erreurs */}
      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Chargement en cours...
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {/* Sections affichées */}
      {!loading && !error && sections.length > 0 ? (
        <div className="section-list">
          {/* Remplacer la div section-controls existante par celle-ci (vers la ligne 1000) */}
          <div className="section-controls">
            <div className="info-banner">
              <span className="info-item">
                Semestre: <span className="info-value">{semestre || "-"}</span>
              </span>
              <span className="info-separator">, </span>
              <span className="info-item">
                Palier: <span className="info-value">{palier || "-"}</span>
              </span>
              <span className="info-separator">, </span>
              <span className="info-item">
                Specialité: <span className="info-value">{specialite || "-"}</span>
              </span>
            </div>

            <div className="section-buttons">
              
              <button
                onClick={addNewSection}
                className="add-section-btn"
                disabled={!isSelectionComplete}
                title={!isSelectionComplete ? "Veuillez sélectionner un semestre, un palier et une spécialité" : ""}
              >
                + Ajouter une section
              </button>

              <button
                onClick={generateAutomaticOrganigram}
                className="auto-generate-btn"
                disabled={!isSelectionComplete || loading}
                title={
                  !isSelectionComplete
                    ? "Veuillez sélectionner un semestre, un palier et une spécialité"
                    : "Générer automatiquement l'organigramme"
                }
              >
                <span className="auto-generate-icon"></span>
                Générer automatiquement
              </button>
              <label className="import-btn">
                📥 Importer
                <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {/* Un tableau par section */}
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="section-container">
              <div className="section-header">
                <div className="section-title-container">
                  <h3 className="section-title">Section {section.id}</h3>
                  {isSectionCompleteCheck(section) ? (
                    <span className="section-complete-badge" title="Section complète">
                      ✅
                    </span>
                  ) : (
                    <span className="section-incomplete-badge" title="Section incomplète">
                      ⚠️
                    </span>
                  )}
                </div>

                {/* Afficher le bouton Supprimer uniquement pour la dernière section */}
                {sectionIndex === sections.length - 1 && sections.length > 1 && (
                  <button onClick={() => removeSection(section.id)} className="remove-section-btn">
                    Supprimer
                  </button>
                )}
              </div>
              <div className="table-responsive-container">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Cours</th>
                      <th>TD1</th>
                      <th>TD2</th>
                      <th>TD3</th>
                      <th>TD4</th>
                      <th>TP1</th>
                      <th>TP2</th>
                      <th>TP3</th>
                      <th>TP4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.modules.map((module, moduleIndex) => (
                      <tr key={`${section.id}-${moduleIndex}`}>
                        <td>{module.Module}</td>

                        {/* Cours */}
                        <td>
                          <button
                            className="toggle-teachers-btn"
                            onClick={() => toggleTeachers(section.id, moduleIndex, "cours")}
                            disabled={teachersLoading[`${module.Module}-cours-section${section.id}`]}
                          >
                            {teachersLoading[`${module.Module}-cours-section${section.id}`] ? (
                              "Chargement..."
                            ) : expandedModules[`${module.Module}-cours-section${section.id}`] ? (
                              <>
                                <span className="toggle-icon">▲</span> Masquer enseignants
                              </>
                            ) : (
                              <>
                                <span className="toggle-icon">▼</span> Afficher enseignants
                              </>
                            )}
                          </button>
                          {selectedTeachers[
                            `${semestre}-${palier}-${specialite}-${module.Module}-cours-section${section.id}`
                          ] && (
                            <p className="selected-teacher">
                              ✅{" "}
                              {renderTeacherWithCharge(
                                selectedTeachers[
                                  `${semestre}-${palier}-${specialite}-${module.Module}-cours-section${section.id}`
                                ],
                              )}
                            </p>
                          )}
                          {expandedModules[`${module.Module}-cours-section${section.id}`] && (
                            <div className="teachers-list-container">
                              {module.enseignants_cours &&
                                module.enseignants_cours.split("\n").map((teacher, i) => (
                                  <div key={i} className="teacher-item">
                                    <button
                                      onClick={() => handleTeacherSelect(section.id, moduleIndex, "cours", teacher)}
                                      className="teacher-btn"
                                      disabled={(teacherCharges[teacher] || 0) >= 12}
                                      title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                    >
                                      👤 {renderTeacherWithCharge(teacher)}
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </td>

                        {/* TD1 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "td", 1)}
                                disabled={teachersLoading[`${module.Module}-td1-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-td1-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-td1-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td1-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-td1-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-td1-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_td &&
                                    module.enseignants_td.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "td", teacher, 1)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TD2 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "td", 2)}
                                disabled={teachersLoading[`${module.Module}-td2-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-td2-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-td2-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td2-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-td2-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-td2-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_td &&
                                    module.enseignants_td.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "td", teacher, 2)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TD3 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "td", 3)}
                                disabled={teachersLoading[`${module.Module}-td3-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-td3-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-td3-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td3-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-td3-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-td3-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_td &&
                                    module.enseignants_td.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "td", teacher, 3)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TD4 */}
                        <td>
                          {Number(module.TD) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "td", 4)}
                                disabled={teachersLoading[`${module.Module}-td4-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-td4-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-td4-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td4-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-td4-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-td4-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_td &&
                                    module.enseignants_td.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "td", teacher, 4)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TP1 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "tp", 1)}
                                disabled={teachersLoading[`${module.Module}-tp1-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-tp1-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-tp1-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp1-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-tp1-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-tp1-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_tp &&
                                    module.enseignants_tp.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "tp", teacher, 1)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TP2 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "tp", 2)}
                                disabled={teachersLoading[`${module.Module}-tp2-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-tp2-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-tp2-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp2-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-tp2-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-tp2-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_tp &&
                                    module.enseignants_tp.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "tp", teacher, 2)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TP3 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "tp", 3)}
                                disabled={teachersLoading[`${module.Module}-tp3-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-tp3-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-tp3-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp3-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-tp3-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-tp3-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_tp &&
                                    module.enseignants_tp.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "tp", teacher, 3)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        {/* TP4 */}
                        <td>
                          {Number(module.TP) === 0 ? (
                            <div className="non-existent-component">
                              <span className="non-existent-icon">❌</span>
                            </div>
                          ) : (
                            <>
                              <button
                                className="toggle-teachers-btn"
                                onClick={() => toggleTeachers(section.id, moduleIndex, "tp", 4)}
                                disabled={teachersLoading[`${module.Module}-tp4-section${section.id}`]}
                              >
                                {teachersLoading[`${module.Module}-tp4-section${section.id}`] ? (
                                  "Chargement..."
                                ) : expandedModules[`${module.Module}-tp4-section${section.id}`] ? (
                                  <>
                                    <span className="toggle-icon">▲</span> Masquer enseignants
                                  </>
                                ) : (
                                  <>
                                    <span className="toggle-icon">▼</span> Afficher enseignants
                                  </>
                                )}
                              </button>
                              {selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp4-section${section.id}`
                              ] && (
                                <p className="selected-teacher">
                                  ✅{" "}
                                  {renderTeacherWithCharge(
                                    selectedTeachers[
                                      `${semestre}-${palier}-${specialite}-${module.Module}-tp4-section${section.id}`
                                    ],
                                  )}
                                </p>
                              )}
                              {expandedModules[`${module.Module}-tp4-section${section.id}`] && (
                                <div className="teachers-list-container">
                                  {module.enseignants_tp &&
                                    module.enseignants_tp.split("\n").map((teacher, i) => (
                                      <div key={i} className="teacher-item">
                                        <button
                                          onClick={() => handleTeacherSelect(section.id, moduleIndex, "tp", teacher, 4)}
                                          className="teacher-btn"
                                          disabled={(teacherCharges[teacher] || 0) >= 12}
                                          title={(teacherCharges[teacher] || 0) >= 12 ? "Charge maximale atteinte" : ""}
                                        >
                                          👤 {renderTeacherWithCharge(teacher)}
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {hasUnsavedChanges && (
            <div className="unsaved-changes-indicator">
              <span className="warning-icon">⚠️</span>
              Modifications non sauvegardées
            </div>
          )}
          {/* Bouton sauvegarde */}
          <div className="save-button-container">
            <button
              className="save-button"
              onClick={saveChanges}
              disabled={!semestre || !palier || !specialite || loading || saveStatus === "saving"}
              title={
                !semestre || !palier || !specialite
                  ? "Sélectionnez un semestre, un palier et une spécialité pour activer"
                  : "Enregistrer l'organigramme"
              }
            >
              {saveStatus === "saving" ? (
                <>
                  <span className="save-button-spinner"></span>
                  Sauvegarde en cours...
                </>
              ) : saveStatus === "success" ? (
                <>
                  <span className="save-button-icon">✅</span>
                  Sauvegardé!
                </>
              ) : saveStatus === "error" ? (
                <>
                  <span className="save-button-icon">❌</span>
                  Échec
                </>
              ) : (
                <>
                  <span className="save-button-icon">💾</span>
                  Sauvegarder
                </>
              )}
            </button>
            <button
              onClick={handlePublishClick}
              className="publish-btn"
              disabled={!isSelectionComplete || loading || sections.length === 0}
              title={
                !isSelectionComplete
                  ? "Veuillez sélectionner un semestre, un palier et une spécialité"
                  : "Publier l'organigramme pour les enseignants"
              }
            >
              📰 Publier
            </button>
            <button
              onClick={exportToExcel}
              className="exportGreenBtn"
              disabled={!isSelectionComplete || loading || sections.length === 0}
              title={
                !isSelectionComplete
                  ? "Veuillez sélectionner un semestre, un palier et une spécialité"
                  : "Exporter vers Excel"
              }
            >
              📤 Exporter
            </button>

            <button
              onClick={exportallToExcel}
              className="export-btn1"
              disabled={loading || sections.length === 0}
              title={
                !isSelectionComplete
                  ? "Veuillez sélectionner un semestre, un palier et une spécialité"
                  : "Exporter vers Excel"
              }
            >
              🗂️ Tout Exporter
            </button>
          </div>
        </div>
      ) : !loading && !error && semestre && palier && specialite ? (
        <p className="no-data-message"></p>
      ) : null}

      {/* Modal de confirmation de sortie */}
      {showExitConfirm && (
        <div className="unsaved-changes-overlay">
          <div className="unsaved-changes-modal">
            <span className="warning-icon">⚠️</span>
            <h2>Modifications non sauvegardées</h2>
            <p>Vous avez des modifications non sauvegardées. Voulez-vous les enregistrer avant de continuer?</p>
            <div className="unsaved-changes-buttons">
              <button
                className="unsaved-changes-btn unsaved-changes-btn-cancel"
                onClick={() => {
                  setShowExitConfirm(false)
                  setPendingNavigation({ value: null, type: null })
                }}
              >
                Annuler
              </button>

              <button
                className="unsaved-changes-btn unsaved-changes-btn-save"
                onClick={async () => {
                  try {
                    setLoading(true)
                    const response = await fetch("http://localhost:5000/api/organigram/save", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        semestre,
                        palier,
                        specialite,
                        modules: sections.flatMap((section) =>
                          section.modules.map((module, index) => ({
                            section: section.id,
                            module: module.Module,
                            cours:
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-cours-section${section.id}`
                              ] || null,
                            tds: [
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td1-section${section.id}`
                              ] || null,
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td2-section${section.id}`
                              ] || null,
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td3-section${section.id}`
                              ] || null,
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-td4-section${section.id}`
                              ] || null,
                            ],
                            tps: [
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp1-section${section.id}`
                              ] || null,
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp2-section${section.id}`
                              ] || null,
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp3-section${section.id}`
                              ] || null,
                              selectedTeachers[
                                `${semestre}-${palier}-${specialite}-${module.Module}-tp4-section${section.id}`
                              ] || null,
                            ],
                          })),
                        ),
                        calculatedCharges: teacherCharges,
                      }),
                    })

                    if (!response.ok) {
                      throw new Error("Erreur lors de la sauvegarde")
                    }

                    await response.json()

                    // Mettre à jour lastSavedState avec l'état actuel
                    setLastSavedState({
                      sections: [...sections],
                      selectedTeachers: { ...selectedTeachers },
                      teacherCharges: { ...teacherCharges },
                      currentAssignments: { ...currentAssignments },
                    })

                    // Réinitialiser l'état des modifications non sauvegardées
                    setHasUnsavedChanges(false)

                    // Fermer la modal
                    setShowExitConfirm(false)

                    // Exécuter la navigation immédiatement
                    if (pendingNavigation.value && pendingNavigation.type) {
                      const { value, type } = pendingNavigation

                      if (type === "semestre") {
                        setSemestre(value)
                        setPalier("")
                        setSpecialite("")
                        setCurrentAssignments({})
                      } else if (type === "palier") {
                        setPalier(value)
                        setSpecialite("")
                      } else if (type === "specialite") {
                        if (value === specialite) {
                          fetchModules()
                          loadOrganigram()
                        } else {
                          setSpecialite(value)
                        }
                      }

                      setOpenDropdown(null)

                      if (type === "semestre" || type === "palier" || (type === "specialite" && value !== specialite)) {
                        setModules([])
                        setSections([{ id: 1, modules: [] }])
                      }
                    }

                    // Afficher une notification de succès
                    setSaveStatus("success")
                    setShowSaveNotification(true)
                    setTimeout(() => {
                      setShowSaveNotification(false)
                      setSaveStatus(null)
                    }, 3000)
                  } catch (error) {
                    console.error("Erreur:", error)
                    setSaveStatus("error")
                    setShowSaveNotification(true)
                    setTimeout(() => {
                      setShowSaveNotification(false)
                      setSaveStatus(null)
                    }, 3000)
                  }
                }}
              >
                Sauvegarder et continuer
              </button>

              <button
                className="unsaved-changes-btn unsaved-changes-btn-discard"
                onClick={() => {
                  // Fermer la modal
                  setShowExitConfirm(false)

                  // Réinitialiser l'état des modifications non sauvegardées
                  setHasUnsavedChanges(false)

                  // Exécuter la navigation immédiatement
                  if (pendingNavigation.value && pendingNavigation.type) {
                    const { value, type } = pendingNavigation

                    if (type === "semestre") {
                      setSemestre(value)
                      setPalier("")
                      setSpecialite("")
                      setCurrentAssignments({})
                    } else if (type === "palier") {
                      setPalier(value)
                      setSpecialite("")
                    } else if (type === "specialite") {
                      if (value === specialite) {
                        fetchModules()
                        loadOrganigram()
                      } else {
                        setSpecialite(value)
                      }
                    }

                    setOpenDropdown(null)

                    if (type === "semestre" || type === "palier" || (type === "specialite" && value !== specialite)) {
                      setModules([])
                      setSections([{ id: 1, modules: [] }])
                    }
                  }
                }}
              >
                Ne pas sauvegarder et continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification de sauvegarde */}
      {showSaveNotification && (
        <div className={`save-notification ${saveStatus === "success" ? "success" : "error"}`}>
          {saveStatus === "success" ? (
            <>
              <span className="save-button-icon">✅</span>
              Sauvegarde réussie!
            </>
          ) : (
            <>
              
            </>
          )}
        </div>
      )}
      {showTitleModal && <TitleModal onSave={handleTitleSave} onCancel={() => setShowTitleModal(false)} />}
      {showResetConfirm && (
        <div className="reset-warning-overlay">
          <div className="reset-warning">
            
            <div className="reset-warning-body">
              <div className="reset-warning-message">
                
                <div className="reset-warning-sub-text">
                  • Tous les organigrammes seront effacés
                  <br />• Toutes les charges seront remises à zéro
                </div>
              </div>
                <div className="reset-warning-question">Êtes-vous sur de vouloir continuer ?</div>
             
            </div>
            <div className="reset-warning-buttons">
              <button className="reset-warning-btn reset-warning-cancel" onClick={handleCancelReset}>
                <span className="btn-icon"></span>
                Annuler
              </button>
              <button className="reset-warning-btn reset-warning-confirm" onClick={handleConfirmReset}>
                <span className="btn-icon"></span>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TitleModal = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState("")

  return (
    <div className="title-modal-overlay">
      <div className="title-modal">
        <div className="title-modal-header">
          <h2>Enter Version Title</h2>
          <button className="title-modal-close" onClick={onCancel} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="title-modal-body">
          <p>Please enter a title for this version:</p>
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Version Title"
            maxLength={50}
            autoFocus
          />
          <div className="title-input-counter">{title.length}/50</div>
        </div>

        <div className="title-modal-footer">
          <button className="title-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="title-btn-save" onClick={() => onSave(title)} disabled={!title.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default Organigram
