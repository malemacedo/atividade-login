/* ============================================================
   NEY JR STORE - Configuracao do Supabase
   ------------------------------------------------------------
   COMO CONFIGURAR (passo a passo):
   1. Acesse https://supabase.com e faca login.
   2. Abra o seu projeto e va em: Settings (engrenagem) > API.
   3. Copie o "Project URL" e cole abaixo em SUPABASE_URL.
   4. Copie a chave "anon public" e cole abaixo em SUPABASE_ANON_KEY.
   5. Salve este arquivo e abra o site.

   ATENCAO (seguranca):
   - NUNCA cole a senha do banco de dados aqui.
   - NUNCA cole a "service_role" key (ela e privada).
   - Use SOMENTE a chave publica "anon".
   ============================================================ */

const SUPABASE_URL = 'https://mptfbacalbdrhlqdsvda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdGZiYWNhbGJkcmhscWRzdmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxOTg3NjEsImV4cCI6MjEwODc3NDc2MX0.jetgPDZOAfU8-YuoJMGsMDl3U3dGnGTJvrybBUk0Tp8';

if (SUPABASE_URL === 'https://mptfbacalbdrhlqdsvda.supabase.co' || SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdGZiYWNhbGJkcmhscWRzdmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxOTg3NjEsImV4cCI6MjEwODc3NDc2MX0.jetgPDZOAfU8-YuoJMGsMDl3U3dGnGTJvrybBUk0Tp8') {
    console.warn('NEY JR STORE: configure SUPABASE_URL e SUPABASE_ANON_KEY em js/config.js');
}
