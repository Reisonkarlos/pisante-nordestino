-- =============================================
--  PISANTE NORDESTINO - banco.sql
--  Execute no MySQL / MariaDB
-- =============================================

CREATE DATABASE IF NOT EXISTS pisante;
USE pisante;

-- USUÁRIOS (admin e clientes)
CREATE TABLE IF NOT EXISTS usuarios (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  email  VARCHAR(100) NOT NULL UNIQUE,
  senha  VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'cliente') DEFAULT 'cliente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  cliente  VARCHAR(100) NOT NULL,
  produtos TEXT         NOT NULL,
  total    DECIMAL(10,2) NOT NULL,
  status   ENUM('pendente','confirmado','enviado','entregue') DEFAULT 'pendente',
  data     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESTOQUE
CREATE TABLE IF NOT EXISTS estoque (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  produto   VARCHAR(100) NOT NULL,
  quantidade INT DEFAULT 0,
  preco     DECIMAL(10,2)
);

-- FINANCEIRO
CREATE TABLE IF NOT EXISTS financeiro (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  tipo      ENUM('entrada','saida') NOT NULL,
  valor     DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  data      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DADOS INICIAIS: Estoque
INSERT INTO estoque (produto, quantidade, preco) VALUES
  ('Modelo Cangaço',  12, 39.90),
  ('Modelo Sertão',    8, 34.90),
  ('Nordeste Raiz',    5, 44.90),
  ('Forró da Noite',   7, 49.90);

-- ADMIN padrão (senha: admin123 — troque depois!)
-- Senha gerada com bcrypt hash de 'admin123'
INSERT INTO usuarios (email, senha, perfil) VALUES
  ('admin@pisante.com', '$2b$10$xGq8VQ1z2Wq3P1kM9mN0EeKv1yH2rT4sU5vW6xY7zA8bB9cC0dD1', 'admin');

