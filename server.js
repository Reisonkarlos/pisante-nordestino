// =============================================
//  PISANTE NORDESTINO - server.js
//  Backend Express + MySQL2
// =============================================

import express from 'express';
import mysql2  from 'mysql2/promise';
import bcrypt  from 'bcryptjs';
import session from 'express-session';
import path    from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
//  MIDDLEWARES
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'pisante-nordestino-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));

// =============================================
//  BANCO DE DADOS
// =============================================
const db = await mysql2.createConnection({
  host:    process.env.MYSQLHOST        ||  'localhost',
  user:    process.env.MYSQLUSER        ||  'root',
  password: process.env.MYSQLPASSWORD   ||  '',
  database: process.env.MYSQLDATABASE   ||  'pisante',
  port:     process.env.MYSQLPORT       ||  3306
});

console.log('✅ Banco de dados conectado');

// =============================================
//  ROTAS PÚBLICAS
// =============================================

// Servir index.html em qualquer rota não encontrada
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================
//  ROTA: AUTH - Login
// =============================================
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.json({ sucesso: false, msg: 'Preencha email e senha' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?', [email]
    );

    if (rows.length === 0) {
      return res.json({ sucesso: false, msg: 'Usuário não encontrado' });
    }

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.json({ sucesso: false, msg: 'Senha incorreta' });
    }

    req.session.user = { id: usuario.id, email: usuario.email };
    res.json({ sucesso: true, msg: 'Login realizado!' });

  } catch (err) {
    console.error(err);
    res.json({ sucesso: false, msg: 'Erro no servidor' });
  }
});

// =============================================
//  ROTA: AUTH - Cadastro
// =============================================
app.post('/api/cadastro', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.json({ sucesso: false, msg: 'Preencha todos os campos' });
  }

  try {
    const [existe] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?', [email]
    );

    if (existe.length > 0) {
      return res.json({ sucesso: false, msg: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(senha, 10);
    await db.execute(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hash]
    );

    res.json({ sucesso: true, msg: 'Cadastro realizado!' });

  } catch (err) {
    console.error(err);
    res.json({ sucesso: false, msg: 'Erro no servidor' });
  }
});

// =============================================
//  ROTA: PEDIDOS - Salvar
// =============================================
app.post('/api/pedidos', async (req, res) => {
  const { cliente, produtos, total } = req.body;

  if (!cliente || !produtos || !total) {
    return res.json({ sucesso: false, msg: 'Dados incompletos' });
  }

  try {
    await db.execute(
      'INSERT INTO pedidos (cliente, produtos, total) VALUES (?, ?, ?)',
      [cliente, produtos, total]
    );

    res.json({ sucesso: true, msg: 'Pedido salvo com sucesso!' });

  } catch (err) {
    console.error(err);
    res.json({ sucesso: false, msg: 'Erro ao salvar pedido' });
  }
});

// =============================================
//  ROTA: PEDIDOS - Listar (Admin)
// =============================================
app.get('/api/admin/pedidos', verificarAdmin, async (req, res) => {
  try {
    const [pedidos] = await db.execute(
      'SELECT * FROM pedidos ORDER BY data DESC'
    );
    res.json({ sucesso: true, pedidos });
  } catch (err) {
    res.json({ sucesso: false, msg: 'Erro ao buscar pedidos' });
  }
});

// =============================================
//  ROTA: DASHBOARD - Vendas por dia
// =============================================
app.get('/api/admin/dashboard', verificarAdmin, async (req, res) => {
  try {
    const [dados] = await db.execute(
      'SELECT DATE(data) as dia, SUM(total) as total, COUNT(*) as pedidos FROM pedidos GROUP BY dia ORDER BY dia DESC'
    );
    res.json({ sucesso: true, dados });
  } catch (err) {
    res.json({ sucesso: false, msg: 'Erro ao buscar dashboard' });
  }
});

// =============================================
//  MIDDLEWARE: Verificar Admin
// =============================================
function verificarAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ sucesso: false, msg: 'Não autorizado' });
  }
  next();
}

// =============================================
//  INICIAR SERVIDOR
// =============================================
app.listen(PORT, () => {
  console.log(`🌵 Pisante Nordestino rodando em http://localhost:${PORT}`);
});

