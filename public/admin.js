// Painel de edição: carrega content/site.json pela função /api/admin, edita por formulário e salva de volta.

const ICONES = ['camera', 'action', 'zoom', 'fish', 'shotgun', 'lav', 'tube', 'torch', 'panel', 'lantern', 'tripod', 'arm', 'gimbal', 'battery', 'charger'];
const NOVO = {
  projeto: () => ({ titulo: 'Novo projeto', papel: '', cliente: '', formato: '', ano: '', texto: '', videos: [] }),
  video: () => '',
  servico: () => '',
  categoria: () => ({ categoria: 'Nova categoria', itens: [] }),
  item: () => ({ icone: 'camera', nome: '', descricao: '' }),
};

const $ = (s) => document.querySelector(s);
const editor = $('#editor');
const statusEl = $('#status');
const st = { senha: '', data: null, sha: null, dirty: false, open: new Set(['projetos.0']) };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad = (n) => String(n).padStart(2, '0');

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  let o = obj;
  for (const k of keys) {
    if (o[k] == null) o[k] = {};
    o = o[k];
  }
  o[last] = value;
}

function plataforma(url) {
  if (!url.trim()) return ['', 'vazio'];
  if (/(youtube\.com\/(watch\?(.*&)?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/.test(url)) return ['YouTube', 'ok'];
  if (/instagram\.com\/([\w.]+\/)?(reel|reels|p|tv)\/[\w-]+/.test(url)) return ['Instagram', 'ok'];
  return ['Link não reconhecido', 'ruim'];
}

/* ---------- desenho do formulário ---------- */
function field(label, path, opts = {}) {
  const v = getPath(st.data, path) ?? '';
  const attrs = `data-path="${path}"${opts.num ? ' data-num' : ''} id="f-${path}"`;
  const input = opts.textarea
    ? `<textarea ${attrs} rows="${opts.rows || 3}">${esc(v)}</textarea>`
    : opts.select
      ? `<select ${attrs}>${opts.select.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select>`
      : `<input ${attrs} type="${opts.num ? 'number' : 'text'}" value="${esc(v)}"${opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : ''}>`;
  return `<label class="field${opts.wide ? ' wide' : ''}" for="f-${path}"><span class="mono">${label}</span>${input}${opts.hint ? `<small>${opts.hint}</small>` : ''}</label>`;
}

const moveBtns = (path, i, n) =>
  `<span class="moves"><button type="button" class="icon" data-act="up" data-path="${path}" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button><button type="button" class="icon" data-act="down" data-path="${path}" ${i === n - 1 ? 'disabled' : ''} aria-label="Descer">↓</button></span>`;
const delBtn = (path, label = 'Remover') => `<button type="button" class="del mono" data-act="del" data-path="${path}">${label}</button>`;

function videoRow(pi, vi, n) {
  const path = `projetos.${pi}.videos.${vi}`;
  const url = getPath(st.data, path) || '';
  const [nome, tipo] = plataforma(url);
  return `<div class="vrow">
    <span class="mono vnum">${pad(vi + 1)}</span>
    <input data-path="${path}" id="f-${path}" type="url" inputmode="url" value="${esc(url)}" placeholder="Cola aqui o link do YouTube ou Instagram" aria-label="Link do vídeo ${vi + 1}">
    <span class="tag ${tipo}" data-tag="${path}">${nome}</span>
    ${moveBtns(path, vi, n)}
    <button type="button" class="icon" data-act="del" data-path="${path}" aria-label="Tirar vídeo ${vi + 1}">✕</button>
  </div>`;
}

function projeto(p, i, n) {
  const path = `projetos.${i}`;
  const vids = p.videos || [];
  return `<details class="proj" data-key="${path}"${st.open.has(path) ? ' open' : ''}>
    <summary><span class="pnum">${pad(i + 1)}</span><b>${esc(p.titulo || 'Sem título')}</b>${p.principal ? '<span class="tag ok">principal</span>' : ''}<span class="mono dim">${vids.length} vídeo${vids.length === 1 ? '' : 's'}</span></summary>
    <div class="pbody">
      <div class="grid">
        ${field('Título', `${path}.titulo`)}
        ${field('Papel', `${path}.papel`)}
        ${field('Cliente', `${path}.cliente`)}
        ${field('Formato', `${path}.formato`)}
        ${field('Ano', `${path}.ano`, { placeholder: 'ex.: 2025' })}
        <label class="field check"><input type="checkbox" data-act="principal" data-path="${path}"${p.principal ? ' checked' : ''}><span>Projeto principal (abre primeiro no site)</span></label>
        ${field('Texto', `${path}.texto`, { textarea: true, wide: true })}
        ${field('Botão do perfil: texto', `${path}.perfil.texto`, { placeholder: 'ex.: @concept.qg no Instagram' })}
        ${field('Botão do perfil: link', `${path}.perfil.url`, { placeholder: 'https://…' })}
      </div>
      <h3 class="mono">Vídeos <span class="dim">· a ordem aqui é a ordem no site</span></h3>
      <div class="videos">${vids.map((_, vi) => videoRow(i, vi, vids.length)).join('') || '<p class="dim mono">Nenhum vídeo ainda.</p>'}</div>
      <button type="button" class="add mono" data-act="add" data-path="${path}.videos" data-novo="video">+ Adicionar vídeo</button>
      <div class="pfoot">${moveBtns(path, i, n)}${delBtn(path, 'Remover projeto')}</div>
    </div>
  </details>`;
}

function render() {
  const d = st.data;
  const servicos = d.servicos || [];
  const kit = d.kit || [];
  editor.innerHTML = `
    <section class="card">
      <h2>Projetos</h2>
      <p class="dim">Abre um projeto pra editar. Pra trocar um vídeo, apaga o link e cola o novo.</p>
      ${d.projetos.map((p, i) => projeto(p, i, d.projetos.length)).join('')}
      <button type="button" class="add mono" data-act="add" data-path="projetos" data-novo="projeto">+ Novo projeto</button>
    </section>

    <section class="card">
      <h2>Abertura</h2>
      <div class="grid">
        ${field('Nome', 'nome')}
        ${field('Frase manuscrita', 'chamada')}
        ${field('Introdução', 'intro', { textarea: true, wide: true })}
        <label class="field" for="f-cor"><span class="mono">Cor de destaque</span><span class="color"><input type="color" id="f-cor" data-path="cor" value="${esc(d.cor || '#e3261c')}"><code>${esc(d.cor || '')}</code></span></label>
      </div>
    </section>

    <section class="card">
      <h2>Outros trabalhos</h2>
      ${servicos.map((_, i) => `<div class="vrow simple">${field(`Trabalho ${pad(i + 1)}`, `servicos.${i}`)}${moveBtns(`servicos.${i}`, i, servicos.length)}<button type="button" class="icon" data-act="del" data-path="servicos.${i}" aria-label="Tirar">✕</button></div>`).join('')}
      <button type="button" class="add mono" data-act="add" data-path="servicos" data-novo="servico">+ Adicionar trabalho</button>
    </section>

    <section class="card">
      <h2>Kit</h2>
      ${kit.map((c, ci) => `<details class="proj" data-key="kit.${ci}"${st.open.has(`kit.${ci}`) ? ' open' : ''}>
        <summary><span class="pnum">${pad(ci + 1)}</span><b>${esc(c.categoria)}</b><span class="mono dim">${c.itens.length} ite${c.itens.length === 1 ? 'm' : 'ns'}</span></summary>
        <div class="pbody">
          <div class="grid">${field('Categoria', `kit.${ci}.categoria`)}</div>
          ${c.itens.map((_, ii) => `<div class="kitem">
            ${field('Nome', `kit.${ci}.itens.${ii}.nome`)}
            ${field('Descrição', `kit.${ci}.itens.${ii}.descricao`)}
            ${field('Desenho', `kit.${ci}.itens.${ii}.icone`, { select: ICONES })}
            ${field('Qtd.', `kit.${ci}.itens.${ii}.qtd`, { num: true })}
            <span class="kact">${moveBtns(`kit.${ci}.itens.${ii}`, ii, c.itens.length)}<button type="button" class="icon" data-act="del" data-path="kit.${ci}.itens.${ii}" aria-label="Tirar item">✕</button></span>
          </div>`).join('')}
          <button type="button" class="add mono" data-act="add" data-path="kit.${ci}.itens" data-novo="item">+ Adicionar item</button>
          <div class="pfoot">${moveBtns(`kit.${ci}`, ci, kit.length)}${delBtn(`kit.${ci}`, 'Remover categoria')}</div>
        </div>
      </details>`).join('')}
      <button type="button" class="add mono" data-act="add" data-path="kit" data-novo="categoria">+ Nova categoria</button>
    </section>

    <section class="card">
      <h2>Contato</h2>
      <div class="grid">
        ${field('WhatsApp (só números, com 55 e DDD)', 'contato.whatsapp', { placeholder: '5547999999999' })}
        ${field('WhatsApp como aparece no site', 'contato.whatsappTexto')}
        ${field('Instagram (sem @)', 'contato.instagram')}
      </div>
    </section>`;
}

/* ---------- edição ---------- */
function marcar(msg) {
  st.dirty = true;
  statusEl.textContent = msg || 'Alterações não salvas';
  statusEl.className = 'status mono warn';
}

editor.addEventListener('input', (e) => {
  const el = e.target.closest('[data-path]');
  if (!el || el.dataset.act) return;
  const path = el.dataset.path;
  let v = el.value;
  if ('num' in el.dataset) v = v === '' ? undefined : Number(v);
  setPath(st.data, path, v);
  const tag = editor.querySelector(`[data-tag="${path}"]`);
  if (tag) {
    const [nome, tipo] = plataforma(v);
    tag.textContent = nome;
    tag.className = `tag ${tipo}`;
  }
  if (path === 'cor') el.nextElementSibling.textContent = v;
  marcar();
});

editor.addEventListener('toggle', (e) => {
  const d = e.target;
  if (d.matches && d.matches('details[data-key]')) d.open ? st.open.add(d.dataset.key) : st.open.delete(d.dataset.key);
}, true);

editor.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const { act, path } = b.dataset;
  const keys = path.split('.');

  if (act === 'principal') {
    const idx = Number(keys[1]);
    st.data.projetos.forEach((p, i) => {
      if (i === idx && b.checked) p.principal = true;
      else delete p.principal;
    });
    marcar();
    render();
    return;
  }

  if (act === 'add') {
    const list = getPath(st.data, path) || [];
    list.push(NOVO[b.dataset.novo]());
    setPath(st.data, path, list);
    if (b.dataset.novo === 'projeto') st.open.add(`projetos.${list.length - 1}`);
    if (b.dataset.novo === 'categoria') st.open.add(`kit.${list.length - 1}`);
    marcar();
    render();
    const nova = editor.querySelectorAll(`[data-path^="${path}.${list.length - 1}"]`)[0];
    if (nova && nova.focus) nova.focus();
    return;
  }

  const idx = Number(keys.pop());
  const list = getPath(st.data, keys.join('.'));

  if (act === 'del') {
    const grande = b.classList.contains('del');
    if (grande && !b.dataset.sure) {
      b.dataset.sure = '1';
      b.textContent = 'Clica de novo pra confirmar';
      return;
    }
    list.splice(idx, 1);
  } else if (act === 'up' && idx > 0) {
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
  } else if (act === 'down' && idx < list.length - 1) {
    [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
  } else return;
  marcar();
  render();
});

/* ---------- servidor ---------- */
async function api(acao, extra = {}) {
  const r = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acao, senha: st.senha, ...extra }),
  });
  let data = {};
  try {
    data = await r.json();
  } catch {}
  if (!r.ok) throw Object.assign(new Error(data.erro || `Erro ${r.status}`), { status: r.status });
  return data;
}

function limpar(d) {
  const c = structuredClone(d);
  c.projetos.forEach((p) => {
    p.videos = (p.videos || []).map((v) => v.trim()).filter(Boolean);
    if (p.perfil && !p.perfil.url && !p.perfil.texto) delete p.perfil;
  });
  c.servicos = (c.servicos || []).map((s) => s.trim()).filter(Boolean);
  c.kit.forEach((k) => k.itens.forEach((it) => { if (it.qtd == null || it.qtd === '' || Number.isNaN(it.qtd)) delete it.qtd; }));
  return c;
}

$('#salvar').addEventListener('click', async () => {
  const btn = $('#salvar');
  btn.disabled = true;
  statusEl.textContent = 'Salvando…';
  statusEl.className = 'status mono';
  try {
    const conteudo = limpar(st.data);
    for (const p of conteudo.projetos) {
      const k = p.videos.findIndex((v) => plataforma(v)[1] !== 'ok');
      if (k >= 0) throw new Error(`O vídeo ${pad(k + 1)} de "${p.titulo}" não é link do YouTube nem do Instagram.`);
    }
    const r = await api('salvar', { conteudo, sha: st.sha });
    st.sha = r.sha;
    st.data = conteudo;
    st.dirty = false;
    render();
    statusEl.textContent = 'Salvo. O site atualiza em cerca de 1 minuto.';
    statusEl.className = 'status mono good';
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.className = 'status mono bad';
  } finally {
    btn.disabled = false;
  }
});

window.addEventListener('beforeunload', (e) => {
  if (st.dirty) e.preventDefault();
});

async function entrar(senha, silencioso) {
  st.senha = senha;
  const msg = $('#login-msg');
  msg.textContent = silencioso ? '' : 'Entrando…';
  try {
    const r = await api('carregar');
    st.data = r.conteudo;
    st.sha = r.sha;
    try { sessionStorage.setItem('ps-admin', senha); } catch {}
    $('#login').hidden = true;
    $('#app').hidden = false;
    render();
    statusEl.textContent = 'Tudo salvo';
    statusEl.className = 'status mono good';
  } catch (err) {
    try { sessionStorage.removeItem('ps-admin'); } catch {}
    msg.textContent = silencioso ? '' : err.message;
  }
}

$('#login').addEventListener('submit', (e) => {
  e.preventDefault();
  entrar($('#senha').value);
});

try {
  const salva = sessionStorage.getItem('ps-admin');
  if (salva) entrar(salva, true);
} catch {}
