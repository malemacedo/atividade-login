# NEY JR STORE

Loja digital de jogos desenvolvida como projeto academico, com **HTML5, CSS3, JavaScript e Supabase (PostgreSQL)**. Interface 100% em portugues (pt-BR), com CRUD real, autenticacao, carrinho e pedidos simulados gravados no banco de dados.

## Sobre o projeto

A NEY JR STORE e uma loja de jogos inspirada em plataformas como Steam e Epic Games Store (somente como referencia de UX — identidade visual original). O catalogo e carregado do Supabase, o usuario pode se cadastrar, entrar, montar um carrinho e finalizar um pedido simulado, e um administrador gerencia os jogos por meio de um painel com CRUD completo.

## Tecnologias utilizadas

* **HTML5** — estrutura das paginas
* **CSS3** — identidade visual preto + roxo + branco, Grid, Flexbox, responsividade
* **JavaScript (vanilla)** — toda a logica do front-end
* **Supabase** — backend: banco PostgreSQL, autenticacao, APIs automaticas
* **PostgreSQL** — banco relacional com Row Level Security (RLS)

## Funcionalidades

* Catalogo de jogos carregado do Supabase (READ real)
* Pagina de detalhes de cada jogo
* Busca por nome e filtros (categoria, plataforma, faixa de preco, ofertas)
* Secoes de destaques e ofertas (preco promocional com precos riscados)
* Cadastro, login e logout com Supabase Auth (senhas gerenciadas pelo Supabase)
* Perfil do usuario com historico de pedidos
* Carrinho de compras (localStorage) com precos vindos do banco
* Pedido simulado: grava pedido e itens nas tabelas `pedidos` e `itens_pedido`
* Painel administrativo com CRUD real de jogos (criar, listar, editar, excluir)
* Confirmacao antes de excluir: "Tem certeza que deseja excluir este jogo?"
* Mensagens de carregamento, sucesso, erro e estado vazio em pt-BR
* Layout responsivo (desktop, laptop, tablet e smartphone)

## Estrutura do projeto

```text
ney-jr-store/
│
├── index.html          # Inicio: hero, categorias, destaques, ofertas, sobre
├── jogos.html          # Catalogo com busca e filtros
├── jogo.html           # Detalhes do jogo (?id=)
├── login.html          # Login
├── cadastro.html       # Cadastro
├── carrinho.html       # Carrinho e finalizacao do pedido
├── perfil.html         # Perfil do usuario e pedidos
├── admin.html          # Painel administrativo (CRUD)
│
├── css/
│   ├── style.css       # Estilos principais (identidade preto + roxo + branco)
│   ├── responsive.css  # Responsividade
│   └── admin.css       # Estilos do painel admin
│
├── js/
│   ├── config.js       # SUPABASE_URL e SUPABASE_ANON_KEY (EDITAR AQUI)
│   ├── supabase.js     # Criacao do cliente Supabase
│   ├── auth.js         # Cadastro, login, logout, area do usuario
│   ├── jogos.js        # Catalogo, busca, filtros, detalhes
│   ├── carrinho.js     # Carrinho e pedido simulado
│   ├── admin.js        # CRUD do painel administrativo
│   └── app.js          # Menu mobile, header, toasts
│
├── sql/
│   ├── database.sql    # Tabelas, funcoes e os 11 jogos iniciais
│   └── policies.sql    # Politicas de seguranca (RLS)
│
└── README.md
```

## Configuracao do Supabase (passo a passo)

1. **Criar o projeto**: acesse [supabase.com](https://supabase.com), faca login e clique em **New Project**. Escolha a organization, defina o nome do projeto, a senha do banco (guarde-a, nao sera usada no site) e a regiao.
2. **Criar o banco**: no menu lateral, abra **SQL Editor** > **New query**.
3. **Executar o `database.sql`**: copie todo o conteudo de `sql/database.sql`, cole no editor e clique em **Run**. Isso cria as tabelas `jogos`, `perfis`, `pedidos`, `itens_pedido` e `admins`, alem de inserir os 11 jogos obrigatorios.
4. **Executar o `policies.sql`**: cole o conteudo de `sql/policies.sql` e clique em **Run**. Isso ativa o Row Level Security e cria as politicas (catalogo publico para ler; so admin altera jogos; usuario so ve seus proprios pedidos).
5. **Copiar a URL**: em **Settings > API**, copie o **Project URL**.
6. **Copiar a chave publica**: na mesma pagina, copie a chave **anon public**.
7. **Inserir no site**: abra `js/config.js` e cole os valores em `SUPABASE_URL` e `SUPABASE_ANON_KEY` (substituindo `SUA_SUPABASE_URL` e `SUA_SUPABASE_ANON_KEY`). **Nunca** use a senha do banco nem a `service_role` key.
8. **Desativar confirmacao de e-mail (testes)**: em **Authentication > Sign In / Providers > Email**, desligue **Confirm email** — assim o cadastro ja funciona de imediato.
9. **Abrir o site**: sirva a pasta do projeto (ex.: extensao *Live Server* do VS Code ou `python -m http.server`) e abra `index.html`.
10. **Tornar-se administrador**: cadastre-se pelo site, copie seu **User ID** em **Authentication > Users** e execute no SQL Editor:
    ```sql
    insert into public.admins (user_id) values ('COLE_AQUI_SEU_UUID');
    ```
11. **Testar o CRUD**: abra `admin.html`, faca login e teste **Novo jogo**, **Editar** e **Excluir** — o catalogo reflete as mudancas em tempo real.

### Testes recomendados

* Cadastro e login de usuario
* Busca por "minecraft" no campo de pesquisa
* Filtros por categoria, plataforma, faixa de preco e ofertas
* Adicionar jogos ao carrinho, alterar quantidades e finalizar pedido (simulado)
* Ver o pedido gravado em **Table Editor > pedidos** no Supabase
* CRUD completo no painel admin

## Como o sistema funciona

* **Catalogo**: `js/jogos.js` consulta a tabela `jogos` via `sb.from('jogos').select('*')` e monta os cards. A busca e os filtros sao aplicados sobre os dados do banco.
* **Autenticacao**: `js/auth.js` usa `supabase.auth.signUp` / `signInWithPassword` / `signOut`. Um trigger no banco cria o perfil automaticamente na tabela `perfis`.
* **Carrinho**: fica no `localStorage`, mas cada jogo e seus precos sao validados no Supabase antes de entrar no carrinho.
* **Pedido simulado**: ao clicar em **Finalizar pedido**, o sistema verifica o login, insere um registro em `pedidos`, os itens em `itens_pedido`, limpa o carrinho e exibe "Pedido realizado com sucesso!".
* **Seguranca (RLS)**: qualquer pessoa le os jogos disponiveis; apenas usuarios na tabela `admins` podem inserir, alterar ou excluir jogos; cada usuario so acessa seus proprios pedidos e itens.

## GitHub

1. Crie uma conta em [github.com](https://github.com) e um novo repositorio publico (ex.: `ney-jr-store`). **Nao** marque "Add a README".
2. Na pasta do projeto, execute:
   ```bash
   git init
   git add .
   git commit -m "NEY JR STORE - loja de jogos com Supabase"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/ney-jr-store.git
   git push -u origin main
   ```
3. **Importante**: como o projeto roda 100% no navegador com a chave publica (anon), ele funciona sem servidor. O link do repositorio e o que deve ser entregue.

> Seguranca: o `js/config.js` usa apenas a chave **anon publica**, projetada para uso no front-end junto com as politicas RLS. A senha do banco e a `service_role` key **nunca** devem ser commitadas.

## Checklist de testes

* [ ] Site abre corretamente
* [ ] Todo o texto visivel esta em pt-BR
* [ ] Layout funciona no desktop e no mobile
* [ ] Busca retorna jogos correspondentes
* [ ] Jogos sao carregados do Supabase (sem hard-code no HTML)
* [ ] Imagens e precos aparecem nos cards
* [ ] Pagina de detalhes funciona
* [ ] Cadastro, login e logout funcionam
* [ ] Carrinho adiciona, remove e calcula o total
* [ ] CREATE/READ/UPDATE/DELETE funcionam no admin
* [ ] As alteracoes do admin aparecem no catalogo
* [ ] Pedido e gravado em `pedidos` e `itens_pedido`
* [ ] `database.sql` e `policies.sql` executados sem erros
* [ ] README completo e projeto publicado no GitHub

---
Projeto academico. Precos ficticios e compras simuladas.
