import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, u.username as user_name 
      FROM warehouses w 
      LEFT JOIN users u ON w.user_id = u.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, user_id } = req.body;
    const result = await pool.query(
      'INSERT INTO warehouses (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, user_id } = req.body;
    const result = await pool.query(
      'UPDATE warehouses SET name = $1, user_id = $2 WHERE id = $3 RETURNING *',
      [name, user_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/stock', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        ws.*,
        i.name as item_name,
        i.item_price
      FROM warehouse_stock ws
      LEFT JOIN items i ON ws.item_id = i.id
      WHERE ws.warehouse_id = $1
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;