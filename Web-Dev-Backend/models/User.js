class User {
    constructor(pool) {
      this.pool = pool;
    }
  
    async findByName(firstName, lastName) {
      const [rows] = await this.pool.query(
        'SELECT * FROM users WHERE lastName = ? AND firstName = ?', 
        [firstName, lastName]
      );
      return rows[0];
    }
    
    async updateUser(id, userData) {
    const { firstName, lastName, grade, gender, phone, email, usthbEmail } = userData;
    
    const [result] = await this.pool.query(
      `UPDATE users SET
        firstName = ?,
        lastName = ?,
        grade = ?,
        gender = ?,
        phone = ?,
        email = ?,
        usthbEmail = ?
       WHERE id = ?`,
      [firstName, lastName, grade, gender, phone, email, usthbEmail, id]
    );
    
    return result.affectedRows > 0;
  }

  // Dans votre fichier models/User.js
  async deleteUser(id) {
    // Démarrer une connexion pour la transaction
    const connection = await this.pool.getConnection();
    
    try {
      // Démarrer la transaction
      await connection.beginTransaction();
      
      // Supprimer d'abord de la table teachers
      const [teacherResult] = await connection.query('DELETE FROM teachers WHERE id = ?', [id]);
      console.log('Suppression de teachers:', teacherResult.affectedRows, 'lignes affectées');
      
      // Ensuite supprimer de la table users
      const [userResult] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
      console.log('Suppression de users:', userResult.affectedRows, 'lignes affectées');
      
      // Valider la transaction
      await connection.commit();
      
      // Retourner true si au moins une des suppressions a affecté des lignes
      return teacherResult.affectedRows > 0 || userResult.affectedRows > 0;
      
    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await connection.rollback();
      console.error('Erreur lors de la suppression:', error);
      throw error;
    } finally {
      // Libérer la connexion dans tous les cas
      connection.release();
    }
  }

  // 3. Méthodes de recherche
  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findByName(firstName, lastName) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE firstName = ? AND lastName = ?',
      [firstName, lastName]
    );
    return rows[0] || null;
  }

  async findAllTeachers() {
    const [rows] = await this.pool.query(
      'SELECT id, firstName, lastName, grade, gender, phone, email, usthbEmail FROM users WHERE role = "teacher"'
    );
    return rows;
  }

    async createUser(userData) {
      const { firstName, lastName, password, role = 'teacher' } = userData;
      const [result] = await this.pool.query(
        'INSERT INTO users (lastName, firstName, password, role) VALUES (?, ?, ?, ?)',
        [firstName, lastName, password, role]
      );
      return result.insertId;
    }
  
    // Méthode optionnelle pour vérifier le mot de passe
    async verifyPassword(userId, password) {
      const [rows] = await this.pool.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );
    
    }
  }
  
  module.exports = User;