import test from 'node:test';
import assert from 'node:assert/strict';
import { sites } from '../content/examples.js';
import { validateSite, resolveRoute, route, safeURL, escapeHTML } from '../assets/model.js';
test('예제 데이터와 모든 영구 링크가 유효하다', () => {
  for (const site of sites) {
    assert.equal(validateSite(site), site);
    site.chapters.forEach((chapter, index) => {
      for (const mode of ['presentation', 'tutorial']) {
        const result = resolveRoute(route(site, mode, index), sites);
        assert.equal(result.site, site); assert.equal(result.index, index); assert.equal(result.mode, mode);
      }
    });
  }
});
test('잘못된 주소 복구', () => {
  assert.equal(resolveRoute('#/missing/presentation/example', sites), null);
  const result = resolveRoute('#/opencode-introduction/unknown/missing', sites);
  assert.equal(result.mode, 'tutorial'); assert.equal(result.index, 0);
});
test('중복 ID와 빈 콘텐츠 탐지', () => {
  assert.throws(() => validateSite({ ...sites[0], chapters: [] }));
  assert.throws(() => validateSite({ ...sites[0], chapters: [sites[0].chapters[0], sites[0].chapters[0]] }));
});
test('텍스트 escape와 위험한 출처 프로토콜 차단', () => {
  assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(safeURL('javascript:alert(1)'), null);
  assert.equal(safeURL('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(safeURL('https://example.com/guide'), 'https://example.com/guide');
});
test('튜토리얼의 예시 구분과 실습 블록', () => {
  const tutorial = sites.find(site => site.id === 'opencode-introduction');
  assert.ok(tutorial.chapters.every(chapter => chapter.evidence === '교육용 예시' && chapter.body.length));
  const types = new Set(tutorial.chapters.flatMap(chapter => chapter.body.map(block => block.type)));
  for (const type of ['code', 'steps', 'checklist', 'comparison', 'table', 'notice', 'details']) assert.ok(types.has(type));
});
