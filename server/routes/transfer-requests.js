import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all transfer requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tr.*,
        fw.name as from_warehouse_name,
        tw.name as to_warehouse_name,
        u.username as created_by_username
      FROM transfer_requests tr
      LEFT JOIN warehouses fw ON tr.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON tr.to_warehouse_id = tw.id
      LEFT JOIN users u ON tr.created_by = u.id
      ORDER BY tr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transfer request by ID with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const requestResult = await pool.query(`
      SELECT 
        tr.*,
        fw.name as from_warehouse_name,
        tw.name as to_warehouse_name,
        u.username as created_by_username
      FROM transfer_requests tr
      LEFT JOIN warehouses fw ON tr.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON tr.to_warehouse_id = tw.id
      LEFT JOIN users u ON tr.created_by = u.id
      WHERE tr.id = $1
    `, [id]);

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    const itemsResult = await pool.query(`
      SELECT tri.*, i.name as item_name, i.item_price
      FROM transfer_request_items tri
      LEFT JOIN items i ON tri.item_id = i.id
      WHERE tri.transfer_request_id = $1
    `, [id]);

    const request = requestResult.rows[0];
    request.items = itemsResult.rows;

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create transfer request
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { from_warehouse_id, to_warehouse_id, items } = req.body;
    
    const requestResult = await client.query(
      `INSERT INTO transfer_requests (from_warehouse_id, to_warehouse_id, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [from_warehouse_id, to_warehouse_id, req.user.id]
    );
    
    const request = requestResult.rows[0];
    
    for (const item of items) {
      await client.query(
        `INSERT INTO transfer_request_items (transfer_request_id, item_id, quantity)
         VALUES ($1, $2, $3)`,
        [request.id, item.item_id, item.quantity]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(request);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Complete transfer request
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE transfer_requests 
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel transfer request
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE transfer_requests 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;