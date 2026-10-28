/* ============================================================
   NEY JR STORE - Scripts gerais do site
   Menu mobile, header, contador do carrinho, notificacoes.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    /* Menu mobile */
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => nav.classList.toggle('aberto'));
    }

    /* Sombra no header ao rolar a pagina */
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        });
    }

    /* Ano no rodape */
    const ano = document.getElementById('ano-atual');
    if (ano) ano.textContent = new Date().getFullYear();

    /* Estado inicial da interface */
    atualizarContadorCarrinho();
    atualizarAreaUsuario();
});

/* Exibe uma mensagem temporaria (toast) */
function toast(mensagem) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = mensagem;
    container.appendChild(el);
    setTimeout(() => el.classList.add('visivel'), 10);
    setTimeout(() => {
        el.classList.remove('visivel');
        setTimeout(() => el.remove(), 400);
    }, 3000);
}
