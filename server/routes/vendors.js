import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, mobile_number } = req.body;
    const result = await pool.query(
      'INSERT INTO vendors (name, address, mobile_number) VALUES ($1, $2, $3) RETURNING *',
      [name, address, mobile_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, mobile_number } = req.body;
    const result = await pool.query(
      'UPDATE vendors SET name = $1, address = $2, mobile_number = $3 WHERE id = $4 RETURNING *',
      [name, address, mobile_number, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;