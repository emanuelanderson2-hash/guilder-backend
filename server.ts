import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

const dbPath = isProduction
  ? "/data/guilder.db"
  : "guilder.db";

const db = new Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || "guilder_secret_key_2024";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    password TEXT,
    role TEXT NOT NULL, -- 'admin', 'client', 'delivery'
    access_code TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price_5g REAL,
    price_10g REAL,
    price_25g REAL,
    price_50g REAL,
    price_100g REAL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    delivery_id INTEGER,
    items TEXT, -- JSON string
    total_price REAL,
    delivery_fee REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'on_way', 'completed', 'cancelled'
    address TEXT,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES users(id),
    FOREIGN KEY(delivery_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    order_id INTEGER,
    content TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id),
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Simple migration for existing DBs
try {
  db.prepare("ALTER TABLE orders ADD COLUMN address TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE messages ADD COLUMN image_url TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE orders ADD COLUMN payment_received_method TEXT").run();
} catch (e) {}

// Initialize default settings
const pixKeyExists = db.prepare("SELECT * FROM settings WHERE key = 'pix_key'").get();
if (!pixKeyExists) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('pix_key', '');
}
const pixNameExists = db.prepare("SELECT * FROM settings WHERE key = 'pix_name'").get();
if (!pixNameExists) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('pix_name', '');
}


// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
 db.prepare("INSERT INTO users (name, password, role) VALUES (?, ?, ?)").run(
  "Admin Guilder",
  hashedPassword,
  "admin"
);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});
  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { name, password, accessCode } = req.body;
    
    let user;
    if (accessCode) {
      user = db.prepare("SELECT * FROM users WHERE access_code = ?").get(accessCode);
    } else {
      user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);
    }

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    if (user.status === 'blocked') return res.status(403).json({ message: "Usuário bloqueado" });

    if (password) {
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) return res.status(401).json({ message: "Senha inválida" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  });

  // Users
  app.get("/api/users", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const users = db.prepare("SELECT id, name, role, access_code, status, created_at FROM users").all();
    res.json(users);
  });

  app.post("/api/users", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { name, role, access_code } = req.body;
    try {
      db.prepare("INSERT INTO users (name, role, access_code) VALUES (?, ?, ?)").run(
        name, role, access_code
      );
      res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (e) {
      res.status(400).json({ message: "Erro ao criar usuário (nome ou código já existe)" });
    }
  });

  app.patch("/api/users/:id/status", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ message: "Status atualizado" });
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { name, description, image_url, price_5g, price_10g, price_25g, price_50g, price_100g, category } = req.body;
    db.prepare(`
      INSERT INTO products (name, description, image_url, price_5g, price_10g, price_25g, price_50g, price_100g, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, image_url, price_5g, price_10g, price_25g, price_50g, price_100g, category);
    res.status(201).json({ message: "Produto criado" });
  });

  // Orders
  app.get("/api/orders", authenticateToken, (req: any, res) => {
    let orders;
    if (req.user.role === 'admin') {
      orders = db.prepare(`
        SELECT o.*, c.name as client_name, d.name as delivery_name 
        FROM orders o 
        JOIN users c ON o.client_id = c.id 
        LEFT JOIN users d ON o.delivery_id = d.id
        ORDER BY o.created_at DESC
      `).all();
    } else if (req.user.role === 'delivery') {
      orders = db.prepare(`
        SELECT o.*, c.name as client_name 
        FROM orders o 
        JOIN users c ON o.client_id = c.id 
        WHERE o.delivery_id = ? OR (o.status = 'preparing' AND o.delivery_id IS NULL)
        ORDER BY o.created_at DESC
      `).all(req.user.id);
    } else {
      orders = db.prepare("SELECT * FROM orders WHERE client_id = ? ORDER BY created_at DESC").all(req.user.id);
    }
    res.json(orders.map((o: any) => ({ ...o, items: JSON.parse(o.items) })));
  });

  app.post("/api/orders", authenticateToken, (req: any, res) => {
    const { items, total_price, address, payment_method } = req.body;
    
    const result = db.prepare("INSERT INTO orders (client_id, items, total_price, address, payment_method) VALUES (?, ?, ?, ?, ?)").run(
      req.user.id, JSON.stringify(items), total_price, address, payment_method
    );
    res.status(201).json({ 
      message: "Pedido realizado com sucesso! O pagamento será feito na entrega.",
      orderId: result.lastInsertRowid 
    });
  });

  app.patch("/api/orders/:id/status", authenticateToken, (req: any, res) => {
    const { status, delivery_id, delivery_fee, payment_received_method } = req.body;
    
    if (req.user.role === 'admin') {
      if (delivery_id) {
        db.prepare("UPDATE orders SET status = ?, delivery_id = ?, delivery_fee = ? WHERE id = ?").run(
          status, delivery_id, delivery_fee, req.params.id
        );
      } else {
        db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
      }
    } else if (req.user.role === 'delivery') {
      // Delivery can pick up or complete
      if (status === 'on_way') {
        db.prepare("UPDATE orders SET status = ?, delivery_id = ? WHERE id = ?").run(status, req.user.id, req.params.id);
      } else if (status === 'completed') {
        db.prepare("UPDATE orders SET status = ?, payment_received_method = ? WHERE id = ? AND delivery_id = ?").run(
          status, payment_received_method || null, req.params.id, req.user.id
        );
      } else {
        db.prepare("UPDATE orders SET status = ? WHERE id = ? AND delivery_id = ?").run(status, req.params.id, req.user.id);
      }
    }
    res.json({ message: "Pedido atualizado" });
  });

  // Messages
  app.get("/api/messages/:orderId", authenticateToken, (req: any, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.role as sender_role 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.order_id = ?
      ORDER BY m.created_at ASC
    `).all(req.params.orderId);
    res.json(messages);
  });

  app.get("/api/chats", authenticateToken, (req: any, res) => {
    let chats;
    if (req.user.role === 'admin') {
      chats = db.prepare(`
        SELECT o.id as order_id, c.name as client_name, o.status,
        (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_time
        FROM orders o
        JOIN users c ON o.client_id = c.id
        WHERE o.status != 'completed' AND o.status != 'cancelled'
        ORDER BY last_time DESC, o.created_at DESC
      `).all();
    } else if (req.user.role === 'delivery') {
      chats = db.prepare(`
        SELECT o.id as order_id, c.name as client_name, o.status,
        (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_time
        FROM orders o
        JOIN users c ON o.client_id = c.id
        WHERE o.delivery_id = ? AND o.status != 'completed'
        ORDER BY last_time DESC, o.created_at DESC
      `).all(req.user.id);
    } else {
      chats = db.prepare(`
        SELECT o.id as order_id, 'Suporte Guilder' as client_name, o.status,
        (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_time
        FROM orders o
        WHERE o.client_id = ? AND o.status != 'completed'
        ORDER BY last_time DESC, o.created_at DESC
      `).all(req.user.id);
    }
    res.json(chats);
  });

  app.post("/api/messages", authenticateToken, (req: any, res) => {
    const { content, order_id, image_url } = req.body;
    if (!order_id) return res.status(400).json({ message: "Order ID is required" });
    
    db.prepare("INSERT INTO messages (sender_id, content, order_id, image_url) VALUES (?, ?, ?, ?)").run(
      req.user.id, content, order_id, image_url || null
    );
    res.status(201).json({ message: "Mensagem enviada" });
  });

  // Settings
  app.get("/api/settings", authenticateToken, (req: any, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const result: any = {};
    settings.forEach((s: any) => result[s.key] = s.value);
    res.json(result);
  });

  app.post("/api/settings", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { pix_key, pix_name } = req.body;
    if (pix_key !== undefined) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('pix_key', pix_key);
    }
    if (pix_name !== undefined) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('pix_name', pix_name);
    }
    res.json({ message: "Configurações atualizadas" });
  });

  // Stats for Admin Dashboard
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    
    const totalSold = db.prepare("SELECT SUM(total_price) as total FROM orders WHERE status = 'completed'").get().total || 0;
    const totalVolume = 0; // Simplified
    const inDelivery = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'on_way'").get().count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").get().count;
    const open = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending' OR status = 'preparing'").get().count;
    const activeClients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get().count;
    const ticketMedio = completed > 0 ? totalSold / completed : 0;

    res.json({
      totalSold,
      totalVolume,
      inDelivery,
      completed,
      open,
      activeClients,
      ticketMedio
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
}

startServer();
