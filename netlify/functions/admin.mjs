// Painel /admin: confere a senha e lê ou salva content/site.json direto no GitHub.
// Cada salvamento vira um commit, e o commit dispara um novo deploy no Netlify.
import { createHash, timingSafeEqual } from 'node:crypto';

const FILE = 'content/site.json';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sameSecret(a, b) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

// Barra conteúdo que quebraria o site antes de chegar no GitHub.
export function validar(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return 'Conteúdo inválido.';
  if (typeof c.nome !== 'string' || !c.nome.trim()) return 'O nome não pode ficar vazio.';
  if (!c.contato || typeof c.contato !== 'object') return 'Faltam os dados de contato.';
  if (!Array.isArray(c.projetos) || !c.projetos.length) return 'O site precisa de pelo menos um projeto.';
  for (const [i, p] of c.projetos.entries()) {
    if (!p || typeof p.titulo !== 'string' || !p.titulo.trim()) return `O projeto ${i + 1} está sem título.`;
    if (!Array.isArray(p.videos) || p.videos.some((v) => typeof v !== 'string')) return `Os vídeos do projeto "${p.titulo}" estão com problema.`;
  }
  if (!Array.isArray(c.servicos) || !Array.isArray(c.kit)) return 'Outros trabalhos e kit precisam ser listas.';
  if (JSON.stringify(c).length > 200_000) return 'Conteúdo grande demais.';
  return null;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ erro: 'Método não permitido.' }, 405);

  const {
    ADMIN_SENHA,
    GITHUB_TOKEN,
    GITHUB_REPO = 'pedeosimm-creator/portfolio',
    GITHUB_BRANCH = 'main',
  } = process.env;
  if (!ADMIN_SENHA || !GITHUB_TOKEN) {
    return json({ erro: 'O painel ainda não foi configurado: faltam ADMIN_SENHA ou GITHUB_TOKEN no Netlify.' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ erro: 'Pedido inválido.' }, 400);
  }

  if (!sameSecret(String(body.senha || ''), ADMIN_SENHA)) {
    await sleep(800);
    return json({ erro: 'Senha errada.' }, 401);
  }

  const api = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-admin',
  };

  if (body.acao === 'entrar') return json({ ok: true });

  if (body.acao === 'carregar') {
    const r = await fetch(`${api}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers });
    if (!r.ok) return json({ erro: `Não consegui ler o conteúdo no GitHub (erro ${r.status}).` }, 502);
    const f = await r.json();
    return json({ conteudo: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')), sha: f.sha });
  }

  if (body.acao === 'salvar') {
    const problema = validar(body.conteudo);
    if (problema) return json({ erro: problema }, 400);
    const texto = JSON.stringify(body.conteudo, null, 2) + '\n';
    const r = await fetch(api, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Edição pelo painel do site',
        content: Buffer.from(texto, 'utf8').toString('base64'),
        sha: body.sha,
        branch: GITHUB_BRANCH,
      }),
    });
    if (r.status === 409) {
      return json({ erro: 'O conteúdo mudou desde que abriste o painel. Recarrega a página e faz a edição de novo.' }, 409);
    }
    if (!r.ok) return json({ erro: `O GitHub não aceitou o salvamento (erro ${r.status}).` }, 502);
    const f = await r.json();
    return json({ ok: true, sha: f.content.sha });
  }

  return json({ erro: 'Ação desconhecida.' }, 400);
};

export const config = { path: '/api/admin' };
