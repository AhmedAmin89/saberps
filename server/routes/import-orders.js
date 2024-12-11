import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT io.*, w.name as warehouse_name, v.name as vendor_name
      FROM import_orders io
      LEFT JOIN warehouses w ON io.warehouse_id = w.id
      LEFT JOIN vendors v ON io.vendor_id = v.id
      ORDER BY io.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(`
      SELECT io.*, w.name as warehouse_name, v.name as vendor_name
      FROM import_orders io
      LEFT JOIN warehouses w ON io.warehouse_id = w.id
      LEFT JOIN vendors v ON io.vendor_id = v.id
      WHERE io.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Import order not found' });
    }

    const itemsResult = await pool.query(`
      SELECT ioi.*, i.name as item_name
      FROM import_order_items ioi
      LEFT JOIN items i ON ioi.item_id = i.id
      WHERE ioi.import_order_id = $1
    `, [id]);

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { warehouse_id, vendor_id, order_date, items } = req.body;
    
    const orderResult = await client.query(
      'INSERT INTO import_orders (warehouse_id, vendor_id, order_date) VALUES ($1, $2, $3) RETURNING *',
      [warehouse_id, vendor_id, order_date]
    );
    
    const order = orderResult.rows[0];
    
    for (const item of items) {
      await client.query(
        'INSERT INTO import_order_items (import_order_id, item_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.item_id, item.quantity, item.unit_price]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE import_orders SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Import order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE import_orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Import order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;