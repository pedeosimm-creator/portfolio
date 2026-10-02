// Onde o conteúdo do site mora (Supabase, projeto flowspace).
// A chave abaixo é a pública: só deixa ler. Salvar passa pela função com senha.
export const SUPABASE_URL = 'https://fautswjwioiviqvpgsrw.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_bjyeK-KVLLURCrUegGl5Gg_gy9tNLFk';
export const CONTEUDO_URL = `${SUPABASE_URL}/rest/v1/pf_site?id=eq.principal&select=conteudo`;
export const PAINEL_URL = `${SUPABASE_URL}/functions/v1/portfolio-admin`;

export async function buscarConteudo() {
  const r = await fetch(CONTEUDO_URL, { headers: { apikey: SUPABASE_KEY }, cache: 'no-store' });
  if (!r.ok) throw new Error(`Não consegui carregar o conteúdo (erro ${r.status}).`);
  const [linha] = await r.json();
  if (!linha) throw new Error('Conteúdo não encontrado.');
  return linha.conteudo;
}
