"use client"

import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"

// Pages
import Login from "./Login"
import ForgotPassword from "./Forgot-password"
import AdminDashboard from "./AdminDashboard"
import TeacherDashboard from "./TeacherDashboard" // Créez ce composant
import Organigram from "./organigram"
import TeacherOrganigram from "./TeacherOrganigram" // Ajouter cette ligne
import TeacherFDV from "./TeacherFDV" // Importer le composant TeacherFDV
import AdminFDV from "./AdminFDV"
// Layouts
import Sidebar from "./Sidebar"
import Teachers from "./Teachers"
import InfosEach from "./InfosEach"
import ModuleEach from "./ModuleEach"
import ModifyEach from "./ModifyEach"
import AddTeacher from "./AddTeacher"
import PersonalInfoCard from "./PersonalInfoCard"
import Modify from "./Modify"
import ModuleManager from "./ModuleManager"
import ChargeTable from "./ChargeTable"
import ChargeTableadmin from "./ChargeTableadmin"
import CahierDeCharges from "./CahierDeCharges" 

// Constantes pour les rôles
const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
}

// Layout avec Sidebar
const WithSidebarLayout = ({ children, setIsLoggedIn, setUser, user }) => {
  return (
    <div className="app-with-sidebar">
      <Sidebar user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
      <main className="app-main-content">{React.cloneElement(children, { setIsLoggedIn, setUser })}</main>
    </div>
  )
}

// Layout sans Sidebar
const WithoutSidebarLayout = ({ children, setIsLoggedIn, setUser }) => (
  <div className="app-without-sidebar">{React.cloneElement(children, { setIsLoggedIn, setUser })}</div>
)

// Route privée avec vérification de rôle
const RoleBasedRoute = ({ element, allowedRoles, withSidebar = true, setIsLoggedIn, setUser, user }) => {
  const isAuthenticated = localStorage.getItem("token") !== null
  const [initialized, setInitialized] = useState(false)
  const [userInfo, setUserInfo] = useState(user)

  useEffect(() => {
    if (!userInfo) {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUserInfo(parsedUser)
        setUser(parsedUser)
        setIsLoggedIn(true)
      }
    }
    setInitialized(true)
  }, []) // Empty dependency array means this runs once on mount

  if (!isAuthenticated) return <Navigate to="/" />

  if (!initialized) {
    return null // or a loading spinner
  }

  // Vérifier si le rôle de l'utilisateur est autorisé
  const userRole = userInfo?.role
  const isAuthorized = allowedRoles.includes(userRole)

  if (!isAuthorized) {
    // Rediriger vers la page appropriée en fonction du rôle
    if (userRole === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" />
    } else if (userRole === ROLES.TEACHER) {
      return <Navigate to="/teacher/dashboard" />
    } else {
      return <Navigate to="/" />
    }
  }

  const Layout = withSidebar ? WithSidebarLayout : WithoutSidebarLayout

  return (
    <Layout setIsLoggedIn={setIsLoggedIn} setUser={setUser} user={userInfo}>
      {React.cloneElement(element, { user: userInfo })}
    </Layout>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <Router>
      <Routes>
        {/* Auth & public routes */}
        <Route
          path="/"
          element={
            <WithoutSidebarLayout setIsLoggedIn={setIsLoggedIn} setUser={setUser}>
              <Login />
            </WithoutSidebarLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <WithoutSidebarLayout setIsLoggedIn={setIsLoggedIn} setUser={setUser}>
              <ForgotPassword />
            </WithoutSidebarLayout>
          }
        />
         <Route
          path="/teachers"
          element={
            <RoleBasedRoute
              element={<Teachers />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/InfosEach"
          element={
            <RoleBasedRoute
              element={<InfosEach />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/ModuleEach"
          element={
            <RoleBasedRoute
              element={<ModuleEach />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />

        <Route
          path="/ModifyEach"
          element={
            <RoleBasedRoute
              element={<ModifyEach />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="//add-teacher"
          element={
            <RoleBasedRoute
              element={<AddTeacher />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/PersonalInfoCard"
          element={
            <RoleBasedRoute
              element={<PersonalInfoCard />}
              allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/Modify"
          element={
            <RoleBasedRoute
              element={<Modify />}
              allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/Modules"
          element={
            <RoleBasedRoute
              element={<ModuleManager />}
              allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />

        <Route
          path="/Charges"
          element={
            <RoleBasedRoute
              element={<ChargeTable />}
              allowedRoles={[ROLES.TEACHER]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />

         <Route
          path="/Chargesad"
          element={
            <RoleBasedRoute
              element={<ChargeTableadmin />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/Cahierdescharges"
          element={
            <RoleBasedRoute
              element={<CahierDeCharges />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        
        
        {/* Routes admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute
              element={<AdminDashboard />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />

        {/* Routes enseignant */}
        <Route
          path="/teacher/dashboard"
          element={
            <RoleBasedRoute
              element={<TeacherDashboard />}
              allowedRoles={[ROLES.TEACHER]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />

        {/* Route pour la fiche de vœux des enseignants */}
        <Route
          path="/teacher/fdv"
          element={
            <RoleBasedRoute
              element={<TeacherFDV />}
              allowedRoles={[ROLES.TEACHER]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/admin/fdv"
          element={
            <RoleBasedRoute
              element={<AdminFDV />}
              allowedRoles={[ROLES.ADMIN]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />

        {/* Routes communes */}
        <Route
          path="/organigram"
          element={
            <RoleBasedRoute
              element={(() => {
                // Récupérer le rôle directement du localStorage si user est null
                let role = user?.role
                if (!role) {
                  const storedUser = localStorage.getItem("user")
                  if (storedUser) {
                    role = JSON.parse(storedUser).role
                  }
                }
                return role === ROLES.ADMIN ? <Organigram /> : <TeacherOrganigram />
              })()}
              allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}
              withSidebar={true}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
