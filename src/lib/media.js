// Transforma o link colado no site.json num vídeo que o site sabe mostrar.

export function parseVideo(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    const vertical = /youtube\.com\/shorts\//.test(url);
    return { tipo: 'youtube', id: yt[1], vertical, url: vertical ? `https://www.youtube.com/shorts/${yt[1]}` : `https://www.youtube.com/watch?v=${yt[1]}` };
  }

  const ig = url.match(/instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/);
  if (ig) {
    const kind = ig[1] === 'p' ? 'p' : 'reel';
    return {
      tipo: 'instagram',
      id: ig[2],
      rotulo: kind === 'p' ? 'Post' : 'Reel',
      url: `https://www.instagram.com/${kind}/${ig[2]}/`,
    };
  }

  return { tipo: 'link', url };
}

export const hostName = (url = '') =>
  url.includes('youtube') ? 'YouTube' : url.includes('photos.google') ? 'Google Fotos' : url.includes('instagram') ? 'Instagram' : 'Link';

// Desenhos do kit, traço a mão em SVG (viewBox 0 0 56 56).
export const ICONES = {
  camera: '<rect x="6" y="18" width="44" height="28" rx="3"/><rect x="12" y="12" width="12" height="6"/><circle cx="31" cy="32" r="9"/><circle cx="31" cy="32" r="4"/><path d="M42 23h4"/>',
  action: '<rect x="12" y="16" width="32" height="24" rx="4"/><circle cx="34" cy="28" r="6"/><rect x="16" y="20" width="8" height="5"/>',
  zoom: '<rect x="10" y="16" width="36" height="24" rx="2"/><path d="M18 16v24M24 16v24M30 16v24M46 20h4v16h-4"/>',
  fish: '<path d="M12 40a16 16 0 0 1 32 0z"/><path d="M8 40h40v6H8z"/><path d="M20 34a8 8 0 0 1 16 0"/>',
  shotgun: '<rect x="6" y="22" width="40" height="10" rx="5"/><path d="M14 24v6M20 24v6M26 24v6M32 24v6"/><path d="M30 32v8M22 40h16"/>',
  lav: '<rect x="8" y="14" width="18" height="26" rx="3"/><path d="M13 20h8"/><circle cx="40" cy="22" r="5"/><path d="M40 27c0 10-8 12-16 14"/><path d="M36 18l8 8"/>',
  tube: '<rect x="22" y="4" width="12" height="48" rx="6"/><path d="M14 14l-4-2M14 28H8M14 42l-4 2M42 14l4-2M42 28h6M42 42l4 2"/>',
  torch: '<rect x="8" y="22" width="28" height="12" rx="3"/><path d="M36 20l10-6v28l-10-6z"/><path d="M50 22l4-2M50 28h5M50 34l4 2"/>',
  panel: '<rect x="10" y="10" width="36" height="30" rx="3"/><circle cx="20" cy="20" r="2"/><circle cx="28" cy="20" r="2"/><circle cx="36" cy="20" r="2"/><circle cx="20" cy="30" r="2"/><circle cx="28" cy="30" r="2"/><circle cx="36" cy="30" r="2"/><path d="M28 40v10"/>',
  lantern: '<circle cx="28" cy="30" r="18"/><path d="M11 24h34M10 30h36M11 36h34"/><path d="M28 4v8"/>',
  tripod: '<rect x="20" y="6" width="16" height="8" rx="2"/><path d="M28 14v10M28 24L12 52M28 24l16 28M28 24v28"/>',
  arm: '<circle cx="12" cy="44" r="4"/><circle cx="28" cy="24" r="4"/><circle cx="46" cy="12" r="4"/><path d="M15 41l10-14M31 22l12-8"/><path d="M6 48h12"/>',
  gimbal: '<path d="M28 50V36M22 50h12"/><path d="M28 36h14V18H24"/><rect x="10" y="12" width="14" height="12" rx="2"/>',
  battery: '<rect x="8" y="18" width="36" height="20" rx="3"/><path d="M44 24h4v8h-4"/><path d="M15 23v10M22 23v10M29 23v10"/>',
  charger: '<rect x="10" y="14" width="26" height="30" rx="4"/><path d="M36 22h8M36 30h8"/><path d="M24 22l-5 8h7l-5 8"/>',
};
