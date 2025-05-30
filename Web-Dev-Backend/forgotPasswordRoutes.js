const express = require("express")
const nodemailer = require("nodemailer")
const pool = require("./config/db") // Utilise votre config existante

const router = express.Router()

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

// Fonction pour envoyer l'email avec le mot de passe
async function sendPasswordEmail(email, password, userName) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Organigram" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔑 Votre mot de passe - Organigram",
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
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
              background: linear-gradient(135deg, #2d4de0 0%, #1e3a8a 100%);
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
            .warning { 
              background: #fffbeb; 
              border: 1px solid #f6e05e; 
              border-radius: 8px;
              padding: 20px; 
              margin: 25px 0;
              border-left: 4px solid #ed8936;
            }
            .warning-title {
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
            .icon {
              font-size: 20px;
              margin-right: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Votre mot de passe Organigramme</h1>
            </div>
            <div class="content">
              <div class="greeting">Bonjour <strong>${userName}</strong> ! 👋</div>
              <p>Vous avez demandé votre mot de passe pour votre compte Organigram.</p>
              
              <div class="password-section">
                <div class="password-label"><strong>Votre mot de passe est :</strong></div>
                <div class="password">${password}</div>
              </div>
              
              <div class="credentials">
                <h3>📋 Vos informations de connexion :</h3>
                <div class="credential-item">
                  <span nom et prénom : ${userName}</span>
                  <span class="credential-label">👤 Nom et Prénom :</span> ${userName}
                </div>
                <div class="credential-item">
                  <span class="credential-label">🔐 Mot de passe :</span> ${password}
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="http://localhost:5173/" class="login-button">
                   Se connecter maintenant
                </a>
              </div>
              
              <div class="warning">
                <div class="warning-title">⚠️ Important pour votre sécurité :</div>
                
              </div>
              
              <p>Si vous n'avez pas demandé cette information, veuillez nous contacter immédiatement à <strong>${process.env.EMAIL_USER}</strong>.</p>
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
        Bonjour ${userName} !
        
        Vous avez demandé votre mot de passe pour votre compte Organigram.
        
        Votre mot de passe : ${password}
        
        Informations de connexion :
        - Email : ${email}
        - Mot de passe : ${password}
        
        Connectez-vous ici : http://localhost:5173/
        
        IMPORTANT : Pour votre sécurité, changez votre mot de passe après connexion.
        
        Si vous n'avez pas demandé cette information, contactez-nous immédiatement.
        
        Équipe Organigram
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("✅ Email avec mot de passe envoyé à:", email)
    return true
  } catch (error) {
    console.error("❌ Erreur email:", error)
    throw new Error("Échec de l'envoi de l'email")
  }
}

// Route: Mot de passe oublié (envoie le mot de passe existant)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    // Validation de l'email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "L'adresse email est requise.",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer une adresse email valide.",
      })
    }

    console.log("🔍 Recherche de l'utilisateur avec l'email:", email)

    // Nettoyer l'email
    const cleanEmail = email.trim().toLowerCase()
    console.log("🧹 Email nettoyé:", cleanEmail)

    // Chercher dans TOUTES les colonnes d'email possibles
    const [userRows] = await pool.execute(
      `
      SELECT id, email, statut, lastName, firstName, password 
      FROM users 
      WHERE LOWER(TRIM(COALESCE(email, ''))) = ? 
    `,
      [cleanEmail],
    )

    console.log("📊 Nombre de résultats trouvés:", userRows.length)

    if (userRows.length === 0) {
      console.log("❌ Aucun utilisateur trouvé")
      return res.status(404).json({
        success: false,
        message: "Aucun compte trouvé avec cette adresse email.",
      })
    }

    // Prendre le premier utilisateur trouvé
    const user = userRows[0]
    console.log("✅ Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      statut: user.statut,
      firstName: user.firstName,
      lastName: user.lastName,
    })

    // Utiliser l'email fourni par l'utilisateur pour l'envoi
    const emailToUse = email
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Utilisateur"

    // Envoyer l'email avec le mot de passe
    await sendPasswordEmail(emailToUse, user.password, fullName)

    console.log("✅ Processus de récupération de mot de passe terminé avec succès")

    res.status(200).json({
      success: true,
      message: "Votre mot de passe a été envoyé par email ! Vérifiez votre boîte de réception.",
      redirectTo: "/",
    })
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du mot de passe:", error)

    res.status(500).json({
      success: false,
      message: "Une erreur interne s'est produite. Veuillez réessayer.",
    })
  }
})

module.exports = router