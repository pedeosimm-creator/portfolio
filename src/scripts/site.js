// Projetos que abrem na lista, player do YouTube e embed oficial do Instagram.
// Ao abrir, busca a versão mais nova do conteúdo (salva pelo painel) e redesenha se mudou.
import { paginaHTML, esc, PLAY } from '../lib/render.js';
import { buscarConteudo } from '../lib/config.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const host = (url) => (url.includes('youtube') ? 'YouTube' : url.includes('instagram') ? 'Instagram' : 'link');

function feature(stage, btn) {
  const { tipo, id, url, titulo, vertical } = btn.dataset;
  const feat = stage.querySelector('[data-feat]');
  stage.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', b === btn));
  const bar = `<div class="bar"><a class="mono" href="${esc(url)}" target="_blank" rel="noopener">Abrir no ${host(url)} ↗</a></div>`;

  if (tipo === 'youtube') {
    feat.innerHTML = `<div class="yt${vertical ? ' v' : ''}"><img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt=""><button class="pl" aria-label="Tocar ${esc(titulo)}"><span>${PLAY}</span></button></div>${bar}`;
    feat.querySelector('.pl').addEventListener('click', () => {
      feat.querySelector('.yt').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?autoplay=1&rel=0" title="${esc(titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    });
  } else if (tipo === 'instagram') {
    // Player oficial do Instagram direto em iframe (o mesmo do botão "incorporar" deles).
    feat.innerHTML = `<div class="ig"><iframe src="${esc(url)}embed/" title="${esc(titulo)}" loading="lazy" allowtransparency="true" allow="encrypted-media; picture-in-picture; fullscreen" scrolling="no"></iframe></div>${bar}`;
  } else {
    feat.innerHTML = bar;
  }
}

function toggle(slug, force, scroll) {
  document.querySelectorAll('.proj').forEach((art) => {
    const btn = art.querySelector('.row');
    const panel = art.querySelector('.panel');
    const open = btn.dataset.toggle === slug ? force ?? btn.getAttribute('aria-expanded') !== 'true' : false;
    btn.setAttribute('aria-expanded', open);
    panel.hidden = !open;
    art.classList.toggle('open', open);
    if (open) {
      const stage = panel.querySelector('.stage');
      const feat = stage && stage.querySelector('[data-feat]');
      if (feat && !feat.innerHTML) feature(stage, stage.querySelector('[data-pick][aria-pressed="true"]') || stage.querySelector('[data-pick]'));
    }
  });
  const alvo = document.getElementById('p-' + slug);
  if (scroll && alvo) alvo.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
}

// Tela cheia para fotos e vídeos, com setas e teclado.
let lb = null;
function midiaHTML(it) {
  if (it.tipo === 'youtube') return `<div class="lb-v${it.vertical ? ' v' : ''}"><iframe src="https://www.youtube-nocookie.com/embed/${esc(it.id)}?autoplay=1&rel=0" title="Vídeo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  if (it.tipo === 'instagram') return `<div class="lb-v v ig"><iframe src="${esc(it.url)}embed/" title="Vídeo do Instagram" allow="encrypted-media; picture-in-picture; fullscreen" scrolling="no"></iframe></div>`;
  return `<img src="${esc(it.url)}" alt="">`;
}
function abrir(itens, k) {
  if (!lb) {
    lb = Object.assign(document.createElement('div'), { className: 'lightbox', hidden: true });
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Galeria em tela cheia');
    lb.innerHTML = `<button class="ant" aria-label="Anterior">←</button><div class="lb-m"></div><button class="prox" aria-label="Próximo">→</button><button class="x mono" aria-label="Fechar">✕</button>`;
    document.body.appendChild(lb);
    lb.addEventListener('click', (e) => {
      if (e.target.closest('.ant')) passo(-1);
      else if (e.target.closest('.prox')) passo(1);
      else if (e.target.closest('.x') || e.target === lb || e.target.classList.contains('lb-m')) fechar();
    });
  }
  lb._itens = itens;
  lb._k = (k + itens.length) % itens.length;
  lb.querySelector('.lb-m').innerHTML = midiaHTML(itens[lb._k]);
  lb.querySelectorAll('.ant, .prox').forEach((b) => (b.hidden = itens.length < 2));
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  lb.querySelector('.x').focus();
}
const passo = (d) => abrir(lb._itens, lb._k + d);
function fechar() {
  lb.hidden = true;
  lb.querySelector('.lb-m').innerHTML = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => {
  if (!lb || lb.hidden) return;
  if (e.key === 'Escape') fechar();
  if (e.key === 'ArrowRight') passo(1);
  if (e.key === 'ArrowLeft') passo(-1);
});

document.addEventListener('click', (e) => {
  const foto = e.target.closest('[data-foto]');
  if (foto) {
    const itens = [...foto.parentElement.querySelectorAll('img')].map((i) => ({ tipo: 'foto', url: i.src }));
    return abrir(itens, Number(foto.dataset.foto));
  }
  const g = e.target.closest('[data-g]');
  if (g) {
    const visiveis = [...document.querySelectorAll('.gal [data-g]:not([hidden])')];
    return abrir(visiveis.map((b) => ({ ...b.dataset })), visiveis.indexOf(g));
  }
  const f = e.target.closest('[data-gfiltro]');
  if (f) {
    const k = f.dataset.gfiltro;
    document.querySelectorAll('.gal [data-g]').forEach((b) => (b.hidden = k !== 'tudo' && b.dataset.cat !== k));
    document.querySelectorAll('[data-gfiltro]').forEach((b) => b.setAttribute('aria-pressed', b === f));
    return;
  }
  const t = e.target.closest('[data-toggle]');
  if (t) return toggle(t.dataset.toggle);
  const pick = e.target.closest('[data-pick]');
  if (pick) return feature(pick.closest('.stage'), pick);
  const q = e.target.closest('[data-open]');
  if (q) {
    e.preventDefault();
    toggle(q.dataset.open, true, true);
  }
});

// Sem galeria, os links para ela somem.
function ajustarLinks() {
  const tem = !!document.getElementById('galeria');
  document.querySelectorAll('a[href="#galeria"]').forEach((a) => (a.hidden = !tem));
}

function abrirPrincipal() {
  const main = document.querySelector('.row.main') || document.querySelector('.row');
  if (main) toggle(main.dataset.toggle, true);
}

ajustarLinks();
abrirPrincipal();

// Versão mais nova salva pelo painel.
const inicial = document.getElementById('conteudo-inicial')?.textContent || '';
buscarConteudo()
  .then((c) => {
    if (JSON.stringify(c) === JSON.stringify(JSON.parse(inicial || '{}'))) return;
    const aberto = document.querySelector('.row[aria-expanded="true"]')?.dataset.toggle;
    document.querySelector('main').innerHTML = paginaHTML(c);
    if (c.cor) document.documentElement.style.setProperty('--acc', c.cor);
    ajustarLinks();
    if (aberto && document.querySelector(`[data-toggle="${aberto}"]`)) toggle(aberto, true);
    else abrirPrincipal();
  })
  .catch(() => {});
