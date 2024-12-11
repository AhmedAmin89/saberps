import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const mainPool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'sa',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

const dbName = process.env.POSTGRES_DB || 'inv_sys';

async function initializeDatabase() {
  try {
    const dbCheckResult = await mainPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await mainPool.query(`CREATE DATABASE ${dbName}`);
    }

    const dbPool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'sa',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: dbName,
    });

    // Create or modify tables
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS items (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        item_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS warehouses (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vendors (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        mobile_number VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS import_orders (
        id BIGSERIAL PRIMARY KEY,
        warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE,
        vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
        order_date DATE NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS import_order_items (
        id BIGSERIAL PRIMARY KEY,
        import_order_id BIGINT REFERENCES import_orders(id) ON DELETE CASCADE,
        item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS warehouse_stock (
        id BIGSERIAL PRIMARY KEY,
        warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE,
        item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
        quantity_in_stock INTEGER NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(warehouse_id, item_id)
      );

      CREATE TABLE IF NOT EXISTS transfer_requests (
        id BIGSERIAL PRIMARY KEY,
        from_warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE,
        to_warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transfer_request_items (
        id BIGSERIAL PRIMARY KEY,
        transfer_request_id BIGINT REFERENCES transfer_requests(id) ON DELETE CASCADE,
        item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id BIGSERIAL PRIMARY KEY,
        warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE,
        customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
        invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
        payment_method VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoice_lines (
        id BIGSERIAL PRIMARY KEY,
        invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
        item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(10,2) NOT NULL,
        line_total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collections (
        id BIGSERIAL PRIMARY KEY,
        invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create trigger to update import_orders total_cost
      CREATE OR REPLACE FUNCTION update_import_order_total_cost()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE import_orders
        SET total_cost = (
          SELECT SUM(quantity * unit_price)
          FROM import_order_items
          WHERE import_order_id = NEW.import_order_id
        )
        WHERE id = NEW.import_order_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_total_cost_trigger ON import_order_items;
      CREATE TRIGGER update_total_cost_trigger
      AFTER INSERT OR UPDATE OR DELETE ON import_order_items
      FOR EACH ROW
      EXECUTE FUNCTION update_import_order_total_cost();

      -- Create trigger to update warehouse_stock on import order completion
      CREATE OR REPLACE FUNCTION update_warehouse_stock()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
          INSERT INTO warehouse_stock (warehouse_id, item_id, quantity_in_stock)
          SELECT 
            NEW.warehouse_id,
            ioi.item_id,
            ioi.quantity
          FROM import_order_items ioi
          WHERE ioi.import_order_id = NEW.id
          ON CONFLICT (warehouse_id, item_id) 
          DO UPDATE SET
            quantity_in_stock = warehouse_stock.quantity_in_stock + EXCLUDED.quantity_in_stock,
            updated_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_stock_trigger ON import_orders;
      CREATE TRIGGER update_stock_trigger
      AFTER UPDATE ON import_orders
      FOR EACH ROW
      EXECUTE FUNCTION update_warehouse_stock();

      -- Create trigger to update warehouse_stock on transfer request completion
      CREATE OR REPLACE FUNCTION update_stock_on_transfer()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
          -- Decrease stock in source warehouse
          UPDATE warehouse_stock ws
          SET 
            quantity_in_stock = ws.quantity_in_stock - tri.quantity,
            updated_at = CURRENT_TIMESTAMP
          FROM transfer_request_items tri
          WHERE 
            tri.transfer_request_id = NEW.id
            AND ws.warehouse_id = NEW.from_warehouse_id
            AND ws.item_id = tri.item_id;

          -- Increase stock in destination warehouse
          INSERT INTO warehouse_stock (warehouse_id, item_id, quantity_in_stock)
          SELECT 
            NEW.to_warehouse_id,
            tri.item_id,
            tri.quantity
          FROM transfer_request_items tri
          WHERE tri.transfer_request_id = NEW.id
          ON CONFLICT (warehouse_id, item_id) 
          DO UPDATE SET
            quantity_in_stock = warehouse_stock.quantity_in_stock + EXCLUDED.quantity_in_stock,
            updated_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_stock_on_transfer_trigger ON transfer_requests;
      CREATE TRIGGER update_stock_on_transfer_trigger
      AFTER UPDATE ON transfer_requests
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_on_transfer();

      -- Create trigger to update invoice totals
      CREATE OR REPLACE FUNCTION update_invoice_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE invoices
        SET 
          subtotal = (
            SELECT COALESCE(SUM(line_total), 0)
            FROM invoice_lines
            WHERE invoice_id = NEW.invoice_id
          ),
          total = (
            SELECT COALESCE(SUM(line_total), 0)
            FROM invoice_lines
            WHERE invoice_id = NEW.invoice_id
          ) - discount,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.invoice_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON invoice_lines;
      CREATE TRIGGER update_invoice_totals_trigger
      AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
      FOR EACH ROW
      EXECUTE FUNCTION update_invoice_totals();

      -- Create trigger to update invoice status based on collections
      CREATE OR REPLACE FUNCTION update_invoice_status()
      RETURNS TRIGGER AS $$
      BEGIN
        WITH collection_totals AS (
          SELECT 
            invoice_id,
            SUM(amount) as total_collected
          FROM collections
          GROUP BY invoice_id
        )
        UPDATE invoices i
        SET 
          status = 
            CASE 
              WHEN ct.total_collected >= i.total THEN 'settled'
              WHEN ct.total_collected > 0 THEN 'partially_settled'
              ELSE 'pending_payment'
            END,
          updated_at = CURRENT_TIMESTAMP
        FROM collection_totals ct
        WHERE i.id = ct.invoice_id
        AND i.id = NEW.invoice_id;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_invoice_status_trigger ON collections;
      CREATE TRIGGER update_invoice_status_trigger
      AFTER INSERT OR UPDATE OR DELETE ON collections
      FOR EACH ROW
      EXECUTE FUNCTION update_invoice_status();

      -- Create trigger to update warehouse_stock on invoice completion
      CREATE OR REPLACE FUNCTION update_stock_on_invoice()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
          UPDATE warehouse_stock ws
          SET 
            quantity_in_stock = ws.quantity_in_stock - il.quantity,
            updated_at = CURRENT_TIMESTAMP
          FROM invoice_lines il
          WHERE 
            il.invoice_id = NEW.id
            AND ws.warehouse_id = NEW.warehouse_id
            AND ws.item_id = il.item_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_stock_on_invoice_trigger ON invoices;
      CREATE TRIGGER update_stock_on_invoice_trigger
      AFTER UPDATE ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_on_invoice();
    `);

    // Check if admin user exists
    const adminCheck = await dbPool.query(
      "SELECT 1 FROM users WHERE username = 'admin'"
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await dbPool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Default admin user created');
    }

    console.log('Database initialization completed successfully');
    await dbPool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await mainPool.end();
  }
}

initializeDatabase();