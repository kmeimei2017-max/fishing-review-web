# 🤖 Claude Code 개발 지침

**노션 기반 선상낚시 후기 게시판** - 노션을 데이터베이스로 활용하여 낚시 후기를 관리하고, 누구나 웹에서 후기 갤러리를 조회할 수 있는 공개 게시판. 글쓰기는 관리자가 노션에서 직접 하며, 웹사이트에는 로그인/쓰기 기능이 없음.

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조

## 🚀 스케일업 로드맵 (중요)

**최종 목표: 수십~수백만 명 규모의 후기 게시판**. 현재 노션 연동은 MVP/학습 단계이며, 영구적인 구조가 아님.

- **1단계 (현재)**: 노션을 헤드리스 CMS로 사용 — 기능 검증, UX 학습, 소규모(동호회~수천 명) 운영에 적합
- **2단계 (스케일업)**: 회원 규모가 커지면 **Supabase(PostgreSQL) 등 자체 DB로 전환** — 노션 API의 rate limit(초당 약 3요청), 제한적인 쿼리 능력, 단일 장애점 문제를 해결하기 위함
- **전환을 대비한 설계 원칙**: 노션 관련 로직은 반드시 `src/lib/services/review.service.ts` 같은 서비스 레이어 안에만 캡슐화할 것. 페이지/컴포넌트가 `@notionhq/client`를 직접 호출하지 않도록 하여, 나중에 서비스 레이어 내부 구현만 Supabase 쿼리로 교체해도 UI/페이지 코드는 거의 그대로 유지되도록 함

## 🛠️ 핵심 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **External API**: @notionhq/client (Notion API SDK)
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
