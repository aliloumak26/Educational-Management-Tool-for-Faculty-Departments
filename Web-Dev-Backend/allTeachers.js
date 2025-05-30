const express = require('express')
const router = express.Router()
const pool = require('./config/db')

// GET tous les enseignants (id et nom complet uniquement, sans pagination)
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query

    let query = `
      SELECT 
        u.id,
        u.lastName,
        u.firstName,
        u.grade,
        u.gender,
        u.phone,
        u.email,
        u.statut,
        CONCAT(u.lastName, ' ', u.firstName) as name
      FROM users u
      
    `

    const params = []

    if (search) {
      query += ` AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.id LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [teachers] = await pool.query(query, params)

    res.json({
      teachers,
      total: teachers.length
    })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET un enseignant spécifique (id et nom complet uniquement)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [teacher] = await pool.query(`
      SELECT 
  u.id,
  u.lastName,
  u.firstName,
  u.grade,
  u.gender,
  u.phone,
  u.email,
  u.statut,
  CONCAT(u.lastName, ' ', u.firstName) as name
      FROM users u
      WHERE u.id = ? AND u.role = 'teacher'
    `, [id])

    if (!teacher.length) return res.status(404).json({ error: 'Teacher not found' })

    res.json(teacher[0])
  } catch (error) {
    console.error('Error fetching teacher:', error)
    res.status(500).json({ error: 'Server error' })
  }


})


module.exports = router