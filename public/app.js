// Projetos que abrem na lista, player do YouTube e embed oficial do Instagram.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const host = (url) => (url.includes('youtube') ? 'YouTube' : url.includes('instagram') ? 'Instagram' : 'link');

// O script do Instagram só carrega quando alguém abre um projeto com post do Insta.
let igLoader;
function loadInstagram() {
  if (window.instgrm) return Promise.resolve();
  igLoader ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
  return igLoader;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function feature(stage, btn) {
  const { tipo, id, url, titulo } = btn.dataset;
  const feat = stage.querySelector('[data-feat]');
  stage.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', b === btn));

  const bar = `<div class="bar"><b>${esc(titulo)}</b><a class="mono" href="${esc(url)}" target="_blank" rel="noopener">Abrir no ${host(url)} ↗</a></div>`;

  if (tipo === 'youtube') {
    feat.innerHTML = `<div class="yt"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt=""><button class="pl" aria-label="Tocar ${esc(titulo)}"><span>▶</span></button></div>${bar}`;
    feat.querySelector('.pl').addEventListener('click', () => {
      feat.querySelector('.yt').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    });
  } else if (tipo === 'instagram') {
    feat.innerHTML = `<div class="ig"><blockquote class="instagram-media" data-instgrm-permalink="${esc(url)}?utm_source=ig_embed" data-instgrm-version="14"><a class="ig-wait mono" href="${esc(url)}" target="_blank" rel="noopener">Carregando o vídeo do Instagram…</a></blockquote></div>${bar}`;
    loadInstagram()
      .then(() => window.instgrm && window.instgrm.Embeds.process())
      .catch(() => {});
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
  if (scroll) document.getElementById('p-' + slug).scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
}

document.addEventListener('click', (e) => {
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

// O projeto principal já chega aberto.
const main = document.querySelector('.row.main') || document.querySelector('.row');
if (main) toggle(main.dataset.toggle, true);
