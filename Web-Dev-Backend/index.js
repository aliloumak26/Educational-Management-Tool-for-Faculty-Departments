require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const modulesRoutes = require('./modulesRoutes'); // Chemin corrigé
const organigramRoutes = require('./organigramRoutes');
const fdvRoutes = require('./fdvRoutes');
const allTeachersRoutes = require("./allTeachers")
const moduleEachRoutes = require("./moduleEach")
const infos = require("./infosEach")
const addTeacherRoutes = require("./addTeacher")
const teacherinfosRoutes = require("./teacherinfosRoutes")
const moduleRoutes = require("./moduleRoutes")
const teachercharges = require("./teacher-charges")
const cahierDeChargesRoutes = require("./cahierDeChargesRoutes")
const forgotPasswordRoutes = require("./forgotPasswordRoutes") 



const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], // Ajoutez x-auth-token ici
  credentials: true
}));

// Logging des requêtes (nouveau middleware ajouté)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/module", moduleRoutes)
app.use('/api/modules', modulesRoutes);
app.use('/api/organigram', organigramRoutes);

// Route de test (nouvelle route ajoutée)
app.get('/api/status', (req, res) => {
  res.json({ status: 'API fonctionnelle', timestamp: new Date() });
});

// Gestion des erreurs améliorée
app.use((err, req, res, next) => {
  console.error('Erreur:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use("/api/teachers", allTeachersRoutes)
app.use("/api/profs", moduleEachRoutes)
app.use("/api/infos", infos)
app.use("/api/addteacher", addTeacherRoutes)
app.use('/api/teachers', teacherinfosRoutes)
app.use('/api/teacher-charge', teachercharges)
app.use("/api/cahier-de-charges", cahierDeChargesRoutes) 
app.use("/api/auth", forgotPasswordRoutes) 


app.use('/api/fdv', fdvRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServeur démarré sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL API: http://localhost:${PORT}/api`);
  console.log(`URL de test: http://localhost:${PORT}/api/status\n`);
});