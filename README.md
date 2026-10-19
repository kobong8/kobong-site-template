# Kobong Site Template

SAIF-2026 양식을 바탕으로 만든 **발표형 + 스크롤 튜토리얼형** 웹 템플릿입니다. 기존 두 사이트는 수정하지 않았으며 전체 원고 대신 교육용 축약 예제를 제공합니다.

| 예제 | 기본 모드 | 구성 |
| --- | --- | --- |
| lecture-devops | 발표형 | 남색 목차, 카드, 설명, 핵심 메시지, 한 장씩 이동 |
| opencode-introduction | 튜토리얼형 | 연속 스크롤, 실습 단계, 코드 복사, 비교표, 체크리스트 |

## 실행

SAIF-2026과 같은 Python / FastAPI / Uvicorn 방식입니다. Python 3.10 이상에서 최초 한 번 가상환경과 패키지를 설치합니다. 화면 실행과 배포에 Node.js/npm은 필요하지 않습니다.

```powershell
cd kobong-site-template
.\scripts\install.ps1
.\scripts\start.ps1
```

`http://127.0.0.1:8931`을 엽니다. 이후에는 `start.ps1`만 실행하면 됩니다. SAIF의 8930 포트와 충돌하지 않도록 8931을 사용합니다. 포트를 바꾸려면 `.\scripts\start.ps1 -Port 8932`를 실행합니다. ES 모듈을 사용하므로 HTML 파일을 직접 여는 대신 HTTP 서버를 사용하세요.

- 발표: `http://127.0.0.1:8931/#/lecture-devops/presentation/devops`
- 튜토리얼: `http://127.0.0.1:8931/#/opencode-introduction/tutorial/prepare`

PowerShell 스크립트를 사용하지 않는 경우:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8931 --reload
```

## 기능

- 홈·발표·튜토리얼에서 테마 버튼 또는 T로 다크/라이트 모드 전환. 기본은 라이트 모드이며 선택은 브라우저에 저장됩니다.
- 동일 콘텐츠에서 발표/스크롤 전환과 현재 장 유지, 고정 ID 링크.
- 주제별 목차, 현재 위치 동기화, 모바일 선택 목록, 전체/그룹 내 번호.
- 발표 단축키: 방향키, PageUp/Down, Space, Home/End.
- F: 집중 모드, Esc: 종료. 전체 화면 권한이 없어도 넓은 레이아웃 사용.
- 실습 단계, 비교표, 체크리스트, 접이식 상세, 코드 복사 성공/실패 안내.
- 외부 폰트·CDN·분석 서비스·프런트엔드 프레임워크 없이 실행.

## 편집과 적용

`content/examples.js`에서 콘텐츠를, `assets/theme.css`에서 색과 간격을 수정합니다. `assets/app.js`는 공통 화면과 동작, `assets/model.js`는 데이터와 URL 처리를 담당합니다.

- [디자인과 요구사항 대응](docs/design.md)
- [기존 사이트 적용 방법과 콘텐츠 계약](docs/integration.md)
- [검증 기록과 수동 확인 항목](docs/verification.md)

## 검사

FastAPI 서버와 정적 파일 응답 검사:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py"
```

아래는 Node.js가 설치된 환경에서만 사용하는 선택적 프런트엔드 개발 검사입니다. `package.json`은 이 검사와 JavaScript 모듈 설정을 위해 유지하며 서버 실행에는 사용하지 않습니다.

```powershell
npm run check
npm test
```

## 정적 배포

GitHub Pages는 Python/FastAPI나 Node 개발 서버를 실행하지 않는 정적 호스팅입니다. 로컬 FastAPI는 `index.html`, `assets/`, `content/`를 제공하며 화면은 서버 API에 의존하지 않습니다. 같은 파일과 `.nojekyll`을 GitHub Pages에 올리면 동일한 화면을 사용할 수 있습니다. 별도 빌드는 없습니다.

GitHub 저장소의 Settings → Pages에서 **Deploy from a branch**, 배포 브랜치, **/(root)**를 선택합니다. 상대 경로를 사용하므로 `https://<계정>.github.io/kobong-site-template/`에서도 실행할 수 있습니다. 루트 배포 시 Python 코드나 문서 등 다른 추적 파일도 공개될 수 있습니다. 이번 작업에서는 배포·커밋·푸시를 실행하지 않았습니다.
