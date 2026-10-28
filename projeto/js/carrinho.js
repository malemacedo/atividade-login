/* ============================================================
   NEY JR STORE - Carrinho de compras + Pedido simulado
   O carrinho fica no localStorage, mas os dados e precos dos
   jogos sempre vêm do Supabase. O pedido e gravado de verdade
   nas tabelas "pedidos" e "itens_pedido".
   ============================================================ */

const CARRINHO_KEY = 'neyjr_carrinho';

function getCarrinho() {
    try { return JSON.parse(localStorage.getItem(CARRINHO_KEY)) || []; }
    catch (e) { return []; }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CARRINHO_KEY, JSON.stringify(carrinho));
    atualizarContadorCarrinho();
}

function precoItem(item) {
    return (item.preco_promocional !== null && item.preco_promocional < item.preco)
        ? Number(item.preco_promocional)
        : Number(item.preco);
}

function atualizarContadorCarrinho() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const qtd = getCarrinho().reduce((s, i) => s + i.quantidade, 0);
    el.textContent = qtd;
    el.style.display = qtd > 0 ? 'inline-flex' : 'none';
}

async function addAoCarrinho(id) {
    const { data: jogo, error } = await sb.from('jogos').select('*').eq('id', id).single();
    if (error || !jogo) { toast('Não foi possível adicionar o jogo.'); return; }
    const carrinho = getCarrinho();
    const item = carrinho.find(i => i.id === jogo.id);
    if (item) item.quantidade += 1;
    else carrinho.push({
        id: jogo.id, nome: jogo.nome, preco: jogo.preco,
        preco_promocional: jogo.preco_promocional, imagem_url: jogo.imagem_url,
        quantidade: 1
    });
    salvarCarrinho(carrinho);
    toast('Jogo adicionado ao carrinho!');
}

function removerDoCarrinho(id) {
    salvarCarrinho(getCarrinho().filter(i => i.id !== id));
    renderCarrinho();
}

function alterarQuantidade(id, delta) {
    const carrinho = getCarrinho();
    const item = carrinho.find(i => i.id === id);
    if (!item) return;
    item.quantidade += delta;
    if (item.quantidade <= 0) return removerDoCarrinho(id);
    salvarCarrinho(carrinho);
    renderCarrinho();
}

function limparCarrinho() {
    salvarCarrinho([]);
    renderCarrinho();
}

function calcularTotal(carrinho) {
    return carrinho.reduce((s, i) => s + precoItem(i) * i.quantidade, 0);
}

function renderCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    if (!lista) return;
    const carrinho = getCarrinho();
    const vazio = document.getElementById('carrinho-vazio');
    const resumo = document.getElementById('resumo-carrinho');

    if (carrinho.length === 0) {
        lista.innerHTML = '';
        if (vazio) vazio.classList.remove('oculto');
        if (resumo) resumo.classList.add('oculto');
        return;
    }
    if (vazio) vazio.classList.add('oculto');
    if (resumo) resumo.classList.remove('oculto');

    const IMG_FALLBACK = 'https://placehold.co/460x215/151528/8b5cf6?text=NEY+JR+STORE';
    lista.innerHTML = carrinho.map(i => `
        <div class="cart-item">
            <img src="${i.imagem_url || IMG_FALLBACK}" alt="${esc(i.nome)}"
                 onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
            <div class="cart-item-info">
                <h3>${esc(i.nome)}</h3>
                <p>${Number(precoItem(i)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div class="cart-item-qty">
                <button onclick="alterarQuantidade(${i.id}, -1)" aria-label="Diminuir quantidade">−</button>
                <span>${i.quantidade}</span>
                <button onclick="alterarQuantidade(${i.id}, 1)" aria-label="Aumentar quantidade">+</button>
            </div>
            <strong class="cart-item-sub">
                ${(precoItem(i) * i.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
            <button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${i.id})">Remover</button>
        </div>`).join('');

    document.getElementById('cart-total').textContent =
        calcularTotal(carrinho).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Finalizar pedido: verifica login, grava pedido e itens no Supabase */
async function finalizarPedido() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        toast('Faça login para finalizar o pedido.');
        setTimeout(() => { window.location.href = 'login.html?redirect=carrinho.html'; }, 1500);
        return;
    }
    const carrinho = getCarrinho();
    if (carrinho.length === 0) { toast('Seu carrinho está vazio.'); return; }

    const total = calcularTotal(carrinho);
    const { data: pedido, error } = await sb.from('pedidos')
        .insert({ usuario_id: user.id, valor_total: total, status: 'concluido' })
        .select().single();

    if (error) { toast('Não foi possível conectar ao banco de dados.'); return; }

    const itens = carrinho.map(i => ({
        pedido_id: pedido.id, jogo_id: i.id, quantidade: i.quantidade, preco: precoItem(i)
    }));
    const { error: erroItens } = await sb.from('itens_pedido').insert(itens);
    if (erroItens) { toast('Erro ao registrar os itens do pedido.'); return; }

    salvarCarrinho([]);
    renderCarrinho();
    const sucesso = document.getElementById('pedido-sucesso');
    if (sucesso) sucesso.classList.remove('oculto');
    toast('Pedido realizado com sucesso!');
}
