import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all collections
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        i.total as invoice_total,
        cu.name as customer_name,
        u.username as created_by_username
      FROM collections c
      LEFT JOIN invoices i ON c.invoice_id = i.id
      LEFT JOIN customers cu ON i.customer_id = cu.id
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.collection_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create collection
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { invoice_id, amount, collection_date } = req.body;
    
    // Get invoice total and already collected amount
    const invoiceResult = await client.query(
      `SELECT i.total, COALESCE(SUM(c.amount), 0) as collected
       FROM invoices i
       LEFT JOIN collections c ON i.id = c.invoice_id
       WHERE i.id = $1
       GROUP BY i.id, i.total`,
      [invoice_id]
    );
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { total, collected } = invoiceResult.rows[0];
    const remainingAmount = total - collected;

    // Verify collection amount doesn't exceed remaining balance
    if (amount > remainingAmount) {
      return res.status(400).json({ 
        message: 'Collection amount exceeds invoice remaining balance' 
      });
    }

    const result = await client.query(
      `INSERT INTO collections (
        invoice_id, 
        amount, 
        collection_date,
        created_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [invoice_id, amount, collection_date, req.user.id]
    );
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;