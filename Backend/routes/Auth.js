const express = require('express');
const router = express.Router();
const pool = require('../Config/Postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nombre, email, password_hash, rol, avatar_url, descripcion, create_at } = req.body;
  try {
    const hash = await bcrypt.hash(password_hash, 10);
    const result = await pool.query(
      `INSERT INTO users (nombre, email, password_hash, rol, avatar_url, descripcion, create_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre, email, rol`,
      [nombre, email, hash, rol || 'user', avatar_url, descripcion, create_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET todos los usuarios (solo admin)
router.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, avatar_url, create_at FROM users ORDER BY create_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT editar usuario
router.put('/usuarios/:id', async (req, res) => {
  const { nombre, email, rol, avatar_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET nombre=$1, email=$2, rol=$3, avatar_url=$4 WHERE id=$5 RETURNING *`,
      [nombre, email, rol, avatar_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE usuario
router.delete('/usuarios/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;