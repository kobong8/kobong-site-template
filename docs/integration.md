# 기존 사이트에 적용하기

두 기존 사이트는 수정하지 않았다. 이 저장소는 전체 원고 이식 결과가 아닌 공통 템플릿과 축약 예제다.

## lecture-devops

`lecture_note/*.html`의 강의를 `content/examples.js`와 같은 사이트 데이터로 옮기고 `defaultMode: 'presentation'`을 사용한다. 한 강의의 여러 장은 같은 `group`으로 묶는다.

1. `index.html`, `assets/`, `content/`를 별도 시범 폴더에 복사한다.
2. 예제 데이터를 실제 강의의 제목·카드·설명·핵심 메시지로 교체한다.
3. 기존 그림·표·상호작용은 별도로 이식한다. 텍스트 카드로 자동 변환되지 않는다.
4. 기존 목록에서 `#/강의-id/presentation/장-id`로 연결한다.
5. 기존 URL을 유지하려면 해당 주소의 안내 또는 새 주소로의 리디렉션을 별도로 추가한다.

## opencode-introduction

현재 React/TypeScript/Vite 프로젝트이며 `CONTENTS.md`, `src/content.ts`, `src/App.tsx`, `src/Presentation.tsx`가 원고와 화면을 담당한다.

- 독립 정적 사이트로 전환: 11개 장과 출처를 이 템플릿의 데이터로 옮기고 `defaultMode: 'tutorial'`을 지정한다. 공식 기능·사내 경험·교육 예시·버전 확인 구분을 유지한다. 기존 검색·필터는 별도 이식이 필요하다.
- 기존 React에 디자인만 적용: CSS 토큰과 `.sidebar`, `.workspace`, `.chapter`, `.cards`, `.takeaway`, `.body-blocks` 구조를 컴포넌트에 적용하고 기존 데이터 파서·검색·출처 기능을 유지한다. CSS를 앱 최상위 클래스 아래로 제한해 점진적으로 적용한다. `app.js`는 DOM을 직접 소유하므로 React 루트에서 동시에 실행하지 않는다.

기존 `?mode=present&chapter=...` / `#장-id`와 이 템플릿의 URL 계약은 다르다. 실제 전환 시 이전 주소를 읽는 어댑터와 11개 장의 대응표를 추가해야 한다. CSS 교체만으로 이식이 완료되는 것은 아니다.

## 콘텐츠 계약

```js
{
  id: 'my-course', title: '강의 제목', label: 'PRESENTATION',
  defaultMode: 'presentation', // 또는 tutorial
  description: '핵심 질문', introduction: '랜딩 설명',
  author: '발표자', affiliation: '소속', accent: 'blue', // 또는 teal
  chapters: [{
    id: 'first-step', group: '01 · 주제', title: '장 제목', subtitle: '설명',
    cards: [{ label: 'CONCEPT', title: '카드 제목', points: ['설명'] }],
    detail: { title: '적용하기', text: '보충 설명' }, // 선택
    takeaway: '기억할 한 가지',
    evidence: '교육용 예시', // 선택
    body: [{ type: 'paragraph', text: '본문' }], // 선택, 튜토리얼에서 표시
    sources: [{ title: '문서', url: 'https://example.com' }] // 선택
  }]
}
```

ID는 영문 소문자·숫자·하이픈이다. 장 ID는 사이트 안에서 유일해야 한다. 발행 후 ID를 유지하면 순서를 변경해도 링크가 유지된다. 내용은 HTML이 아닌 텍스트이며 제목과 코드의 `\n`은 줄바꿈이다. 출처는 HTTP(S)만 허용한다. 카드는 보통 3개, 요약은 4개를 권장한다.

본문 블록: `paragraph(text)`, `notice(title,text)`, `code(title,text)`, `details(title,text)`, `steps(title,items)`, `checklist(title,items)`, `comparison(title,before,after)`, `table(title,headers,rows)`. 실제 예시는 `content/examples.js`를 참고한다. Markdown 파서는 포함하지 않는다.
