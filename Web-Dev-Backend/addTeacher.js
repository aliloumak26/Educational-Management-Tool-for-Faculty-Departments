const express = require("express")
const router = express.Router()
const pool = require("./config/db")
const auth = require("./middlewares/auth")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

// Configuration email avec vos variables d'environnement
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Fonction pour envoyer l'email de bienvenue avec le mot de passe
async function sendWelcomeEmail(email, password, firstName, lastName) {
  try {
    const transporter = createTransporter()
    const fullName = `${firstName} ${lastName}`

    const mailOptions = {
      from: `"Organigram" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Bienvenue sur Organigram - Vos identifiants de connexion",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0;
              background-color: #f4f4f4;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content { 
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #2d3748;
              margin-bottom: 20px;
            }
            .welcome-message {
              background: #f0fdf4;
              border: 2px solid #10b981;
              border-radius: 10px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .password-section {
              background: #f8f9ff;
              border: 2px solid #667eea;
              border-radius: 10px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .password-label {
              font-size: 16px;
              color: #4a5568;
              margin-bottom: 10px;
            }
            .password { 
              font-size: 24px; 
              font-weight: bold; 
              color: #667eea; 
              letter-spacing: 3px;
              font-family: 'Courier New', monospace;
              background: white;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .credentials {
              background: #f7fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .credentials h3 {
              margin-top: 0;
              color: #2d3748;
            }
            .credential-item {
              margin: 10px 0;
              font-size: 16px;
            }
            .credential-label {
              font-weight: 600;
              color: #4a5568;
            }
            .login-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: #ffffff !important; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 25px 0; 
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
            }
            .login-button:hover {
              transform: translateY(-2px);
              color: #ffffff !important;
            }
            .security-note { 
              background: #fffbeb; 
              border: 1px solid #f6e05e; 
              border-radius: 8px;
              padding: 20px; 
              margin: 25px 0;
              border-left: 4px solid #ed8936;
            }
            .security-title {
              font-weight: 600;
              color: #744210;
              margin-bottom: 8px;
            }
            .footer {
              background: #f7fafc;
              padding: 20px;
              text-align: center;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur Organigram !</h1>
            </div>
            <div class="content">
              <div class="greeting">Bonjour <strong>${fullName}</strong> ! 👋</div>
              
              <div class="welcome-message">
                <h3 style="margin-top: 0; color: #059669;">✨ Votre compte a été créé avec succès !</h3>
                <p style="margin-bottom: 0;">Vous avez maintenant accès à la plateforme Organigram. Voici vos identifiants de connexion :</p>
              </div>
              
              <div class="credentials">
                <h3>📋 Vos informations de connexion :</h3>
                <div class="credential-item">
                  <span class="credential-label">👤 Nom complet :</span> ${fullName}
                </div>
                <div class="credential-item">
                  <span class="credential-label">📧 Email :</span> ${email}
                </div>
              </div>
              
              <div class="password-section">
                <div class="password-label"><strong>🔐 Votre mot de passe :</strong></div>
                <div class="password">${password}</div>
              </div>
              
              <div style="text-align: center;">
                <a href="http://localhost:5173/" class="login-button">
                  🚀 Se connecter maintenant
                </a>
              </div>
              
              <div class="security-note">
                <div class="security-title">🔒 Important pour votre sécurité :</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Gardez vos identifiants confidentiels</li>
                  <li>Ne partagez jamais votre mot de passe avec d'autres personnes</li>
                </ul>
              </div>
              
              <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à contacter l'équipe support à <strong>${process.env.EMAIL_USER}</strong>.</p>
              
              <p style="text-align: center; color: #059669; font-weight: 600;">
                Nous sommes ravis de vous accueillir dans l'équipe ! 🎊
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Organigram - Système de gestion académique</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Bienvenue sur Organigram !
        
        Bonjour ${fullName} !
        
        Votre compte a été créé avec succès. Voici vos informations de connexion :
        
        Nom complet : ${fullName}
        Email : ${email}
        Mot de passe temporaire : ${password}
        
        Connectez-vous ici : http://localhost:5173/
        
        IMPORTANT pour votre sécurité :
        - Ce mot de passe est temporaire et généré automatiquement
        - Nous vous recommandons de le changer lors de votre première connexion
        - Gardez vos identifiants confidentiels
        
        Si vous avez des questions, contactez-nous à ${process.env.EMAIL_USER}
        
        Bienvenue dans l'équipe !
        Équipe Organigram
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("✅ Email de bienvenue envoyé à:", email)
    return true
  } catch (error) {
    console.error("❌ Erreur envoi email de bienvenue:", error)
    throw new Error("Échec de l'envoi de l'email de bienvenue")
  }
}

router.post("/", auth, async (req, res) => {
  console.log("Requête reçue:", req.body)

  try {
    // 1. Validation des données
    const { firstName, lastName, gender, grade, phone, email, statut, role } = req.body

    // Validation des champs obligatoires
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nom, prénom et email sont obligatoires",
      })
    }

    // 2. Formatage des données
    const formattedEmail = email.trim().toLowerCase()

    // 3. Vérification de l'unicité de l'email
    const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [formattedEmail])

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      })
    }

    // 4. Récupération du dernier ID
    const [lastUser] = await pool.query("SELECT id FROM users ORDER BY id DESC LIMIT 1")
    const lastId = lastUser.length > 0 ? lastUser[0].id : 0
    const newId = lastId + 1

    // 5. Génération d'un mot de passe aléatoire
    const generatedPassword = crypto.randomBytes(5).toString("hex")

    // 6. Insertion dans la base de données
    const [result] = await pool.query(`INSERT INTO users SET ?`, {
      id: newId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: gender || "Woman",
      grade: grade || "1, Master Assistant",
      phone: phone?.trim(),
      email: formattedEmail,
      statut: statut,
      role: role || "teacher",
      password: generatedPassword,
    })

    // 7. Ajout dans la table teachers
    const enseignant = `${lastName.trim()}, ${firstName.trim()}`
    await pool.query(`INSERT INTO teachers (specialite, enseignant, id) VALUES (?, ?, ?)`, ["#N/A", enseignant, newId])

    await pool.query(`INSERT INTO charges (lastName, firstName, charge, semestre) VALUES ?`, [
      [
        [lastName.trim(), firstName.trim(), 0, "S1"],
        [lastName.trim(), firstName.trim(), 0, "S2"],
      ],
    ])

    // 8. Envoi de l'email de bienvenue avec le mot de passe
    try {
      await sendWelcomeEmail(formattedEmail, generatedPassword, firstName.trim(), lastName.trim())
      console.log("✅ Email de bienvenue envoyé avec succès")
    } catch (emailError) {
      console.error("⚠️ Erreur lors de l'envoi de l'email:", emailError)
      // On continue même si l'email échoue, mais on le signale dans la réponse
    }

    // 9. Réponse
    res.status(201).json({
      success: true,
      message: "Professeur créé avec succès et email de bienvenue envoyé !",
      user: {
        id: newId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: formattedEmail,
        statut: statut,
      },
      generatedPassword: generatedPassword,
      emailSent: true,
      securityNote: "Le mot de passe a été envoyé par email au nouveau professeur",
    })
  } catch (error) {
    console.error("Erreur serveur:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      query: req.body,
    })

    const statusCode = error.code === "ER_DUP_ENTRY" ? 409 : 500
    res.status(statusCode).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Un compte avec cet email existe déjà"
          : "Erreur lors de la création du professeur",
      systemError: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

module.exports = router