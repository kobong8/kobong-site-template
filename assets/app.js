import { sites } from '../content/examples.js';
import { escapeHTML as e, safeURL, validateSite, resolveRoute, route } from './model.js';

const app = document.querySelector('#app');
const status = document.querySelector('#status');
let state;
let observer;
let focused = false;
let renderVersion = 0;
const checks = new Set();
const number = n => String(n + 1).padStart(2, '0');
const announce = message => { status.textContent = message; };

function blockHTML(block, chapter, index) {
  const title = block.title ? `<h3>${e(block.title)}</h3>` : '';
  switch (block.type) {
    case 'paragraph': return `<p>${e(block.text)}</p>`;
    case 'notice': return `<aside class="notice">${title}<p>${e(block.text)}</p></aside>`;
    case 'code': return `<div class="code-block">${title}<button data-copy aria-label="${e(block.title)} 복사">복사</button><pre tabindex="0"><code>${e(block.text)}</code></pre><p class="copy-status" role="status"></p></div>`;
    case 'details': return `<details class="extra"><summary>${e(block.title)}</summary><p>${e(block.text)}</p></details>`;
    case 'steps': return `<div class="steps">${title}<ol>${block.items.map(text => `<li>${e(text)}</li>`).join('')}</ol></div>`;
    case 'checklist': return `<fieldset class="checklist"><legend>${e(block.title)}</legend>${block.items.map((text, i) => { const key = `${state.site.id}/${chapter.id}/${index}/${i}`; return `<label><input type="checkbox" data-check="${e(key)}" ${checks.has(key) ? 'checked' : ''}> <span>${e(text)}</span></label>`; }).join('')}<small>체크 상태는 이 페이지를 열어 둔 동안 유지됩니다.</small></fieldset>`;
    case 'comparison': return `<div>${title}<div class="comparison"><section><h4>일반적인 요청</h4><p>${e(block.before)}</p></section><section><h4>조건을 담은 요청</h4><p>${e(block.after)}</p></section></div></div>`;
    case 'table': return `<div class="table-wrap" tabindex="0" role="region" aria-label="${e(block.title)}"><table><caption>${e(block.title)}</caption><thead><tr>${block.headers.map(text => `<th scope="col">${e(text)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(text => `<td>${e(text)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    default: throw new Error(`지원하지 않는 본문 블록: ${block.type}`);
  }
}

function chapterHTML(chapter, index) {
  const site = state.site;
  const session = site.chapters.filter(item => item.group === chapter.group);
  const local = session.indexOf(chapter) + 1;
  return `<article class="chapter" id="${e(chapter.id)}" aria-labelledby="title-${e(chapter.id)}">
    <div class="slide-top"><span class="eyebrow">${number(index)} · ${e(site.author)} · ${e(site.affiliation)}</span><span class="session">SESSION ${local} / ${session.length}</span></div>
    <h1 id="title-${e(chapter.id)}" tabindex="-1">${e(chapter.title)}</h1><p class="subtitle">${e(chapter.subtitle)}</p>
    ${chapter.evidence ? `<span class="badge">${e(chapter.evidence)}</span>` : ''}
    <div class="cards ${chapter.cards.length === 4 ? 'four' : ''}">${chapter.cards.map(card => `<section class="card"><span class="card-label">${e(card.label)}</span><h2>${e(card.title)}</h2><ul>${card.points.map(point => `<li>${e(point)}</li>`).join('')}</ul></section>`).join('')}</div>
    ${chapter.detail ? `<div class="detail"><h2>${e(chapter.detail.title)}</h2><p>${e(chapter.detail.text)}</p></div>` : ''}
    ${state.mode === 'tutorial' ? `<div class="body-blocks">${(chapter.body || []).map((block, i) => blockHTML(block, chapter, i)).join('')}</div>` : ''}
    <aside class="takeaway"><span>KEY TAKEAWAY</span><p>${e(chapter.takeaway)}</p></aside>
    ${chapter.sources?.length ? `<div class="sources">참고 자료 ${chapter.sources.map(source => { const url = safeURL(source.url); return url ? `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(source.title)} (새 탭)</a>` : e(source.title); }).join(' · ')}</div>` : ''}
  </article>`;
}

function landing() {
  document.title = 'Kobong · Site Template';
  document.body.className = '';
  app.innerHTML = `<main class="landing" id="main"><a class="wordmark" href="#/">Kobong<span> / KNOWLEDGE KIT</span></a><div class="landing-intro"><p class="eyebrow">EXPLAIN CLEARLY. LEARN BY DOING.</p><h1>같은 지식,<br>다른 전달 방식.</h1><p>함께 보는 발표와 직접 따라 하는 튜토리얼.<br>콘텐츠에 맞는 읽기 경험을 선택하세요.</p></div><div class="template-grid">${sites.map((site, i) => `<section class="template-card ${site.accent}"><div class="template-meta"><span>${site.label}</span><span>0${i + 1}</span></div><h2>${e(site.title)}</h2><p class="template-question">${e(site.description)}</p><p>${e(site.introduction)}</p><ul class="themes">${[...new Set(site.chapters.map(chapter => chapter.group.split(' · ')[1]))].map(group => `<li>${e(group)}</li>`).join('')}</ul><a class="button primary" href="${route(site, site.defaultMode, 0)}">${i === 0 ? '발표 템플릿 보기' : '튜토리얼 시작하기'} <span aria-hidden="true">↗</span></a><a class="secondary-link" href="${route(site, i === 0 ? 'tutorial' : 'presentation', 0)}">${i === 0 ? '스크롤로 읽기' : '발표형으로 보기'}</a></section>`).join('')}</div><p class="landing-note">KOBONG SITE TEMPLATE · SAIF 2026 디자인 기반 · 교육용 축약 예제</p></main>`;
}

function render() {
  const version = ++renderVersion;
  observer?.disconnect();
  state = resolveRoute(location.hash, sites);
  if (!state) { focused = false; landing(); return; }
  const { site, mode, index } = state;
  document.title = `${site.title} · Kobong`;
  document.body.className = `${mode} ${site.accent}${focused ? ' focused' : ''}`;
  const groups = [...new Set(site.chapters.map(chapter => chapter.group))];
  app.innerHTML = `<aside class="sidebar"><a class="brand" href="#/">Kobong<b> /</b><small>KNOWLEDGE KIT</small></a><p class="edition">${e(site.label)} <span>EXAMPLE</span></p><p class="nav-title">${e(site.title)}</p><nav aria-label="장별 목차">${groups.map(group => `<details open><summary>${e(group)}</summary>${site.chapters.map((chapter, i) => chapter.group === group ? `<a data-index="${i}" href="${route(site, mode, i)}"><span>${number(i)}</span><span>${e(chapter.title.replaceAll('\n', ' '))}</span></a>` : '').join('')}</details>`).join('')}</nav><div class="sidebar-bottom">${e(site.author)} · ${e(site.affiliation)}<small>교육용 축약 예제</small><a href="#/">← 템플릿 선택</a></div></aside>
    <div class="workspace"><header><a href="#/" class="breadcrumb">Kobong <span>/</span> ${e(site.title)}</a><div class="toolbar"><button id="mode">${mode === 'presentation' ? '스크롤로 읽기' : '발표형으로 보기'}</button><button id="focus" aria-pressed="${focused}">${focused ? '집중 모드 종료' : '집중 모드'} <kbd>F</kbd></button></div></header>
    <div class="mobile-nav"><label for="chapter-select">목차</label><select id="chapter-select">${groups.map(group => `<optgroup label="${e(group)}">${site.chapters.map((chapter, i) => chapter.group === group ? `<option value="${i}" ${i === index ? 'selected' : ''}>${number(i)} · ${e(chapter.title.replaceAll('\n', ' '))}</option>` : '').join('')}</optgroup>`).join('')}</select></div>
    <main id="main">${mode === 'presentation' ? chapterHTML(site.chapters[index], index) : site.chapters.map(chapterHTML).join('')}</main>
    <footer><span id="counter"></span><nav class="page-dots" aria-label="장 바로가기">${site.chapters.map((chapter, i) => `<a data-index="${i}" href="${route(site, mode, i)}" aria-label="${e(chapter.title)}">${i + 1}</a>`).join('')}</nav><div class="paging"><button id="previous">← 이전</button><button id="next">다음 →</button></div></footer>
    <div class="progress" role="progressbar" aria-label="현재 장" aria-valuemin="1" aria-valuemax="${site.chapters.length}"><div></div></div></div>`;
  updatePosition(index);
  document.querySelector('#mode').onclick = () => navigate(state.index, mode === 'presentation' ? 'tutorial' : 'presentation', true);
  document.querySelector('#focus').onclick = toggleFocus;
  document.querySelector('#previous').onclick = () => navigate(state.index - 1);
  document.querySelector('#next').onclick = () => navigate(state.index + 1);
  document.querySelector('#chapter-select').onchange = event => navigate(Number(event.target.value));
  app.querySelectorAll('[data-index]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); navigate(Number(link.dataset.index)); }));
  if (mode === 'tutorial') {
    requestAnimationFrame(() => {
      if (version !== renderVersion) return;
      document.getElementById(site.chapters[index].id).scrollIntoView({ block: 'start' });
      observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          const next = site.chapters.findIndex(chapter => chapter.id === visible[0].target.id);
          updatePosition(next);
          history.replaceState(null, '', route(site, mode, next));
        }
      }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
      app.querySelectorAll('.chapter').forEach(chapter => observer.observe(chapter));
    });
  } else window.scrollTo(0, 0);
}

function updatePosition(index) {
  state.index = index;
  const { site } = state;
  document.querySelector('#counter').textContent = `${number(index)} / ${String(site.chapters.length).padStart(2, '0')}`;
  document.querySelector('#previous').disabled = index === 0;
  document.querySelector('#next').disabled = index === site.chapters.length - 1;
  document.querySelector('#chapter-select').value = index;
  app.querySelectorAll('[data-index]').forEach(link => {
    const active = Number(link.dataset.index) === index;
    if (active) { link.setAttribute('aria-current', 'step'); const group = link.closest('details'); if (group) group.open = true; }
    else link.removeAttribute('aria-current');
  });
  const active = app.querySelector('.sidebar [aria-current]');
  const nav = active?.closest('nav');
  if (nav && active) {
    const a = active.getBoundingClientRect(), n = nav.getBoundingClientRect();
    if (a.top < n.top || a.bottom > n.bottom) nav.scrollTop += a.top - n.top - 40;
  }
  const progress = document.querySelector('.progress');
  progress.setAttribute('aria-valuenow', index + 1);
  progress.firstElementChild.style.width = `${(index + 1) / site.chapters.length * 100}%`;
}

function navigate(index, mode = state.mode, modeChange = false) {
  const { site } = state;
  index = Math.max(0, Math.min(index, site.chapters.length - 1));
  history[modeChange || mode === 'tutorial' ? 'pushState' : 'replaceState'](null, '', route(site, mode, index));
  if (mode === 'tutorial' && state.mode === mode) {
    updatePosition(index);
    document.getElementById(site.chapters[index].id).scrollIntoView({ block: 'start' });
  } else render();
  document.getElementById(`title-${site.chapters[index].id}`)?.focus({ preventScroll: true });
  announce(`${index + 1}장. ${site.chapters[index].title}`);
}

async function toggleFocus() {
  focused = !focused;
  document.body.classList.toggle('focused', focused);
  const button = document.querySelector('#focus');
  button.setAttribute('aria-pressed', focused);
  button.innerHTML = `${focused ? '집중 모드 종료' : '집중 모드'} <kbd>F</kbd>`;
  try {
    if (focused && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else if (!focused && document.fullscreenElement) await document.exitFullscreen();
  } catch { /* Fullscreen permission is optional; the wider layout remains usable. */ }
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && focused) {
    focused = false;
    document.body.classList.remove('focused');
    const button = document.querySelector('#focus');
    if (button) { button.setAttribute('aria-pressed', 'false'); button.innerHTML = '집중 모드 <kbd>F</kbd>'; }
  }
});
document.addEventListener('keydown', event => {
  if (!state || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
  if (event.key === 'Escape' && focused) { event.preventDefault(); toggleFocus(); return; }
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFocus(); return; }
  if (state.mode !== 'presentation' || (event.key === ' ' && event.target.closest('button,a,summary'))) return;
  const moves = { ArrowRight: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, PageUp: -1 };
  if (event.key in moves) { event.preventDefault(); navigate(state.index + moves[event.key]); }
  else if (['Home', 'End'].includes(event.key)) { event.preventDefault(); navigate(event.key === 'Home' ? 0 : state.site.chapters.length - 1); }
});
app.addEventListener('change', event => {
  const key = event.target.dataset.check;
  if (key) event.target.checked ? checks.add(key) : checks.delete(key);
});
app.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const block = button.closest('.code-block');
  try {
    await navigator.clipboard.writeText(block.querySelector('code').textContent);
    block.querySelector('.copy-status').textContent = '복사했습니다.';
  } catch {
    const range = document.createRange(); range.selectNodeContents(block.querySelector('code'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    block.querySelector('.copy-status').textContent = '자동 복사가 차단되었습니다. 선택된 내용을 Ctrl+C 또는 복사 메뉴로 복사하세요.';
  }
});
window.addEventListener('hashchange', render);
try { sites.forEach(validateSite); render(); }
catch (error) { app.innerHTML = `<main class="landing"><h1>자료를 표시할 수 없습니다.</h1><p>${e(error.message)}</p><p>콘텐츠 설정을 확인한 후 새로고침하세요.</p><a href="./">다시 열기</a></main>`; }
