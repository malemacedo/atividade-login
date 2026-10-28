/* ============================================================
   NEY JR STORE - Catalogo, busca, filtros e detalhes dos jogos
   Todos os dados vêm do Supabase (tabela "jogos").
   ============================================================ */

const IMG_FALLBACK = 'https://placehold.co/460x215/151528/8b5cf6?text=NEY+JR+STORE';

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function emOferta(jogo) {
    return jogo.preco_promocional !== null && Number(jogo.preco_promocional) < Number(jogo.preco);
}

function precoHtml(jogo) {
    if (emOferta(jogo)) {
        return '<s>' + formatarPreco(jogo.preco) + '</s>' +
               '<strong class="preco-promo">' + formatarPreco(jogo.preco_promocional) + '</strong>';
    }
    if (Number(jogo.preco) === 0) return '<strong class="preco-gratis">Grátis</strong>';
    return '<strong>' + formatarPreco(jogo.preco) + '</strong>';
}

function cardJogo(jogo) {
    return `
    <article class="game-card">
        <a href="jogo.html?id=${jogo.id}" class="game-card-img">
            <img src="${jogo.imagem_url || IMG_FALLBACK}" alt="${esc(jogo.nome)}" loading="lazy"
                 onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
            ${emOferta(jogo) ? '<span class="badge badge-oferta">OFERTA</span>' : ''}
            ${jogo.destaque ? '<span class="badge badge-destaque">Destaque</span>' : ''}
        </a>
        <div class="game-card-body">
            <span class="game-cat">${esc(jogo.categoria)}</span>
            <h3><a href="jogo.html?id=${jogo.id}">${esc(jogo.nome)}</a></h3>
            <p class="game-plat">${esc(jogo.plataforma)}</p>
            <div class="game-price">${precoHtml(jogo)}</div>
            <div class="game-actions">
                <a class="btn btn-outline" href="jogo.html?id=${jogo.id}">Ver detalhes</a>
                <button class="btn btn-primary" onclick="addAoCarrinho(${jogo.id})">Adicionar ao carrinho</button>
            </div>
        </div>
    </article>`;
}

function estadoVazio(mensagem) {
    return '<div class="estado-vazio"><p>' + mensagem + '</p></div>';
}

/* Busca os jogos no Supabase e aplica filtros (categoria, preco, etc.) */
async function buscarJogos(filtros = {}) {
    let query = sb.from('jogos').select('*').order('criado_em', { ascending: false });
    if (filtros.apenasDisponiveis !== false) query = query.eq('disponivel', true);

    const { data, error } = await query;
    if (error) { toast('Não foi possível conectar ao banco de dados.'); return []; }

    let jogos = data || [];

    if (filtros.busca) {
        const termo = filtros.busca.toLowerCase();
        jogos = jogos.filter(j => (j.nome || '').toLowerCase().includes(termo));
    }
    if (filtros.categoria) jogos = jogos.filter(j => j.categoria === filtros.categoria);
    if (filtros.plataforma) jogos = jogos.filter(j => (j.plataforma || '').includes(filtros.plataforma));
    if (filtros.ofertas) jogos = jogos.filter(emOferta);
    if (filtros.destaques) jogos = jogos.filter(j => j.destaque);
    if (filtros.faixa === 'gratis') jogos = jogos.filter(j => Number(j.preco) === 0);
    if (filtros.faixa === 'ate50') jogos = jogos.filter(j => Number(j.preco) > 0 && Number(j.preco) <= 50);
    if (filtros.faixa === '50a100') jogos = jogos.filter(j => Number(j.preco) > 50 && Number(j.preco) <= 100);
    if (filtros.faixa === 'acima100') jogos = jogos.filter(j => Number(j.preco) > 100);

    return jogos;
}

function renderGrade(elementoId, jogos, mensagemVazio) {
    const grade = document.getElementById(elementoId);
    if (!grade) return;
    if (!jogos || jogos.length === 0) {
        grade.innerHTML = estadoVazio(mensagemVazio || 'Nenhum jogo encontrado.');
        return;
    }
    grade.innerHTML = jogos.map(cardJogo).join('');
}

/* ---------------- Pagina jogos.html ---------------- */
async function initCatalogo() {
    const params = new URLSearchParams(window.location.search);
    const buscaInput = document.getElementById('filtro-busca');
    const catSelect = document.getElementById('filtro-categoria');
    const platSelect = document.getElementById('filtro-plataforma');
    const faixaSelect = document.getElementById('filtro-faixa');
    const ofertasCheck = document.getElementById('filtro-ofertas');

    if (params.get('busca') && buscaInput) buscaInput.value = params.get('busca');
    if (params.get('categoria') && catSelect) catSelect.value = params.get('categoria');
    if (params.get('ofertas') === '1' && ofertasCheck) ofertasCheck.checked = true;

    async function aplicar() {
        const grade = document.getElementById('grade-jogos');
        grade.innerHTML = estadoVazio('Carregando jogos...');
        const jogos = await buscarJogos({
            busca: buscaInput ? buscaInput.value.trim() : '',
            categoria: catSelect ? catSelect.value : '',
            plataforma: platSelect ? platSelect.value : '',
            faixa: faixaSelect ? faixaSelect.value : '',
            ofertas: ofertasCheck ? ofertasCheck.checked : false
        });
        renderGrade('grade-jogos', jogos, 'Nenhum jogo encontrado.');
    }

    const form = document.getElementById('filtros-form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); aplicar(); });
    [catSelect, platSelect, faixaSelect, ofertasCheck].forEach(el => {
        if (el) el.addEventListener('change', aplicar);
    });
    await aplicar();
}

/* ---------------- Pagina jogo.html (detalhes) ---------------- */
async function initDetalhes() {
    const container = document.getElementById('detalhe-jogo');
    if (!container) return;
    const id = new URLSearchParams(window.location.search).get('id');
    container.innerHTML = estadoVazio('Carregando jogo...');

    const { data: jogo, error } = await sb.from('jogos').select('*').eq('id', id).maybeSingle();
    if (error || !jogo) {
        container.innerHTML = estadoVazio('Jogo não encontrado.');
        return;
    }
    document.title = jogo.nome + ' - NEY JR STORE';

    const dataLanc = jogo.data_lancamento
        ? new Date(jogo.data_lancamento + 'T00:00:00').toLocaleDateString('pt-BR')
        : 'Não informada';

    container.innerHTML = `
        <div class="detalhe-grid">
            <div class="detalhe-img">
                <img src="${jogo.imagem_url || IMG_FALLBACK}" alt="${esc(jogo.nome)}"
                     onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
            </div>
            <div class="detalhe-info">
                ${emOferta(jogo) ? '<span class="badge badge-oferta">OFERTA</span>' : ''}
                <h1>${esc(jogo.nome)}</h1>
                <p class="detalhe-desc">${esc(jogo.descricao || 'Descrição não disponível.')}</p>
                <ul class="detalhe-lista">
                    <li><span>Categoria</span><strong>${esc(jogo.categoria || '—')}</strong></li>
                    <li><span>Plataforma</span><strong>${esc(jogo.plataforma || '—')}</strong></li>
                    <li><span>Desenvolvedora</span><strong>${esc(jogo.desenvolvedora || '—')}</strong></li>
                    <li><span>Publicadora</span><strong>${esc(jogo.publicadora || '—')}</strong></li>
                    <li><span>Lançamento</span><strong>${dataLanc}</strong></li>
                    <li><span>Disponibilidade</span><strong>${jogo.disponivel ? 'Disponível' : 'Indisponível'}</strong></li>
                </ul>
                <div class="detalhe-preco">${precoHtml(jogo)}</div>
                <div class="game-actions">
                    <button class="btn btn-primary btn-lg" onclick="addAoCarrinho(${jogo.id})">Adicionar ao carrinho</button>
                    <a class="btn btn-outline btn-lg" href="carrinho.html">Ir para o carrinho</a>
                </div>
            </div>
        </div>`;
}

/* ---------------- Pagina index.html (destaques e ofertas) ---------------- */
async function initDestaques() {
    const grade = document.getElementById('grade-destaques');
    if (!grade) return;
    grade.innerHTML = estadoVazio('Carregando jogos...');
    const jogos = await buscarJogos({ destaques: true });
    renderGrade('grade-destaques', jogos, 'Nenhum jogo em destaque no momento.');
}

async function initOfertas() {
    const grade = document.getElementById('grade-ofertas');
    if (!grade) return;
    grade.innerHTML = estadoVazio('Carregando ofertas...');
    const jogos = await buscarJogos({ ofertas: true });
    renderGrade('grade-ofertas', jogos, 'Nenhuma oferta disponível no momento.');
}
