# Improvements Tracker — @monochrome-edge/ui

> 2026-07-20 전체 감사(20-agent audit, 5개 차원 + 완결성 검증)에서 나온 피드백 추적 문서.
> 2026-07-20 2차 감사(8-agent 서브시스템 분석 + 적대적 재검증) 결과 병합: ✅ = 코드 재검증 완료, ◇ = 단일 분석 근거(반영 전 해당 파일 재확인 권장). 표기 없는 항목은 1차 감사분.
> 반영 시 체크(`[x]`)하고 날짜를 남긴다. 블로그(monochrome-edge-astro) 측 피드백은 그쪽 `IMPROVEMENTS.md`에서 추적.
> ⚠️ 이 저장소는 main push마다 자동 npm 릴리스가 나가므로, 반영 시 커밋 단위·semver 영향을 미리 계획할 것.

## ✅ 2026-07-20 반영 완료 (이번 세션, 비파괴 v1.14.0 배치)

빌드·lint·format·audit 게이트 전부 green으로 검증됨(`npm run build` 통과, 0 vulnerabilities).

- **exports 누락 해소**: `./ui/components/stepper`, `./editor`, `./editor/css`, `./package.json` 서브패스 추가 (package.json). dist 산출물은 이미 존재해 릴리스만 남음.
- **peerDependencies 선언**: react `>=18`, react-dom `>=18`, vue `^3.3`, jquery `^3` (기존 meta는 optional 유지).
- **VERSION drift 제거**: build 체인에 `version:update` 추가 → `ui/index.ts`·`src/index.ts` 상수가 package.json(1.13.20)과 자동 동기화. (스크립트에 이미 상수 동기화 로직 존재)
- **sideEffects 교정**: `**/jquery*.js`·`**/jquery*.cjs` 추가($.fn 등록 부수효과 보존).
- **engines 완화**: `>=24` → `>=18` (소비자 런타임은 브라우저).
- **esbuild 누출 제거**: `@esbuild/darwin-arm64` optionalDependencies에서 제거(transitively 제공, 리눅스 CI EBADPLATFORM 방지).
- **colors.css 상태색 덮어쓰기 제거**: `:root`의 `--color-success/-warning/-error/-info`·wine/olive 정의 삭제 → 테마 파일의 WCAG 튜닝 값이 라이트 모드에서도 적용.
- **web-components SSR 크래시 가드**: `HTMLElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {}` — Node import 시 크래시 방지.
- **Toast 포지셔닝 수리**: 컨테이너에 position 클래스(`.top-right` 등) 부착 → CSS 매칭. 죽은 `toast-show` 제거, dismiss는 `.closing`으로 퇴장 애니메이션 트리거.
- **nav-item active 가시성**: 좌측 보더 `--theme-accent`, `font-weight:600`, `--theme-text-emphasis`, inset ring — active 항목이 명확히 구분됨(데모 헤더 내비 원인 해소).
- **에디터 stored XSS (BlockRenderer)**: `renderInlineStyles`를 경계-스윕으로 재작성 — 모든 텍스트 이스케이프 + `safeUrl()`로 href allowlist(javascript:/data: 차단).
- **StorageCore 자동저장 덮어쓰기**: init Promise를 `this.ready`로 보관, 문서 load/save/delete/list가 `await this.ready` 후 진행 → 새로고침 간 영속성 복구.
- **CI/빌드 게이트 강제**: build 체인에 `check:audit`, pr-check.yml에 `quality-gate` 잡(format:check + lint + `npm audit --audit-level=high` + build).
- **Dependabot + 데일리 자동 머지**: `.github/dependabot.yml`(npm+actions 매일 09:00 KST, minor/patch 그룹) + `dependabot-automerge.yml`(patch/minor auto-merge + 데일리 스윕, major 제외).
- **데모 수리**: 코드 패널 여백(index.html), Copy 버튼 코드 우상단 코너 고스트로 이동(integration-guide.html), 사이드바 SVG 워드마크 폰트를 `--font-family-sans`로 통일.

### 미반영 (파괴적/대형 — 별도 트랙)

- 에디터 markdown 왕복 수리·`editor.js` 죽은 파일 삭제·부수 XSS 3종(Toolbar/CommandManager/Enhanced) — 아래 "Critical — 에디터" 참조.
- v2.0 파괴적: 레거시 CSS 레이어 dedup, WC 계약 통일, API 컨벤션 통일.
- a11y 전면 보강(Tabs/Modal/Dropdown ARIA), Stepper 좁은 폭 라벨 겹침(30자 고정 → 폭 비례), release-please 전환.
- 에디터 엔진 Tiptap 전환(하단 "에디터 엔진 전환 검토" 참조).

## 전략 방향 (가장 중요)

- [ ] **포지셔닝 재정의**: 커밋 저자 전원이 소유자(+봇), 실소비자는 본인 Astro 블로그(전체 CSS + Stepper)뿐인데 최근 노력이 아무도 안 쓰는 jQuery/React/Vue/WC 어댑터 4종 유지에 투입되는 미스매치.
  → 권고: README에 "개인 블로그·에디토리얼 사이트용 디자인 시스템 (레퍼런스 구현: 소유자 블로그)" 명시(S), jQuery/Vue 어댑터 maintenance-freeze 선언(S), 진짜 차별점(warm/cold × light/dark 4모드 테마, 에디터)에 집중.
- [ ] **에디터 로드맵 결정**: 에디터는 .ts 0개/JS 9,678줄로 라이브러리 최대 서브시스템인데 fix/freeze/extract 방향이 미정. markdown 왕복이 깨져 있어(아래) CMS 활용의 선행 과제. 권고 순서: exports 정리(S) → toMarkdown/parseContent 수리+왕복 스냅샷 테스트(M) → frontmatter 폼 + GitHub adapter는 블로그 Stage 3에서(L).

## Critical — 소비자가 실제로 깨지는 것

- [ ] **exports map 누락으로 문서화된 import가 실패**: `'./editor'`, `'./ui/components/stepper'` 서브패스 부재 → `ERR_PACKAGE_PATH_NOT_EXPORTED`. 에디터 README(54행)가 안내하는 import가 패키지 설치 직후 실패. Stepper는 dist 3형태+d.ts 전부 존재하는데 exports 4줄만 없음 — 블로그가 배럴 경유로 2.1배(8.1KB vs 3.8KB gz) JS를 지불 중. (S — 최우선)
- [ ] **atoms/colors.css `:root`가 라이트 모드에서 토큰의 WCAG 조정 상태색을 덮어씀**: aggregator에서 colors.css(L19)가 tokens(L12-13)보다 늦게 import + 특이도 동률 → 라이트 모드 상태색 실버그. tokens와 겹치는 `--color-*` 정의 삭제 + check-tokens.js에 파일 간 중복 정의 검출 추가. (S)
- [ ] **레거시(molecules/organisms) ↔ 신규(components/) CSS 이중 정의**: toast(12클래스)·modal(10+)·dropdown·tabs·search-bar·tree-view(3중!)·graph-view 등 최소 9개 컴포넌트가 동일 클래스명을 두 번 번들 → cascade 순서에 따른 '키메라 스타일' + 번들 20-25KB raw 낭비. 컴포넌트별 정본 확정 후 aggregator에서 제거. (M)
- [ ] **peerDependencies 미선언**: peerDependenciesMeta만 있고 peerDependencies 필드가 없어 무의미. react `>=18`, vue `^3.3`, jquery `^3` 선언. (S)
- [ ] **npm publish 전 테스트·타입체크 게이트 전무**: release.yml은 build → publish뿐, pr-check은 커밋 메시지 형식만 검사. `npm run typecheck && npx playwright test`를 publish 앞에 배치. (S)
- [ ] ✅ **에디터 stored XSS (주 렌더 경로)**: `core/BlockRenderer.js` `renderInlineStyles()` — 인라인 스타일이 하나라도 있으면 `content.text`를 이스케이프 없이 HTML로 조립하고 `style.href`를 스킴 검증 없이 `<a href>`에 삽입(`javascript:` 통과). 붙여넣기/가져온 문서로 재현되는 stored XSS. → 스타일 유무와 무관하

## Critical — 에디터 (2026-07-20 직접 재검증 ✅)

> 아래는 이번 세션에서 파일을 직접 열어 확인함. 상위 "에디터 로드맵 결정"의 근거이자, Tiptap 전환 시 대부분 엔진 레벨에서 자동 해소되는 항목(하단 전환 검토 참조).

- [ ] ✅ **stored XSS — 주 렌더 경로**: `core/BlockRenderer.js` `renderInlineStyles()`(L508~) — 인라인 스타일이 하나라도 있으면 `content.text`를 escapeHtml 없이 innerHTML로 조립하고(L513 `let html = content.text`), `style.href`를 스킴 검증 없이 `<a href="${style.href}">`에 삽입(L535, `javascript:` 통과). 스타일이 0개일 때만 escapeHtml 경유. 붙여넣기/가져온 문서로 재현 가능한 **stored XSS**. → 항상 escapeHtml 경유 + `ui/utils/security.ts`의 safeUrl로 href allowlist.
- [ ] ✅ **StorageCore init race → 자동저장이 기존 문서를 덮어씀**: `storage/StorageCore.js:12` 생성자가 `this.init()`을 await 없이 발사 → 첫 로드 시 `this.db === null` → 빈 문서 폴백 → 2초 자동저장이 IndexedDB의 실제 문서를 빈 내용으로 덮어씀. **새로고침 간 영속성이 사실상 파손**. → init Promise를 필드로 보관하고 모든 load/save가 `await this.ready` 후 진행.
- [ ] ✅ **레거시 `editor.js`가 생성 즉시 크래시**: `editor.js:401,405,410-411`이 `handlePaste`/`handleSelectionChange`/`handleDragOver`/`handleDrop`을 `.bind(this)`하지만 클래스에 정의된 것은 `handleInput`(L429)·`handleKeydown`(L457)뿐 → `new Editor()`가 TypeError. 이 죽은 1,010줄이 패키지에 그대로 출하 중. → 삭제(EditorCore가 대체) 또는 파일/참조 제거.
- [ ] ✅ **markdown 왕복 파손 + 죽은 변환 레지스트리**: `EditorCore.parseContent()`가 만드는 `bullet`/`number`/`divider` 타입을 `EditorDataModel.toMarkdown()`이 처리 못해 리스트 마커 소실·divider 소멸; 코드펜스 미파싱(펜스 안 `# x`가 h1 됨), 체크박스 상태 소실, 인라인 스타일 양방향 소실. 정작 `blocks/BlockManager.js`에는 checkbox/codeblock/image/math/table까지 다루는 더 완전한 변환 레지스트리가 있으나 `index.js` re-export 외엔 **아무도 안 쓰는 죽은 코드**. → 레지스트리로 일원화하거나 remark 직렬화기로 교체 + 왕복 골든 테스트. CMS 활용의 선행 과제.
- [ ] ✅ **IME 입력 경로 이원화**: `EditorCore`는 IME-aware `InputHandler`(compositionstart/end로 `isComposing` 가드, L98-115)를 생성하지만, `BlockRenderer.attachBlockListeners()`(L550)가 **각 블록에 별도 `input` 리스너를 또 부착** → 조합 중(한/중/일 입력) 두 경로 경합. 한국어 사용자 직접 영향. → 입력 처리를 InputHandler 단일 경로로 통합.
- [ ] ◇ **부수 XSS 3종**(단일 분석 근거): `BlockRendererEnhanced.js`(link href 비검증 + KaTeX 폴백 unescaped), `ui/ToolbarCore.js:389-453`(HTML 내보내기 이스케이프 0), `commands/CommandManager.js`(prompt URL + 선택 텍스트로 HTML 조립). BlockRenderer 수리와 함께 일괄.
- [ ] ◇ **에디터 chrome ARIA 0 + 전역 단축키 탈취**: toolbar/slash menu/tab bar/file tree 전부 role 없음, TreeFileView 키보드 0; `TabComponent.js`가 `Ctrl/Cmd+T·W`를 전역 가로챔 + destroy()가 document/window 리스너를 안 뗌.
- [ ] ◇ **에디터 죽은 CSS 3종 + fix 파일**: 실제 사용은 `styles/editor.css`뿐(빌드·docs/editor.html). 루트 `editor.css`/`editor-blocks.css`/`editor-table.css`는 미참조·값 충돌; `editor-theme-fix.css`는 JS가 주입하는 `style.cssText`를 덮으려는 증상 패치(존재하지 않는 `.ProseMirror` 셀렉터 포함).

## High — 패키징/배포 품질

- [ ] **VERSION 상수 drift**: 배포된 1.13.20 번들이 런타임에 '1.13.17'을 보고. 하드코딩 제거하고 빌드 시 rollup replace로 package.json version 주입 + prepublishOnly에 일치 assert. (S)
- [ ] **node16/nodenext TS 소비자에게 전 entry 타입 파손**: publint(.d.cts 부재) + attw(FalseESM, d.ts 내 확장자 없는 상대 import로 InternalResolutionError). bundler resolution만 green. tsconfig.types.json nodenext화 + .d.cts 분리, CI에 `publint`+`attw --pack` 게이트. (M)
- [ ] **sideEffects 불일치**: jquery entry($.fn 등록 순수 부수효과 모듈)가 glob에 누락 → production 번들에서 drop 가능. `'**/jquery*.js'` 추가 + stepper 자동 초기화를 별도 엔트리로 분리. (S)
- [ ] **CSS core/à la carte 엔트리 부재**: './css'(207KB raw/31.4KB gz) all-or-nothing. 레이어별: tokens 11K, base 11K, atoms 34K, molecules 96K, organisms 55K, templates 25K, utilities 14K, components 116K. 컴포넌트별 CSS는 패키지에 실리는데 exports가 차단. `./css/core`(tokens+base+atoms) + per-component CSS export 개방 — 블로그 CSS 예산(30KB gz) 회복의 열쇠. (M)
- [ ] **auto-release-per-push 재검토**: 태그 79개, 하루 11릴리스 버스트 후 수개월 공백 — 릴리스가 push의 부산물. release-please(릴리스 PR 머지 시만 publish) 전환 권고, 수제 semver 파서/changelog grep 삭제. (M)
- [ ] **GitHub Packages 이중 배포 silent divergence**: continue-on-error + npmjs만 catch-up 검사 → 실패 버전 영구 누락을 아무도 모름. 실소비자는 npmjs만 사용 — 폐기 권장. (S)
- [ ] release.yml 경합: concurrency 그룹 부재로 연속 push 시 bump 커밋 push 경합(늦은 런 red), 태그 삭제·재생성이 경합 시 태그를 다른 커밋으로 옮길 수 있음. `concurrency: {group: release}` 추가. (S) *(주의: "publish 후 고착" 시나리오는 검증 결과 성립하지 않음 — catch-up 로직이 처리함)*
- [ ] semver 감지 버그: `feat(scope)!:` 가 major로 승격 안 됨 — 정규식 `^(feat|fix)(\(.+\))?!:` + body `BREAKING CHANGE:` 검사로 교정 (release.yml:58, pr-check.yml:73 동시). (S)

## High — 컴포넌트 품질/접근성

- [x] ✅ **Stepper 좁은 폭 라벨 겹침 해소 (2026-07-20, PR #17)**: `renderLabels`에 **폭 비례 truncation**(노드 간격/문자폭 기반 `maxLabelChars`, snake→세로 폴백 스택도 기하학적으로 감지) 적용 → 320/375/1440px 오버플로우 0(puppeteer 실측). 잘린 라벨은 **SVG `<title>` 네이티브 툴팁**, 노드 호버는 **팝업이 전체 labelTitle/labelDesc(untruncated)** 표시. 남은 한계: 컨테이너 <200px 세로 스택은 SVG viewBox 확대 스케일로 일부 넘칠 수 있으나 툴팁으로 전체 확인 가능(실사용 모바일 범위 밖).
- [ ] ✅ **nav-item active 상태가 사실상 안 보임 (2026-07-20 데모 실측)**: `ui/molecules/nav-item.css`의 `.nav-item.is-active`가 비active와 **글자색·굵기 동일**하고 차이는 (1) `rgba(0,0,0,0.05)` 5% 배경, (2) `border-left-color: var(--theme-highlight)`(warm `#7a6a6a`, cold `#475569` — 채도 없는 뮤트색) 3px 좌측 보더뿐. monochrome 팔레트에서 대비가 거의 없어 "어느 항목이 선택됐는지" 식별 불가. 더 강한 단서인 `.nav-item-indicator`(accent 바)·`.nav-item-icon` 색변경은 마크업에 해당 요소가 있어야만 적용되는데 데모/일반 사용은 `<span class="nav-item-label">`만 씀. → active에 `--theme-accent` 좌측 보더 or font-weight 상향 or 배경 대비 강화, 그리고 `.nav-item-indicator`를 마크업 없이도 `::before`로 렌더. (S) *(데모 헤더 내비 "스타일 안 변함"의 근본 원인)*
- [ ] **인터랙티브 컴포넌트 키보드·ARIA 부재**: Tabs(role/화살표키 전무), Stepper(마우스 전용 — 키보드 사용자는 기능 접근 불가), Dropdown(Escape조차 미처리), Modal(focus trap/aria-modal 없음), TreeView, SearchBar(combobox 미완). 우선순위: SearchBar → Tabs → Modal → Stepper → Dropdown. (M-L)
- [ ] **Web Components 이중 계약**: MonochromeTabs는 vanilla와 다른 마크업 계약(.tab vs .tab-button), Modal은 Escape 미지원 재구현. tree-view식 canonical 래퍼로 전환. (M)
- [ ] **web-components.ts SSR 크래시**: `extends HTMLElement`가 모듈 top-level → Node에서 import 즉시 ReferenceError. Astro 소비자 함정. import-safe하게 이동. (S)
- [ ] API 컨벤션 드리프트: 생성자 (container, options) 6개 vs options 단독 3개, destroy 품질 3등급(cloneNode 핵/완전 정리/innerHTML만). CONTRIBUTING에 규약 명문화 후 다음 minor에서 통일. (M)

## Medium — 문서/데모/신뢰

- [ ] **DEVELOPMENT.md 사실상 허구**: 빌드 산출물명 불일치, 존재하지 않는 @next 채널, 죽은 도메인(monochrome-edge.dev), "core CSS 50KB" 예산(실제 207KB, 4배 초과). 전면 재작성 + gzip 예산 체크를 빌드에 자동화. (M)
- [ ] **ARCHITECTURE.md aspirational**: 미구현 디렉토리(plugins/Dropbox.js, inline/)를 현재형으로 서술, npm에 3중 복제 배포. '현재 구조/로드맵' 분리 재작성. 죽은 editor.js(1,010줄) 삭제. (S)
- [ ] **CHANGELOG 히스토리 소실 원인 확정**: 구 워크플로 스텝 순서 버그(Generate changelog가 npm version보다 먼저 실행되어 덮어씀)로 79개 릴리스 이력 소실. 태그 히스토리에서 1회 백필(M) + append 방식 수정, GH Release body와 파이프라인 통일. (M)
- [ ] **데모가 리포 상태를 반영 못함**: deploy-pages가 docs/를 빌드 없이 업로드, 페이지는 jsDelivr @latest 참조 → 데모 = 마지막 npm publish. deploy에 build + `cp -r dist docs/dist` 추가. index.html.backup(공개 배포 중!)·stepper-test.html 정리. (M)
- [ ] 죽은 코드 일괄: ui/utils/icon.js, molecules/language-toggle.js, 미포함 CSS 6개(blog-editor, saas-dashboard, table, components/button, components/form, tooltip), tests/의 debug-* 스크래치 스펙 8개, GIF 생성기 spec → scripts/ 이동. (S)
- [ ] SearchBar 허위 'FlexSearch' 표방: 실제는 indexOf 스코어링. 주석 정정(S) 또는 실제 도입(M).
- [ ] 소버그 군: Dropdown 스크롤 위치 오차, Modal 중첩 시 body overflow 오염, Toast 빈 컨테이너 누수, Stepper 이중 렌더. (각 S)
- [ ] CI Node 20 vs engines >=24 vs 로컬 rollup EBADF 재시도 25회 — 3자 불일치. engines를 소비자 기준으로 정정(라이브러리 소비에 Node 24 불필요), CI/로컬 버전 통일. (S)
- [ ] 테스트: 단위 러너·커버리지·시각 회귀 전무(Playwright 단독). vitest(에디터 변환·검색 로직) + warm/cold 스크린샷 회귀. (M)

## Medium — 완결성 검증 추가 발견 (감사 사각지대)

- [ ] **런타임 공급망 리스크**: icon-loader가 배포된 패키지 안에서 jsDelivr `@latest`를 런타임 fetch → innerHTML 주입 (ui/utils/icon-loader.ts:39-47). CDN 침해 시 모든 소비 사이트에 XSS 벡터 + @latest라 버전 고정도 안 됨. 아이콘을 번들 내장 또는 버전 고정 + 소비 측 sanitize. (M)
- [ ] **아이콘 라이선스 미준수**: ui/assets/icons/ 56개 중 최소 bold/italic/link.svg가 Feather Icons path와 사실상 동일한데 attribution 0건. LICENSE에 Feather MIT 고지 추가. (S)
- [ ] **브라우저 지원 계약 전무**: browserslist·autoprefixer·지원 매트릭스 모두 없음. 정책 선언 + autoprefixer 추가. (S)
- [ ] **breaking-change 정책 부재**: jsDelivr @latest CDN 소비자(README 배지가 트래픽 존재 증명)가 있는데 감사 권고 다수가 파괴적 제거 — deprecation 사이클(deprecated 별칭 → major에서 제거) 정의 필요. (S)
- [ ] **보안/커뮤니티 인프라 0**: SECURITY.md, dependabot.yml, ISSUE_TEMPLATE, CI npm audit 전부 부재. (S)

## 에디터 엔진 전환 검토 (2026-07-20)

> 질문: "Tiptap로 전환하면 원래 설계했던 지점이 무너지는가? Froala는?"
> 원래 설계 지점 4가지 = ① 멀티 라이브러리 호환(vanilla/React/Vue/jQuery/WC) ② warm/cold × light/dark 듀얼 테마 ③ npm 없이 CDN/copy-paste 소비 ④ 런타임 제로 의존성.

### 결론
- **Tiptap 전환은 ①②③을 무너뜨리지 않는다. 무너지는 것은 ④(제로 의존성/전량 자작) 하나뿐이며, 그마저 "에디터 번들 내부"로 격리 가능.** 오히려 위 Critical 에디터 결함 다수(stored XSS, IME 이원화, undo, markdown 왕복)가 성숙한 엔진 레벨에서 해소된다.
- **Froala는 부적합 — 검토 종결.** 상용·클로즈드 소스라 재배포가 불가능해 ①③④ 모두와 정면 충돌한다.

### Tiptap — 설계 지점별 영향
| 원래 설계 지점 | 영향 | 근거 |
|---|---|---|
| ① 멀티 라이브러리 | **유지** | Tiptap은 헤드리스 코어(ProseMirror 위) + 공식 vanilla/React/Vue 바인딩 제공. 현재 어댑터 구조에 그대로 매핑. WC/jQuery는 vanilla 코어를 얇게 감싸면 됨. |
| ② 듀얼 테마 | **오히려 강화** | 헤드리스라 chrome·마크업·CSS를 우리가 100% 소유 → 전부 `--theme-*` 토큰으로 그림. 지금처럼 JS가 `style.cssText`를 주입해 `editor-theme-fix.css`로 덮는 안티패턴이 사라짐. |
| ③ 무설치 CDN/copy-paste | **유지(빌드 변경)** | 현 rollup이 tiptap을 **vendored 단일 IIFE 번들**로 내장하면 소비자는 지금처럼 `<script src=".../monochrome-edge-editor.min.js">` 한 줄. npm 소비자는 tiptap이 의존성으로 함께 설치(투명). |
| ④ 제로 런타임 의존성 | **약화(격리 가능)** | 코어 UI(button/modal/toast 등)는 여전히 제로 의존성 유지. tiptap/prosemirror 의존성은 **에디터 서브패키지에만** 국한 → `@monochrome-edge/ui`는 깨끗, `@monochrome-edge/ui/editor`만 무거워짐. 이미 KaTeX/Prism/hljs를 런타임 전역으로 쓰고 있어 순수 제로도 아님. |

### 왜 자작 유지보다 나은가
- 현재 에디터는 **.ts 0개 / 순수 JS 9,678줄**로 라이브러리 최대 서브시스템인데, 위에서 stored XSS·영속성 파손·markdown 왕복 깨짐·IME 경합·이중 렌더러(BlockRenderer vs Enhanced)·이중 스토리지(StorageCore vs StorageManager)·이중 선택(Selection vs SelectionManager)까지 드러났다. 이들은 ProseMirror가 문서 모델·트랜잭션·선택·IME·undo를 스키마로 강제하며 원천 차단하는 문제군이다.
- Tiptap 코어는 **MIT**. 유료 Pro 확장(협업 등)만 피하면 됨 — 슬래시 메뉴는 `@tiptap/suggestion`(무료)로, 표/체크박스/코드블록/수식은 공식 무료 확장으로 커버.

### 마이그레이션 시 반드시 지킬 것(설계 지점 방어)
1. **의존성 격리**: tiptap은 `@monochrome-edge/ui/editor` 서브패키지 전용. 루트 exports는 제로 의존성 유지.
2. **CDN 번들은 self-contained**: rollup에서 tiptap을 external 아닌 내장으로 번들 → 소비자 `<script>` 한 줄 불변.
3. **chrome은 토큰으로만**: toolbar/slash/bubble 메뉴를 monochrome atoms(button/dropdown/tooltip) 재사용 + `--theme-*`로. 인라인 `style.cssText` 금지.
4. **왕복은 remark 경유**: markdown ↔ ProseMirror JSON 변환에 `tiptap-markdown` 또는 remark 파이프라인 채택, 골든 테스트로 무손실 고정 → 블로그 CMS Stage 3의 선행 과제 동시 해결.
5. **점진 전환**: 신규 `EditorV2`(tiptap)를 별도 export로 추가하고 기존 죽은 `editor.js`는 즉시 제거, 문서/데모를 V2로 이관 후 구 EditorCore를 deprecate.

### Froala — 부적합 사유
- **라이선스**: 상용 유료 + 클로즈드 소스. npm에 소스 동봉·무료 CDN·copy-paste(shardcn식) 소비 모델과 근본 충돌(③④ 붕괴, ① 재배포도 불가).
- **패러다임**: 블록/마크다운-우선이 아니라 클래식 HTML rich-text(`contenteditable` + toolbar). 현 블록 데이터 모델·markdown 왕복 목표와 어긋남.
- **테마**: 자체 스킨 시스템이라 warm/cold × light/dark 토큰 체계를 밖에서 강제하기 어려움(②도 약화). → 검토 종결.

## 권장 실행 순서

1. **v1.14.0 한 번에** (breaking 없음): stepper/editor exports 추가, peerDependencies, sideEffects 교정, VERSION 주입, colors.css 충돌 제거, SSR 크래시 픽스, release.yml 테스트 게이트+concurrency, Feather attribution
   - **핫픽스 우선**: 에디터 stored XSS(BlockRenderer)·StorageCore 자동저장 덮어쓰기·죽은 `editor.js` 삭제·Toast 포지셔닝 — 소비자 데이터/보안 직결이므로 exports 정리와 같은 릴리스에 포함.
2. **v1.15.0**: `./css/core` + per-component CSS exports (블로그 즉시 채택 → CSS 예산 회복)
3. **v2.0.0 계획**: 레거시 CSS 레이어 제거, WC 계약 통일, API 컨벤션 통일 — deprecation 공지 후
4. **에디터 엔진 결정 (별도 트랙)**: 위 "에디터 엔진 전환 검토" 결론대로 **Tiptap(MIT 코어) 전환 채택 권고, Froala 제외**. 단기(왕복 수리로 현 엔진 연명) vs 중기(EditorV2=tiptap 신설) 중 택1 — markdown 왕복이 블로그 CMS Stage 3 선행 과제이므로 tiptap 전환이 그 과제까지 함께 해소.
5. **병행**: release-please 전환, 문서 재작성(DEVELOPMENT.md/ARCHITECTURE.md), a11y 보강, IME 입력 경로 통합.
