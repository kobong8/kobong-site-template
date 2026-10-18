export const modes = ['presentation', 'tutorial'];

export function validateSite(site) {
  if (!site || !site.id || !site.title || !modes.includes(site.defaultMode) || !site.chapters?.length)
    throw new Error('사이트 ID, 제목, 기본 모드와 한 개 이상의 장이 필요합니다.');
  const ids = new Set();
  for (const chapter of site.chapters) {
    if (!/^[a-z0-9-]+$/.test(chapter.id) || ids.has(chapter.id))
      throw new Error(`고유한 영문 소문자 장 ID가 필요합니다: ${chapter.id}`);
    ids.add(chapter.id);
    if (!chapter.title || !chapter.takeaway || !Array.isArray(chapter.cards))
      throw new Error(`제목, 카드, 핵심 메시지를 확인하세요: ${chapter.id}`);
  }
  return site;
}

export function resolveRoute(hash, sites) {
  const [siteId, requestedMode, chapterId] = hash.replace(/^#\/?/, '').split('/');
  const site = sites.find(item => item.id === siteId);
  if (!site) return null;
  const index = Math.max(0, site.chapters.findIndex(chapter => chapter.id === chapterId));
  return { site, mode: modes.includes(requestedMode) ? requestedMode : site.defaultMode, index };
}

export const route = (site, mode, index) => `#/${site.id}/${mode}/${site.chapters[index].id}`;
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
export function safeURL(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
