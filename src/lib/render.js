// Monta o HTML da página a partir do conteúdo. Roda na hora de publicar (Astro)
// e de novo no navegador, quando chega a versão mais nova salva pelo painel.
import { parseVideo, hostName, ICONES } from './media.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');
const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'projeto';
const ext = (url) => `href="${esc(url)}" target="_blank" rel="noopener"`;

export function preparar(c) {
  return (c.projetos || []).map((p, i) => {
    const videos = (p.videos || []).filter(Boolean).map((url, k) => {
      const v = parseVideo(url);
      if (v.tipo === 'youtube') {
        v.titulo = `Vídeo ${pad(k + 1)}`;
        v.thumb = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
      } else if (v.tipo === 'instagram') v.titulo = `${v.rotulo} ${pad(k + 1)}`;
      else v.titulo = `Link ${pad(k + 1)}`;
      return v;
    });
    // Palco largo se tiver ao menos um vídeo deitado do YouTube; só Shorts e Instagram usam o palco estreito.
    const horizontal = videos.some((v) => v.tipo === 'youtube' && !v.vertical);
    const soClipes = videos.length > 0 && videos.every((v) => v.tipo === 'youtube' && !v.vertical);
    const contagem = videos.length
      ? `${pad(videos.length)} ${soClipes ? 'clipes' : 'vídeos'} · ${hostName(videos[0].url)}`
      : p.perfil?.url ? hostName(p.perfil.url) : '';
    return { ...p, slug: `${slugify(p.titulo)}-${i + 1}`, num: pad(i + 1), videos, horizontal, contagem };
  });
}

function hero(c, projetos) {
  const [primeiro, ...resto] = String(c.nome || '').split(' ');
  const drips = [['6%', '.62em'], ['27%', '.34em'], ['52%', '.8em'], ['71%', '.22em'], ['90%', '.5em']]
    .map(([x, h]) => `<i class="drip" style="--x:${x};--h:${h}"></i>`).join('');
  return `<section class="hero wrap">
    <div class="name-wrap">
      <span class="made mono">Portfólio · <b>${new Date().getFullYear()}</b></span>
      <h1 class="name spray"><span>${esc(primeiro)}</span><span>${esc(resto.join(' '))}${drips}</span></h1>
      <span class="port hand">${esc(c.chamada)}</span>
    </div>
    <div class="hero-side">
      <div class="intro">
        <h2>↘ Introdução</h2>
        <p>${esc(c.intro)}</p>
        <span class="mono">Roteiro · Direção · Filmmaker · Fotografia</span>
      </div>
      <div class="hero-row">
        <div class="rating" aria-label="Classificação: livre"><b>L</b><span class="mono">Livre<br>pra todo<br>mundo</span></div>
        <div class="quick mono">
          ${projetos.slice(0, 3).map((p) => `<a href="#p-${p.slug}" data-open="${p.slug}">${esc(p.titulo)} <span>${p.num} ↓</span></a>`).join('')}
          <a href="#kit">Kit de set <span>↓</span></a>
        </div>
      </div>
    </div>
  </section>`;
}

function projeto(p) {
  const fotos = (p.fotos || []).filter(Boolean);
  const comThumb = p.videos.filter((v) => v.thumb);
  const meta = [['Papel', p.papel], ['Cliente', p.cliente], ['Formato', p.formato], ['Ano', p.ano]].filter(([, v]) => v);
  const fotosHTML = (extra) =>
    `<div class="photos${extra}">${fotos.map((f, k) => `<button data-foto="${k}" aria-label="Ampliar foto ${k + 1}"><img src="${esc(f)}" alt="" loading="lazy"></button>`).join('')}</div>`;
  const lista = p.videos.length > 0 && !p.videos.some((v) => v.thumb);
  const stage = p.videos.length
    ? `<div class="stage${p.horizontal ? '' : ' v'}">
        <div class="feat" data-feat></div>
        <div class="rail${lista ? ' list' : ''}" role="group" aria-label="Escolher vídeo">
          ${p.videos.map((v, k) => `<button data-pick data-tipo="${v.tipo}" data-id="${esc(v.id || '')}" data-url="${esc(v.url)}" data-titulo="${esc(v.titulo)}" data-vertical="${v.vertical || v.tipo === 'instagram' ? '1' : ''}" aria-pressed="${k === 0}">${
            lista
              ? `<span class="n">${pad(k + 1)}</span><b>${esc(v.titulo)}</b><span class="mono">${hostName(v.url)} ▸</span>`
              : `${v.thumb ? `<img src="${v.thumb}" alt="" loading="lazy">` : ''}<span class="mono">${esc(v.titulo)}</span>`
          }</button>`).join('')}
        </div>
      </div>${fotos.length ? fotosHTML(' full') : ''}`
    : `<div class="stage">${
        fotos.length
          ? fotosHTML('')
          : p.perfil?.url
            ? `<a class="album" ${ext(p.perfil.url)}><span class="mono">Série completa</span><b>Abrir o álbum ↗</b><span class="mono">${hostName(p.perfil.url)}</span></a>`
            : ''
      }</div>`;
  return `<article class="proj" id="p-${p.slug}">
    <button class="row${p.principal ? ' main' : ''}${comThumb.length ? '' : ' bare'}" data-toggle="${p.slug}" aria-expanded="false" aria-controls="panel-${p.slug}">
      <span class="num">${p.num}</span>
      ${comThumb.length ? `<span class="thumbs">${comThumb.slice(0, 3).map((v) => `<img src="${v.thumb}" alt="" loading="lazy">`).join('')}</span>` : ''}
      <span class="ttl"><b>${esc(p.titulo)}</b><span class="mono">${[p.papel, p.formato].filter(Boolean).map(esc).join(' · ')}<br>${esc(fotos.length && !p.videos.length ? `${pad(fotos.length)} fotos` : p.contagem)}</span></span>
      <span class="arr" aria-hidden="true">+</span>
    </button>
    <div class="panel" id="panel-${p.slug}" hidden>
      <div class="p-info">
        ${meta.length ? `<dl class="s-meta mono">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${p.texto ? `<p class="s-text">${esc(p.texto)}</p>` : ''}
        ${p.perfil?.url ? `<a class="btn mono" ${ext(p.perfil.url)}>${esc(p.perfil.texto || 'Ver perfil')} ↗</a>` : ''}
      </div>
      ${stage}
    </div>
  </article>`;
}

export function paginaHTML(c) {
  const projetos = preparar(c);
  const kit = c.kit || [];
  const totalKit = kit.reduce((n, k) => n + (k.itens || []).length, 0);
  const zap = `https://wa.me/${String(c.contato?.whatsapp || '').replace(/\D/g, '')}`;
  const ig = String(c.contato?.instagram || '').replace(/^@/, '');
  return `${hero(c, projetos)}

  <section class="wrap sec" id="projetos">
    <div class="sec-head"><h2>Projetos selecionados</h2><span class="hand">clica pra abrir ↓</span></div>
    <div class="rows">${projetos.map(projeto).join('')}</div>
  </section>

  <section class="wrap sec" id="outros">
    <div class="sec-head"><h2>Outros trabalhos</h2><span class="hand">o que mais eu faço</span></div>
    <ul class="services">${(c.servicos || []).map((s) => `<li><span class="w">${esc(s)}</span><span class="st" aria-hidden="true">✱</span></li>`).join('')}</ul>
  </section>

  <section class="paper sec" id="kit">
    <div class="wrap">
      <div class="kit-head">
        <h2 class="kit-title spray">Kit<span class="hand">mixed media: o que vai pro set</span></h2>
        <div class="rider mono"><b>Rider técnico</b><span>${totalKit} itens · ${kit.length} categorias</span></div>
      </div>
      <div class="gear">${kit.map((k, i) => `<div class="cat">
        <div class="cat-head mono"><span>${pad(i + 1)}</span><span>${esc(k.categoria)}</span></div>
        ${(k.itens || []).map((it) => `<div class="item"><svg viewBox="0 0 56 56" aria-hidden="true">${ICONES[it.icone] || ICONES.camera}</svg><div><b>${esc(it.nome)}${it.qtd ? `<span class="qty">×${esc(it.qtd)}</span>` : ''}</b><span class="mono">${esc(it.descricao)}</span></div></div>`).join('')}
      </div>`).join('')}</div>
    </div>
  </section>

  <section class="wrap sec" id="contato">
    <h2 class="cta spray">Bora criar<br><span class="acc">algo real.</span></h2>
    <div class="channels">
      ${c.contato?.whatsapp ? `<a class="ch" ${ext(zap)}><span class="mono">01</span><b>WhatsApp</b><span class="val mono">${esc(c.contato.whatsappTexto || c.contato.whatsapp)}</span><span class="arr" aria-hidden="true">↗</span></a>` : ''}
      ${ig ? `<a class="ch" ${ext(`https://www.instagram.com/${ig}/`)}><span class="mono">02</span><b>Instagram</b><span class="val mono">@${esc(ig)}</span><span class="arr" aria-hidden="true">↗</span></a>` : ''}
    </div>
    <footer class="mono"><span>${esc(c.nome)}</span><span>Roteiro. Filme. Foto.</span><span>Valeu por rolar até aqui</span></footer>
  </section>`;
}
