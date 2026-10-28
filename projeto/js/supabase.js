/* Cria o cliente Supabase usado em todo o site.
   Requer o carregamento anterior do CDN do @supabase/supabase-js v2
   e das constantes definidas em js/config.js */

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
