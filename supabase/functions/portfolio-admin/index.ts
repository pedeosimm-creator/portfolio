// Painel /admin do portfólio: confere a senha e salva o conteúdo na tabela pf_site.
// Também sobe as fotos (bucket portfolio).
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Impressão digital (SHA-256) da senha do painel. A senha em si não fica no código.
const SENHA_HASH = 'dee3d225976c56ba15ef37e3eb1758589efe78f316c0bb0eba2aa92781afeded';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });

async function sha256(texto: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Barra conteúdo que quebraria o site.
function validar(c: any): string | null {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return 'Conteúdo inválido.';
  if (typeof c.nome !== 'string' || !c.nome.trim()) return 'O nome não pode ficar vazio.';
  if (!c.contato || typeof c.contato !== 'object') return 'Faltam os dados de contato.';
  if (!Array.isArray(c.projetos) || !c.projetos.length) return 'O site precisa de pelo menos um projeto.';
  for (const [i, p] of c.projetos.entries()) {
    if (!p || typeof p.titulo !== 'string' || !p.titulo.trim()) return `O projeto ${i + 1} está sem título.`;
    if (!Array.isArray(p.videos) || p.videos.some((v: unknown) => typeof v !== 'string')) return `Os vídeos do projeto "${p.titulo}" estão com problema.`;
  }
  if (!Array.isArray(c.servicos) || !Array.isArray(c.kit)) return 'Outros trabalhos e kit precisam ser listas.';
  if (JSON.stringify(c).length > 200_000) return 'Conteúdo grande demais.';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ erro: 'Método não permitido.' }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ erro: 'Pedido inválido.' }, 400);
  }

  if (!iguais(await sha256(String(body.senha ?? '')), SENHA_HASH)) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ erro: 'Senha errada.' }, 401);
  }

  if (body.acao === 'entrar') return json({ ok: true });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  if (body.acao === 'foto') {
    const tipos: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    const ext = tipos[body.tipo];
    if (!ext || typeof body.base64 !== 'string') return json({ erro: 'Formato de foto não aceito. Usa JPG, PNG ou WEBP.' }, 400);
    const bytes = Uint8Array.from(atob(body.base64), (c) => c.charCodeAt(0));
    if (bytes.length > 8 * 1024 * 1024) return json({ erro: 'Foto grande demais (máximo 8 MB).' }, 400);
    const caminho = `fotos/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from('portfolio').upload(caminho, bytes, { contentType: body.tipo, cacheControl: '31536000' });
    if (error) return json({ erro: 'Não consegui subir a foto. Tenta de novo.' }, 500);
    return json({ ok: true, url: sb.storage.from('portfolio').getPublicUrl(caminho).data.publicUrl });
  }

  if (body.acao === 'salvar') {
    const problema = validar(body.conteudo);
    if (problema) return json({ erro: problema }, 400);
    const { titulos: _antigos, ...conteudo } = body.conteudo;
    const { error } = await sb.from('pf_site').upsert({ id: 'principal', conteudo, atualizado_em: new Date().toISOString() });
    if (error) return json({ erro: 'Não consegui salvar. Tenta de novo em instantes.' }, 500);
    return json({ ok: true, conteudo });
  }

  return json({ erro: 'Ação desconhecida.' }, 400);
});
