import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        w.name as warehouse_name,
        c.name as customer_name,
        u.username as created_by_username
      FROM invoices i
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.created_by = u.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invoice by ID with lines
router.get('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const invoiceResult = await client.query(`
      SELECT 
        i.*,
        w.name as warehouse_name,
        c.name as customer_name,
        u.username as created_by_username
      FROM invoices i
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const linesResult = await client.query(`
      SELECT il.*, i.name as item_name
      FROM invoice_lines il
      LEFT JOIN items i ON il.item_id = i.id
      WHERE il.invoice_id = $1
    `, [id]);

    const collectionsResult = await client.query(`
      SELECT c.*, u.username as created_by_username
      FROM collections c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.invoice_id = $1
      ORDER BY c.collection_date DESC
    `, [id]);

    const invoice = invoiceResult.rows[0];
    invoice.lines = linesResult.rows;
    invoice.collections = collectionsResult.rows;

    await client.query('COMMIT');
    res.json(invoice);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Create invoice
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { 
      warehouse_id, 
      customer_id, 
      payment_method,
      invoice_date,
      discount = 0,
      lines 
    } = req.body;

    // Verify stock availability
    for (const line of lines) {
      const stockResult = await client.query(
        'SELECT quantity_in_stock FROM warehouse_stock WHERE warehouse_id = $1 AND item_id = $2',
        [warehouse_id, line.item_id]
      );

      if (stockResult.rows.length === 0 || stockResult.rows[0].quantity_in_stock < line.quantity) {
        throw new Error(`Insufficient stock for item ID ${line.item_id}`);
      }
    }
    
    // Determine initial invoice status based on payment method
    const initialStatus = payment_method === 'cash' ? 'settled' : 'pending_payment';
    
    // Create invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices (
        warehouse_id, 
        customer_id, 
        payment_method,
        invoice_date,
        discount,
        created_by,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        warehouse_id, 
        customer_id, 
        payment_method,
        invoice_date,
        discount,
        req.user.id,
        initialStatus
      ]
    );
    
    const invoice = invoiceResult.rows[0];
    
    // Create invoice lines
    for (const line of lines) {
      await client.query(
        `INSERT INTO invoice_lines (
          invoice_id, 
          item_id, 
          quantity, 
          unit_price,
          line_total
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          invoice.id, 
          line.item_id, 
          line.quantity, 
          line.unit_price,
          line.quantity * line.unit_price
        ]
      );

      // Update warehouse stock
      await client.query(
        `UPDATE warehouse_stock 
         SET quantity_in_stock = quantity_in_stock - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE warehouse_id = $2 AND item_id = $3`,
        [line.quantity, warehouse_id, line.item_id]
      );
    }

    // If payment method is cash, create collection record
    if (payment_method === 'cash') {
      // Get the updated invoice total
      const updatedInvoiceResult = await client.query(
        'SELECT total FROM invoices WHERE id = $1',
        [invoice.id]
      );
      const invoiceTotal = updatedInvoiceResult.rows[0].total;

      await client.query(
        `INSERT INTO collections (
          invoice_id,
          amount,
          collection_date,
          created_by
        ) VALUES ($1, $2, $3, $4)`,
        [invoice.id, invoiceTotal, invoice_date, req.user.id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(invoice);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ 
      message: error.message || 'Server error'
    });
  } finally {
    client.release();
  }
});

export default router;