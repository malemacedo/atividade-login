/* ============================================================
   NEY JR STORE - Painel Administrativo (CRUD real no Supabase)
   CREATE / READ / UPDATE / DELETE na tabela "jogos".
   Somente usuarios cadastrados na tabela "admins" tem acesso.
   ============================================================ */

let jogoEmEdicao = null;

async function initAdmin() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        window.location.href = 'login.html?redirect=admin.html';
        return;
    }
    const { data: adm } = await sb.from('admins').select('user_id')
        .eq('user_id', user.id).maybeSingle();
    if (!adm) {
        document.getElementById('admin-conteudo').classList.add('oculto');
        document.getElementById('acesso-negado').classList.remove('oculto');
        return;
    }
    document.getElementById('admin-email').textContent = user.email;
    await carregarPainel();
}

async function carregarPainel() {
    const { count } = await sb.from('jogos').select('*', { count: 'exact', head: true });
    document.getElementById('stat-total').textContent = count !== null ? count : '—';

    const { data: todos } = await sb.from('jogos').select('preco, preco_promocional');
    const ofertas = (todos || []).filter(j => j.preco_promocional !== null && Number(j.preco_promocional) < Number(j.preco));
    document.getElementById('stat-ofertas').textContent = ofertas.length;
    const destaques = (todos || []).filter(j => j.destaque);
    document.getElementById('stat-destaques').textContent = destaques.length;
    await listarJogosAdmin();
}

async function listarJogosAdmin() {
    const tbody = document.getElementById('admin-tabela');
    const busca = (document.getElementById('admin-busca').value || '').toLowerCase();
    tbody.innerHTML = '<tr><td colspan="7" class="estado-vazio">Carregando jogos...</td></tr>';

    const { data: jogos, error } = await sb.from('jogos').select('*').order('id');
    if (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="estado-vazio">Não foi possível conectar ao banco de dados.</td></tr>';
        return;
    }
    let lista = jogos || [];
    if (busca) lista = lista.filter(j => (j.nome || '').toLowerCase().includes(busca));

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="estado-vazio">Nenhum jogo encontrado.</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(j => `
        <tr>
            <td><img class="admin-thumb" src="${j.imagem_url || IMG_FALLBACK}" alt="${esc(j.nome)}"
                 onerror="this.onerror=null;this.src='${IMG_FALLBACK}'"></td>
            <td><strong>${esc(j.nome)}</strong></td>
            <td>${esc(j.categoria || '—')}</td>
            <td>${emOferta(j) ? formatarPreco(j.preco_promocional) : formatarPreco(j.preco)}</td>
            <td><span class="tag ${j.disponivel ? 'tag-ok' : 'tag-off'}">${j.disponivel ? 'Disponível' : 'Indisponível'}</span></td>
            <td><span class="tag ${j.destaque ? 'tag-roxo' : ''}">${j.destaque ? 'Destaque' : '—'}</span></td>
            <td class="admin-acoes">
                <button class="btn btn-outline btn-sm" onclick="abrirEdicao(${j.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="excluirJogo(${j.id}, '${esc(j.nome)}')">Excluir</button>
            </td>
        </tr>`).join('');
}

function abrirFormulario() {
    jogoEmEdicao = null;
    document.getElementById('form-titulo').textContent = 'Novo jogo';
    document.getElementById('jogo-form').reset();
    document.getElementById('jogo-id').value = '';
    document.getElementById('jogo-disponivel').checked = true;
    document.getElementById('form-overlay').classList.remove('oculto');
}

async function abrirEdicao(id) {
    const { data: jogo, error } = await sb.from('jogos').select('*').eq('id', id).single();
    if (error || !jogo) { toast('Não foi possível carregar o jogo.'); return; }
    jogoEmEdicao = id;
    document.getElementById('form-titulo').textContent = 'Editar jogo';
    document.getElementById('jogo-id').value = jogo.id;
    document.getElementById('jogo-nome').value = jogo.nome || '';
    document.getElementById('jogo-descricao').value = jogo.descricao || '';
    document.getElementById('jogo-categoria').value = jogo.categoria || '';
    document.getElementById('jogo-plataforma').value = jogo.plataforma || '';
    document.getElementById('jogo-preco').value = jogo.preco;
    document.getElementById('jogo-preco-promo').value = jogo.preco_promocional !== null ? jogo.preco_promocional : '';
    document.getElementById('jogo-imagem').value = jogo.imagem_url || '';
    document.getElementById('jogo-desenvolvedora').value = jogo.desenvolvedora || '';
    document.getElementById('jogo-publicadora').value = jogo.publicadora || '';
    document.getElementById('jogo-lancamento').value = jogo.data_lancamento || '';
    document.getElementById('jogo-destaque').checked = jogo.destaque;
    document.getElementById('jogo-disponivel').checked = jogo.disponivel;
    document.getElementById('form-overlay').classList.remove('oculto');
}

function fecharFormulario() {
    document.getElementById('form-overlay').classList.add('oculto');
}

async function salvarJogo(event) {
    event.preventDefault();
    const registro = {
        nome: document.getElementById('jogo-nome').value.trim(),
        descricao: document.getElementById('jogo-descricao').value.trim(),
        categoria: document.getElementById('jogo-categoria').value,
        plataforma: document.getElementById('jogo-plataforma').value.trim(),
        preco: parseFloat(document.getElementById('jogo-preco').value.replace(',', '.')) || 0,
        preco_promocional: document.getElementById('jogo-preco-promo').value === '' ? null
            : parseFloat(document.getElementById('jogo-preco-promo').value.replace(',', '.')),
        imagem_url: document.getElementById('jogo-imagem').value.trim(),
        desenvolvedora: document.getElementById('jogo-desenvolvedora').value.trim(),
        publicadora: document.getElementById('jogo-publicadora').value.trim(),
        data_lancamento: document.getElementById('jogo-lancamento').value || null,
        destaque: document.getElementById('jogo-destaque').checked,
        disponivel: document.getElementById('jogo-disponivel').checked
    };

    let error;
    if (jogoEmEdicao) {
        const resp = await sb.from('jogos').update(registro).eq('id', jogoEmEdicao);
        error = resp.error;
        if (!error) toast('Jogo atualizado com sucesso!');
    } else {
        const resp = await sb.from('jogos').insert(registro);
        error = resp.error;
        if (!error) toast('Jogo cadastrado com sucesso!');
    }
    if (error) {
        toast('Erro ao salvar: ' + (error.message || 'verifique os dados.'));
        return;
    }
    fecharFormulario();
    await carregarPainel();
}

async function excluirJogo(id, nome) {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;
    const { error } = await sb.from('jogos').delete().eq('id', id);
    if (error) { toast('Erro ao excluir o jogo.'); return; }
    toast('Jogo excluído com sucesso!');
    await carregarPainel();
}
