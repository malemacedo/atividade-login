-- ============================================================
-- NEY JR STORE - Banco de Dados (Supabase / PostgreSQL)
-- Copie e cole TODO este arquivo no SQL Editor do Supabase
-- ============================================================

-- ---------- TABELA: jogos ----------
create table if not exists public.jogos (
    id bigserial primary key,
    nome varchar(200) not null,
    descricao text,
    categoria varchar(100),
    plataforma varchar(100),
    preco decimal(10,2) not null default 0,
    preco_promocional decimal(10,2),
    imagem_url text,
    desenvolvedora varchar(200),
    publicadora varchar(200),
    data_lancamento date,
    destaque boolean default false,
    disponivel boolean default true,
    criado_em timestamp default now()
);

-- ---------- TABELA: perfis (perfil do usuario) ----------
create table if not exists public.perfis (
    id uuid primary key references auth.users(id) on delete cascade,
    nome varchar(200),
    email varchar(200),
    criado_em timestamp default now()
);

-- ---------- TABELA: pedidos ----------
create table if not exists public.pedidos (
    id bigserial primary key,
    usuario_id uuid references auth.users(id),
    valor_total decimal(10,2) not null,
    status varchar(50) default 'pendente',
    criado_em timestamp default now()
);

-- ---------- TABELA: itens_pedido ----------
create table if not exists public.itens_pedido (
    id bigserial primary key,
    pedido_id bigint references public.pedidos(id) on delete cascade,
    jogo_id bigint references public.jogos(id),
    quantidade integer default 1,
    preco decimal(10,2) not null
);

-- ---------- TABELA: admins (administradores do CRUD) ----------
create table if not exists public.admins (
    user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- Funcao: cria o perfil automaticamente ao se cadastrar ----------
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.perfis (id, nome, email)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', ''), new.email);
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.criar_perfil();

-- ---------- Funcao auxiliar: verifica se o usuario e admin ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- DADOS INICIAIS: os 11 jogos obrigatorios ----------
-- (precos ficticios, apenas para o projeto academico)
insert into public.jogos
    (nome, descricao, categoria, plataforma, preco, preco_promocional, imagem_url,
     desenvolvedora, publicadora, data_lancamento, destaque, disponivel)
values
    ('GTA V',
     'Explore Los Santos em um dos mundos abertos mais famosos dos games. Campanha, GTA Online, corridas, assaltos e caos total na cidade.',
     'Ação', 'PC / PlayStation / Xbox', 59.90, 29.90,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
     'Rockstar North', 'Rockstar Games', '2015-04-14', true, true),

    ('Detroit: Become Human',
     'Uma historia cinematografica sobre androides que ganham consciencia em Detroit. Cada escolha muda o desfecho da narrativa.',
     'Aventura', 'PC / PlayStation', 79.90, null,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/1222140/header.jpg',
     'Quantic Dream', 'Quantic Dream', '2020-06-18', true, true),

    ('Stardew Valley',
     'Herde uma fazenda antiga e reconstrua a vida no campo: plante colheitas, cuide de animais, pescue e faca amizade com os moradores.',
     'Simulação', 'PC / Multiplataforma', 39.90, null,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
     'ConcernedApe', 'ConcernedApe', '2016-02-26', false, true),

    ('FIFA 17',
     'O classico simulador de futebol com o motor Frostbite, modo historia "A Jornada" e todos os times e campeonatos licenciados.',
     'Esportes', 'PC / PlayStation / Xbox', 49.90, 19.90,
     'https://placehold.co/460x215/151528/8b5cf6?text=FIFA+17',
     'EA Canada', 'EA Sports', '2016-09-27', false, true),

    ('PES 2020',
     'eFootball Pro Evolution Soccer 2020: futebol com gameplay refinado, licencas oficiais e modo Master Liga.',
     'Esportes', 'PC / PlayStation / Xbox', 59.90, null,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/916440/header.jpg',
     'PES Productions', 'Konami', '2019-09-10', false, true),

    ('Resident Evil 4',
     'Leon S. Kennedy em uma missao de resgate na Europa rural. Sobreviva ao culto dos Los Illuminados neste classico do survival horror.',
     'Terror', 'PC / PlayStation / Xbox', 89.90, 49.90,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg',
     'Capcom', 'Capcom', '2023-03-24', true, true),

    ('Tony Hawk''s Pro Skater 3',
     'Manobras radicais, pistas iconicas e a trilha sonora inesquecivel do skate mais famoso dos videogames.',
     'Esportes', 'PlayStation / Xbox', 69.90, null,
     'https://placehold.co/460x215/151528/8b5cf6?text=Tony+Hawk+Pro+Skater+3',
     'Neversoft', 'Activision', '2001-10-28', false, true),

    ('Red Dead Redemption 2',
     'A epopeia de Arthur Morgan e da gangue Van der Linde no fim do Velho Oeste americano. Mundo aberto gigantesco e narrativa premiada.',
     'Ação', 'PC / PlayStation / Xbox', 119.90, null,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
     'Rockstar Studios', 'Rockstar Games', '2019-11-05', true, true),

    ('Fortnite',
     'Battle Royale gratuito: 100 jogadores, um mapa em constante mudanca e construcao em tempo real. Gratuito para jogar.',
     'Battle Royale', 'PC / Multiplataforma', 0.00, null,
     'https://placehold.co/460x215/151528/8b5cf6?text=Fortnite',
     'Epic Games', 'Epic Games', '2017-07-25', false, true),

    ('Minecraft',
     'Construa, explore e sobreviva em um mundo de blocos infinito. Criatividade sem limites no jogo mais vendido da historia.',
     'Indie', 'PC / Multiplataforma', 99.90, null,
     'https://placehold.co/460x215/151528/8b5cf6?text=Minecraft',
     'Mojang Studios', 'Mojang Studios', '2011-11-18', false, true),

    ('Fall Guys',
     'Party game gratuito com provas malucas e corridas de obstaculos ate sobrar apenas um vencedor. Gratuito para jogar.',
     'Battle Royale', 'PC / Multiplataforma', 0.00, null,
     'https://placehold.co/460x215/151528/8b5cf6?text=Fall+Guys',
     'Mediatonic', 'Epic Games', '2020-08-04', false, true);

-- ============================================================
-- FIM do database.sql
-- Apos executar este arquivo, execute tambem o arquivo policies.sql
-- ============================================================
