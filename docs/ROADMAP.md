# 선상낚시 후기 게시판 개발 로드맵

http://localhost:3000/
https://fishing-review-web.vercel.app/
http://localhost:54703?lang=en

노션 기반 견적서 관리 시스템(`invoice-web`)을 기반으로 재구성한 선상낚시 후기 게시판 프로젝트입니다.

## 개요

이 프로젝트는 처음엔 노션을 헤드리스 CMS로 쓰는 읽기 전용 MVP(1단계)로 시작했습니다. 이후 회원가입(소셜 로그인) 기반 웹 후기 작성 기능이 요구사항에 추가되면서, 데이터 저장소를 **Supabase(PostgreSQL + Auth)로 전환하는 2단계**에 조기 진입했습니다 (`CLAUDE.md`의 아키텍처 전환 절 참조).

개발 순서는 시간순이 아니라 **의존성 순서(선행 작업 → 후행 작업)** 로 정리했습니다. 각 단계는 이전 단계가 끝나야 안정적으로 진행할 수 있습니다.

## 1. 프로젝트 골격 (구조, 환경 설정)

> **왜 이 순서인가?** 폴더 구조와 환경 변수가 없으면 이후 어떤 코드도 실행할 수 없는 전제조건이기 때문에 가장 먼저 처리합니다.

- [x] 프로젝트 폴더 분리 (`invoice-web` → `fishing-review-web`)
- [x] 환경 변수 정리 (`ADMIN_PASSWORD`/`SESSION_SECRET` 제거)
- [x] 불필요한 기존 코드 제거 (admin 대시보드, 로그인/JWT 인증, PDF 생성)
- [x] 문서/브랜딩 전면 교체
- [x] (1단계, 레거시) Notion에 실제 후기 데이터베이스 생성 및 연동 확인
- [ ] Supabase 프로젝트 생성 및 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) `.env.local`에 입력

## 2. 공통 모듈 (모든 기능에서 쓰는 것들)

> **왜 이 순서인가?** 타입/서비스 레이어처럼 여러 기능이 공유하는 기반을 먼저 만들어야, 핵심 기능을 구현할 때 중복 코드 없이 일관되게 짤 수 있습니다. 나중에 만들면 이미 작성한 기능 코드를 전부 뜯어고쳐야 합니다.

- [x] (1단계, 레거시) 데이터 타입 3단계 패턴 교체 (`types/notion.ts`, `types/review.ts`, `notion-parser.ts`)
- [x] (1단계, 레거시) 이미지 처리 로직 신규 구현 (`extractImageUrls`, `next.config.ts` remotePatterns)
- [x] (1단계, 레거시) 서비스 레이어 교체 (`review.service.ts` — 공개 여부 필터 강제 적용)
- [ ] Supabase 클라이언트 설정 (`@supabase/supabase-js`, 서버/클라이언트용 인스턴스 분리)
- [ ] `review.service.ts` 내부 구현을 Notion 호출 → Supabase 쿼리로 교체 (외부 함수 시그니처는 최대한 유지)
- [ ] Supabase Auth 설정 (소셜 로그인 provider 등록: 카카오/구글 등)

## 3. 핵심 기능 (가장 중요한 기능)

> **왜 이 순서인가?** 공통 모듈이 준비된 상태에서 제품의 존재 이유(가장 중요한 가치)부터 구현합니다. 이게 동작해야 비로소 "제품"이라 부를 수 있습니다 (MVP 우선순위).

- [x] 갤러리 홈페이지 구현 (`/`)
- [x] 후기 상세 페이지 및 사진 갤러리(라이트박스) 구현 (`/review/[id]`)
- [ ] 소셜 로그인 UI/플로우 구현
- [ ] 후기 작성 폼 구현 (제목/내용/사진 업로드, 제출 시 `status: 'pending'`으로 저장)
- [ ] 관리자 승인 대기열 (MVP는 Supabase 테이블 편집기로 대체, 전용 대시보드는 향후 개선 항목)

## 4. 추가 기능 (부가적인 기능)

> **왜 이 순서인가?** 핵심 기능이 안정된 뒤에 부가가치를 더하는 단계입니다. 핵심 기능 없이 부가 기능부터 만들면 우선순위 낭비이고, 핵심 기능이 나중에 바뀌면 재작업 위험이 커집니다.

- [x] 검색/페이지네이션 (`search-bar`, `pagination`)
- [x] 다크모드 (`theme-provider`, `theme-toggle`)
- [ ] 방문자 댓글/좋아요 기능
- [ ] 태그별 통계(가장 많이 잡힌 어종 등)
- [ ] 지도 기반 포인트 표시
- [ ] 후기 공유 버튼(카카오톡/링크 복사)
- [ ] 전용 관리자 승인 대시보드 (Supabase 테이블 편집기 대체용)

## 5. 최적화 및 배포

> **왜 이 순서인가?** 기능이 다 갖춰진 뒤에 성능/안정성/배포를 다듬는 단계입니다. 너무 일찍 최적화하면(premature optimization) 기능이 바뀔 때마다 최적화 작업을 반복해야 합니다.

- [x] 로컬에서 `npm run dev`로 실제 데이터(1단계, 노션) 연동 확인
- [x] `npm run check-all`, `npm run build` 통과 확인
- [x] Vercel 배포 (GitHub 연동, 자동 재배포)
- [ ] (선택) `tests/e2e/review.spec.ts` 작성 — 기존 `invoice.spec.ts`는 삭제됨
- [ ] 기존 노션 후기 데이터를 Supabase로 마이그레이션 (1단계 → 2단계 데이터 이관)
- [ ] Supabase 전환 완료 후 `@notionhq/client` 및 관련 레거시 코드 제거
