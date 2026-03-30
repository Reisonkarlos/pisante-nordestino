# 🌵 Pisante Nordestino — PWA

E-commerce de chinelos nordestinos com PWA, carrinho, chatbot e integração WhatsApp.

---

## 📁 Estrutura

```
pisante-nordestino/
├── public/
│   ├── index.html        ← App principal (PWA)
│   ├── app.js            ← Lógica: carrinho, chat, pedido
│   ├── manifest.json     ← Configuração PWA
│   └── service-worker.js ← Cache offline
├── server.js             ← Backend Express + MySQL
├── package.json
├── banco.sql             ← Estrutura do banco
└── README.md
```

---

## 🚀 Como rodar no Termux

### 1. Instalar dependências
```bash
pkg update
pkg install nodejs mariadb
```

### 2. Iniciar banco de dados
```bash
mysqld_safe &
mysql -u root < banco.sql
```

### 3. Copiar projeto para home
```bash
cp -r pisante-nordestino ~/
cd ~/pisante-nordestino
```

### 4. Instalar pacotes Node
```bash
npm install
```

### 5. Iniciar servidor
```bash
npm start
```

### 6. Acessar no Chrome do Android
```
http://localhost:3000
```

### 7. Instalar como app
> Chrome → Menu (⋮) → **Adicionar à tela inicial**

---

## ✅ Funcionalidades

- [x] Catálogo de produtos com estoque
- [x] Carrinho com remoção de itens
- [x] Checkout com nome, endereço, cidade
- [x] Finalizar via WhatsApp com desconto PIX
- [x] Salvar pedido no banco MySQL
- [x] Chatbot de atendimento
- [x] PWA instalável (offline ready)
- [x] Backend Express com sessão
- [x] API REST para pedidos e admin

---

## 🔧 Variáveis para trocar

| Arquivo    | Campo                          | Valor                  |
|------------|-------------------------------|------------------------|
| app.js     | `wa.me/5585999999999`         | Seu WhatsApp           |
| server.js  | `password: ''`                | Senha do MySQL         |
| server.js  | `pisante-nordestino-secret`   | Chave de sessão        |

# pisante-nordestino
