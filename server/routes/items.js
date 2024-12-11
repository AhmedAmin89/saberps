import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, item_price } = req.body;
    const result = await pool.query(
      'INSERT INTO items (name, item_price) VALUES ($1, $2) RETURNING *',
      [name, item_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, item_price } = req.body;
    const result = await pool.query(
      'UPDATE items SET name = $1, item_price = $2 WHERE id = $3 RETURNING *',
      [name, item_price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;