-- ============================================================
-- NEY JR STORE - Politicas de Seguranca (RLS)
-- Execute este arquivo DEPOIS do database.sql no SQL Editor
-- ============================================================

-- ---------- Ativar Row Level Security ----------
alter table public.jogos enable row level security;
alter table public.perfis enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.admins enable row level security;

-- ---------- TABELA jogos ----------
-- Leitura publica: qualquer pessoa ve os jogos disponiveis.
-- Administradores veem TODOS (ate os indisponiveis).
drop policy if exists "Leitura publica dos jogos" on public.jogos;
create policy "Leitura publica dos jogos"
    on public.jogos for select
    using (disponivel = true or public.is_admin());

-- Somente ADMIN pode cadastrar jogos (CREATE)
drop policy if exists "Admin insere jogos" on public.jogos;
create policy "Admin insere jogos"
    on public.jogos for insert
    to authenticated
    with check (public.is_admin());

-- Somente ADMIN pode editar jogos (UPDATE)
drop policy if exists "Admin atualiza jogos" on public.jogos;
create policy "Admin atualiza jogos"
    on public.jogos for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Somente ADMIN pode excluir jogos (DELETE)
drop policy if exists "Admin exclui jogos" on public.jogos;
create policy "Admin exclui jogos"
    on public.jogos for delete
    to authenticated
    using (public.is_admin());

-- ---------- TABELA perfis ----------
drop policy if exists "Usuario le proprio perfil" on public.perfis;
create policy "Usuario le proprio perfil"
    on public.perfis for select
    using (auth.uid() = id or public.is_admin());

drop policy if exists "Usuario atualiza proprio perfil" on public.perfis;
create policy "Usuario atualiza proprio perfil"
    on public.perfis for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- ---------- TABELA pedidos ----------
drop policy if exists "Usuario le proprios pedidos" on public.pedidos;
create policy "Usuario le proprios pedidos"
    on public.pedidos for select
    using (auth.uid() = usuario_id or public.is_admin());

drop policy if exists "Usuario cria proprios pedidos" on public.pedidos;
create policy "Usuario cria proprios pedidos"
    on public.pedidos for insert
    with check (auth.uid() = usuario_id);

-- ---------- TABELA itens_pedido ----------
drop policy if exists "Usuario le itens dos proprios pedidos" on public.itens_pedido;
create policy "Usuario le itens dos proprios pedidos"
    on public.itens_pedido for select
    using (exists (
        select 1 from public.pedidos p
        where p.id = pedido_id and p.usuario_id = auth.uid()
    ) or public.is_admin());

drop policy if exists "Usuario cria itens dos proprios pedidos" on public.itens_pedido;
create policy "Usuario cria itens dos proprios pedidos"
    on public.itens_pedido for insert
    with check (exists (
        select 1 from public.pedidos p
        where p.id = pedido_id and p.usuario_id = auth.uid()
    ));

-- ---------- TABELA admins ----------
drop policy if exists "Leitura da propria permissao de admin" on public.admins;
create policy "Leitura da propria permissao de admin"
    on public.admins for select
    using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Apenas admin gerencia admins" on public.admins;
create policy "Apenas admin gerencia admins"
    on public.admins for insert
    with check (public.is_admin());

-- ============================================================
-- IMPORTANTE - Tornar um usuario administrador:
-- 1. Cadastre-se pelo site (cadastro.html) e faca login.
-- 2. No Supabase, va em Authentication > Users e copie o ID (UUID)
--    do seu usuario.
-- 3. Execute no SQL Editor:
--      insert into public.admins (user_id)
--      values ('COLE_AQUI_O_UUID_DO_USUARIO');
-- 4. Agora voce acessa o painel admin.html e o CRUD funciona.
-- ============================================================
