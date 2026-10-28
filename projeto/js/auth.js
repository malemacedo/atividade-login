 /* ============================================================
   NEY JR STORE - Autenticacao (Supabase Auth)
   Cadastro, login, logout, sessao e area do usuario no header.
   ============================================================ */

 async function getUsuario() {
    const { data } = await sb.auth.getUser();
    return data.user;
}

async function registrar(nome, email, senha) {
    const { data, error } = await sb.auth.signUp({
        email: email,
        password: senha,
        options: { data: { nome: nome } }
    });
    return { data, error };
}

async function entrar(email, senha) {
    const { data, error } = await sb.auth.signInWithPassword({ email: email, password: senha });
    return { data, error };
}

async function sair() {
    await sb.auth.signOut();
    window.location.href = 'index.html';
}

/* Atualiza a area do usuario no header: "Entrar" ou nome + botao Sair */
async function atualizarAreaUsuario() {
    const area = document.getElementById('user-area');
    if (!area) return;
    const user = await getUsuario();
    if (user) {
        const nome = (user.user_metadata && user.user_metadata.nome) || user.email.split('@')[0];
        area.innerHTML =
            '<a class="user-name" href="perfil.html" title="Meu perfil">Olá, ' + esc(nome) + '</a>' +
            '<button class="btn btn-outline btn-sm" onclick="sair()">Sair</button>';
    } else {
        area.innerHTML = '<a class="btn btn-primary btn-sm" href="login.html">Entrar</a>';
    }
} 

/* Escapa texto para evitar quebra de HTML (seguranca basica) */
function esc(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
} 
