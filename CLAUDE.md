# 🤖 Claude Code 개발 지침

**선상낚시 후기 게시판** - Supabase를 데이터베이스로 활용하여 회원이 직접 낚시 후기를 작성/관리하고, 누구나 웹에서 후기 갤러리를 조회할 수 있는 공개 게시판. 후기 작성은 소셜 로그인한 회원 누구나 가능하며, 관리자 승인 후 공개됨.

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조

## 🚀 아키텍처 전환 (중요)

**최종 목표: 수십~수백만 명 규모의 후기 게시판**. 원래 노션 헤드리스 CMS로 시작한 MVP였으나, 회원 작성 기능이 추가되며 Supabase 전환(2단계)으로 조기 진입함.

- **1단계 (완료)**: 노션을 헤드리스 CMS로 사용 — 관리자만 노션에서 작성, 방문자는 읽기 전용. 소규모(동호회~수천 명) 운영에는 적합했지만 회원 쓰기 트래픽은 감당 불가
- **2단계 (진행 중)**: **Supabase(PostgreSQL + Auth)로 전환** — 노션 API의 rate limit(초당 약 3요청)과 인증 부재 문제를 해결하기 위함. 회원 소셜 로그인, 후기 작성/제출, 관리자 승인(`status`: `pending`/`published`)이 이 단계의 핵심 기능
- **설계 원칙 (유지)**: 데이터 접근 로직은 반드시 `src/lib/services/review.service.ts` 같은 서비스 레이어 안에만 캡슐화할 것. 페이지/컴포넌트가 `@notionhq/client`나 `@supabase/supabase-js`를 직접 호출하지 않도록 하여, 저장소 구현이 바뀌어도 UI/페이지 코드는 최대한 그대로 유지되도록 함

## 🛠️ 핵심 기술 스택

- **Framework**: Next.js 15.5.20 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **Backend & Auth**: Supabase (PostgreSQL + Auth + Storage) — 2단계 전환 대상
- **External API (레거시)**: @notionhq/client (Notion API SDK) — 1단계 노션 연동, 마이그레이션 완료 후 제거 예정
- **Development**: ESLint + Prettier + Husky + lint-staged

## 📚 개발 가이드

- **📋 프로젝트 요구사항 (PRD)**: `@/docs/PRD.md` - 후기 게시판 상세 명세
- **📁 프로젝트 구조**: `@/docs/guides/project-structure.md`
- **🎨 스타일링 가이드**: `@/docs/guides/styling-guide.md`
- **🧩 컴포넌트 패턴**: `@/docs/guides/component-patterns.md`
- **⚡ Next.js 15.5.3 전문 가이드**: `@/docs/guides/nextjs-15.md`
- **📝 폼 처리 완전 가이드**: `@/docs/guides/forms-react-hook-form.md`

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
