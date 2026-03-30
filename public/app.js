// =============================================
//  PISANTE NORDESTINO - app.js
//  Base: carrinho, produtos, chatbot, pedido
// =============================================

// --- DADOS DOS PRODUTOS ---
const produtos = [
  { id: 1, nome: "Modelo Cangaço", preco: 39.90, emoji: "👡", estoque: 12 },
  { id: 2, nome: "Modelo Sertão",  preco: 34.90, emoji: "🌵", estoque: 8  },
  { id: 3, nome: "Nordeste Raiz",  preco: 44.90, emoji: "☀️", estoque: 5  },
  { id: 4, nome: "Forró da Noite", preco: 49.90, emoji: "🎵", estoque: 7  },
];

// --- ESTADO DO CARRINHO ---
let carrinho = [];
let total = 0;

// =============================================
//  NAVEGAÇÃO
// =============================================
function ir(secao) {
  document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativo'));
  document.querySelectorAll('header nav a').forEach(a => a.classList.remove('ativo'));
  document.getElementById('sec-' + secao).classList.add('ativo');

  if (secao === 'carrinho') renderCarrinho();
  if (secao === 'chat') iniciarChat();
}

// =============================================
//  RENDERIZAR PRODUTOS
// =============================================
function renderProdutos() {
  const container = document.getElementById('lista-produtos');
  container.innerHTML = '';

  produtos.forEach(p => {
    const div = document.createElement('div');
    div.className = 'produto';
    div.innerHTML = `
      <div class="produto-emoji">${p.emoji}</div>
      <h3>${p.nome}</h3>
      <div class="preco">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
      <div class="estoque">📦 ${p.estoque} disponíveis</div>
      <button class="btn-comprar" onclick="addCarrinho(${p.id})">Adicionar 🛒</button>
    `;
    container.appendChild(div);
  });
}

// =============================================
//  CARRINHO
// =============================================
function addCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  carrinho.push({ ...produto });
  total = carrinho.reduce((s, i) => s + i.preco, 0);

  atualizarBarra();
  mostrarNotif(`✅ ${produto.nome} adicionado!`);
}

function removerItem(index) {
  carrinho.splice(index, 1);
  total = carrinho.reduce((s, i) => s + i.preco, 0);
  atualizarBarra();
  renderCarrinho();
}

function atualizarBarra() {
  document.getElementById('bar-qtd').textContent = carrinho.length;
  document.getElementById('bar-total').textContent = total.toFixed(2).replace('.', ',');

  const badge = document.getElementById('badge-qtd');
  badge.innerHTML = carrinho.length > 0
    ? `<span class="badge">${carrinho.length}</span>`
    : '';
}

function renderCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  const resumo = document.getElementById('resumo-total');

  lista.innerHTML = '';

  if (carrinho.length === 0) {
    lista.innerHTML = '<div class="vazio">🛒 Carrinho vazio</div>';
    resumo.style.display = 'none';
    return;
  }

  carrinho.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'item-carrinho';
    div.innerHTML = `
      <div>
        <div class="nome">${item.emoji} ${item.nome}</div>
        <div class="preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
      </div>
      <button class="btn-remover" onclick="removerItem(${i})">✕</button>
    `;
    lista.appendChild(div);
  });

  document.getElementById('total-carrinho').textContent =
    'R$ ' + total.toFixed(2).replace('.', ',');
  resumo.style.display = 'block';
}

// =============================================
//  FINALIZAR PEDIDO
// =============================================
function finalizarPedido() {
  const nome     = document.getElementById('ck-nome').value.trim();
  const endereco = document.getElementById('ck-endereco').value.trim();
  const cidade   = document.getElementById('ck-cidade').value.trim();
  const pagamento= document.getElementById('ck-pagamento').value;
  const obs      = document.getElementById('ck-obs').value.trim();

  if (!nome || !endereco || !cidade) {
    alert('⚠️ Preencha nome, endereço e cidade.');
    return;
  }

  if (carrinho.length === 0) {
    alert('⚠️ Carrinho vazio! Adicione produtos primeiro.');
    ir('loja');
    return;
  }

  // Desconto PIX
  let totalFinal = total;
  if (pagamento === 'pix') totalFinal = total * 0.95;

  // Montar mensagem WhatsApp
  let msg = `🌵 *PEDIDO PISANTE NORDESTINO*%0A%0A`;
  msg += `👤 *Cliente:* ${nome}%0A`;
  msg += `📍 *Endereço:* ${endereco}, ${cidade}%0A`;
  msg += `💳 *Pagamento:* ${pagamento.toUpperCase()}%0A%0A`;
  msg += `*ITENS:*%0A`;

  carrinho.forEach(item => {
    msg += `- ${item.emoji} ${item.nome} — R$${item.preco.toFixed(2)}%0A`;
  });

  if (pagamento === 'pix') {
    msg += `%0A🏷️ Subtotal: R$${total.toFixed(2)}%0A`;
    msg += `✅ Desconto PIX (5%): -R$${(total * 0.05).toFixed(2)}%0A`;
  }

  msg += `%0A💰 *TOTAL: R$${totalFinal.toFixed(2)}*`;

  if (obs) msg += `%0A%0A📝 Obs: ${obs}`;

  // Salvar pedido no backend
  salvarPedido(nome, totalFinal);

  // Abrir WhatsApp
  window.open(`https://wa.me/5585996922917?text=${msg}`);
}

// =============================================
//  SALVAR PEDIDO NO BACKEND
// =============================================
async function salvarPedido(cliente, totalFinal) {
  try {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente,
        produtos: JSON.stringify(carrinho),
        total: totalFinal
      })
    });
    const data = await res.json();
    if (data.sucesso) {
      mostrarNotif('📦 Pedido salvo com sucesso!');
      carrinho = [];
      total = 0;
      atualizarBarra();
    }
  } catch (e) {
    console.log('Backend offline — pedido enviado só pelo WhatsApp');
  }
}

// =============================================
//  CHATBOT
// =============================================
let chatIniciado = false;

function iniciarChat() {
  if (chatIniciado) return;
  chatIniciado = true;
  adicionarMsg('bot', '👋 Olá! Sou o Pisantinho, seu atendente virtual! Posso te ajudar com preços, modelos, entrega e mais. O que você quer saber? 😄');
}

function enviarMsg() {
  const input = document.getElementById('chat-in');
  const msg = input.value.trim();
  if (!msg) return;

  adicionarMsg('user', msg);
  input.value = '';

  setTimeout(() => {
    const resposta = respostaIA(msg);
    adicionarMsg('bot', resposta);
  }, 600);
}

function adicionarMsg(tipo, texto) {
  const div = document.createElement('div');
  div.className = `msg ${tipo}`;
  div.textContent = texto;
  const container = document.getElementById('chat-msgs');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function respostaIA(msg) {
  msg = msg.toLowerCase();

  if (msg.includes('preço') || msg.includes('valor') || msg.includes('quanto')) {
    return '💰 Nossos modelos custam a partir de R$34,90! Temos: Cangaço (R$39,90), Sertão (R$34,90), Nordeste Raiz (R$44,90) e Forró da Noite (R$49,90).';
  }
  if (msg.includes('entrega') || msg.includes('frete') || msg.includes('prazo')) {
    return '🚚 Entregamos em todo o Nordeste! Prazo de 3 a 7 dias úteis. Frete calculado na finalização. Entrega expressa disponível!';
  }
  if (msg.includes('modelo') || msg.includes('tipo') || msg.includes('produto')) {
    return '🌵 Temos 4 modelos: Cangaço, Sertão, Nordeste Raiz e Forró da Noite. Todos feitos com amor nordestino!';
  }
  if (msg.includes('pix') || msg.includes('pagamento') || msg.includes('pagar')) {
    return '💳 Aceitamos PIX (5% de desconto!) e também combinamos no WhatsApp. Seguro e rápido!';
  }
  if (msg.includes('whatsapp') || msg.includes('zap') || msg.includes('contato')) {
    return '📱 Nosso WhatsApp: (85) 99999-9999. Pode mandar mensagem direto ou finalizar o pedido pelo site!';
  }
  if (msg.includes('tamanho') || msg.includes('número') || msg.includes('numero')) {
    return '👟 Temos do número 33 ao 44! Coloca o número desejado no campo de observações no checkout.';
  }
  if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola') || msg.includes('bom dia') || msg.includes('boa tarde')) {
    return '😄 Oiê! Bem vindo ao Pisante Nordestino! Como posso te ajudar hoje?';
  }
  if (msg.includes('obrigado') || msg.includes('valeu') || msg.includes('vlw')) {
    return '🌵 De nada! Qualquer dúvida é só falar. Compre à vontade!';
  }

  return '🤔 Hmm, não entendi muito bem. Pode perguntar sobre: preços, modelos, entrega, pagamento ou tamanhos!';
}

// =============================================
//  NOTIFICAÇÃO
// =============================================
function mostrarNotif(msg) {
  const notif = document.getElementById('notif');
  notif.textContent = msg;
  notif.style.display = 'block';
  setTimeout(() => { notif.style.display = 'none'; }, 2500);
}

// =============================================
//  INICIALIZAR
// =============================================
renderProdutos();

