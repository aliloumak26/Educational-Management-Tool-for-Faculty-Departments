import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setIsLoggedIn, setUser }) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', password: '', gender: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleContainer = () => {
    setIsActive(!isActive);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Réinitialiser les erreurs précédentes
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          grade: formData.grade,
          statut: formData.statut,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        
        // Redirection selon le rôle
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/teacher/dashboard');
        }
      } else {
        setError(data.message || 'Échec de la connexion');
      }
    } catch (error) {
      setError('Erreur lors de la connexion au serveur');
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="app">
      <div className={`container ${isActive ? 'active' : ''}`}>
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <h1>Accéder à votre compte</h1>
            {error && <div className="error-message">{error}</div>}
            <input 
              type="text" 
              name="firstName" 
              placeholder="Prénom" 
              value={formData.firstName} 
              onChange={handleInputChange} 
              required 
            />
            <input 
              type="text" 
              name="lastName" 
              placeholder="Nom" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              required 
            />
            <div className="password-container">
              <input 
                type={passwordVisible ? "text" : "password"} 
                name="password" 
                placeholder="Mot de passe" 
                value={formData.password} 
                onChange={handleInputChange} 
                required 
              />
              <span className="toggle-password" onClick={togglePasswordVisibility}>
                {!passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
            <button type="submit">Se connecter</button>
          </form>
        </div>

        <div className="form-container site-guide">
          <form>
            <h1>Ce site est exclusivement réservé aux enseignants de l'USTHB.</h1>
            <p>
              Si vous souhaitez créer un compte, veuillez contacter le <a href="mailto:your_admin_email@usthb.dz">Service Informatique</a>.
            </p>
            <p>
              Pour tout problème technique, veuillez contacter le <a href="mailto:faculty_support@usthb.dz">Support Facultaire</a>.
            </p>
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className={`toggle-panel toggle-left ${isActive ? 'active' : ''}`}>
              <h1>Content de vous revoir !</h1>
              <p>Entrez vos informations personnelles pour accéder à toutes les fonctionnalités du site</p>
              <button className="hidden" onClick={toggleContainer}>Page d'accueil</button>
            </div>
            <div className={`toggle-panel toggle-right ${isActive ? '' : 'active'}`}>
              <h1>Bienvenue sur le Portail Facultaire</h1>
              <p>Connectez-vous pour accéder à votre tableau de bord académique et à vos supports de cours</p>
              <button className="hidden" onClick={toggleContainer}>Connexion</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;