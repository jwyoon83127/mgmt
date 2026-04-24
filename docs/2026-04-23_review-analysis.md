# 2026-04-23 리뷰 분석 — 데이터 처리 · 사용성 점검

대상 브랜치: `feat/meeting-flow-redesign`
범위: 오늘 커밋(`6784fe5`) + 미커밋 변경분 + 본 일자 추가 구현(계정·SMTP)

---

## Part 1. 데이터 처리 · DB 테이블 필요성 분석

### 1.1 엔티티별 현재 저장 위치

| 엔티티 | 현재 위치 | 문제 | DB 필요 |
|---|---|---|---|
| **User (계정)** | localStorage | 🔴 브라우저별 격리 — A 관리자가 추가한 계정이 B 관리자 브라우저에 안 보임 | **필수** |
| **currentUser (세션)** | localStorage | 토큰 개념 없음, 서버 검증 불가, XSS 취약 | 세션 테이블 필요 |
| **비밀번호** | localStorage (평문) | 🔴 보안 치명적 | **필수 (해시 저장)** |
| **SMTP 설정** | `.runtime/smtp.json` (평문) | 🟡 멀티 인스턴스 불가, Vercel 등 서버리스 환경에서 휘발 | **필수** |
| **메일 발송 이력** | 없음 | 🔴 실패 원인 추적 불가, 재발송 불가 | **필수** |
| **MeetingRound / Agenda / CeoReport** | MariaDB | 🟢 정상 | 이미 있음 |
| **CompletedMeetings** | 일부 localStorage | 🟡 DB와 중복 저장 가능성 | 점진 제거 |
| **UI · Live 상태** | Zustand 메모리 | 🟢 정상 (휘발성이 맞음) | 불필요 |

### 1.2 핵심 문제 요약

- **🔴 인증/사용자 관리**: 모든 사용자가 localStorage에만 저장되어 멀티 관리자·멀티 디바이스 운영 불가. 비밀번호 평문 저장.
- **🔴 SMTP 설정**: 파일 기반(`.runtime/smtp.json`) — Vercel 등 서버리스 배포에서 파일 시스템이 휘발. 비밀번호 평문 저장.
- **🔴 감사 로그 부재**: 비밀번호 재설정·메일 발송·로그인 이력 전무 → 컴플라이언스 불충족.
- **🟡 databaseService 미사용 영역**: `mariadb_setup.sql`의 `profiles` 테이블이 authStore와 연결되어 있지 않음.

### 1.3 권장 DB 스키마

**P1 — 즉시 필요**
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,   -- bcrypt
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL               -- soft delete
);

CREATE TABLE smtp_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host VARCHAR(255) NOT NULL,
  port INT DEFAULT 587,
  secure BOOLEAN DEFAULT FALSE,
  user VARCHAR(255) NOT NULL,
  password_encrypted VARCHAR(500) NOT NULL,  -- AES 또는 KMS
  from_address VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  tested_at TIMESTAMP NULL,
  updated_by VARCHAR(50),
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(host, user)
);

CREATE TABLE mail_send_logs (
  id VARCHAR(50) PRIMARY KEY,
  to_address VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  mail_type ENUM('credential','password_reset','test') DEFAULT 'credential',
  status ENUM('sent','failed','bounced') DEFAULT 'sent',
  message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX(to_address, sent_at)
);
```

**P2 — 컴플라이언스·감사**
```sql
CREATE TABLE password_reset_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  reset_by VARCHAR(50),                   -- admin ID
  reset_method ENUM('admin','self') DEFAULT 'admin',
  reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  actor_id VARCHAR(50) NOT NULL,
  action ENUM('login','logout','role_change','password_reset','user_created','user_deleted','smtp_updated') NOT NULL,
  target_id VARCHAR(50),
  details JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id),
  INDEX(actor_id, occurred_at)
);

CREATE TABLE user_sessions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 1.4 마이그레이션 단계

| Phase | 내용 | 기간 추정 |
|---|---|---|
| **1. users + bcrypt** | 테이블 생성, databaseService에 CRUD, 기존 localStorage 5명 seed 이관, authStore → Server Action 교체 | 2–3일 |
| **2. smtp_settings** | `.runtime/smtp.json` → 테이블 이관, smtpConfig.ts 수정, 관리 화면 유지 | 1일 |
| **3. 세션 쿠키** | httpOnly 쿠키 + user_sessions, localStorage 세션 제거 (XSS 대응) | 2일 |
| **4. 감사 로그** | resetPassword · sendCredentials · login 진입점에 훅, 관리자 조회 화면 | 1–2일 |

---

## Part 2. 사용성 테스트 — 문제점 리뷰

### 2.1 심각도 요약

| 심각도 | 개수 | 주요 영역 |
|---|---|---|
| 🔴 Critical | 6 | SSR 가드, 폼 검증, SMTP 기본값, 인덱스 안전성, 라우트 가드, 자격증명 하드코딩 |
| 🟡 Warning | 8 | 중복 submit, 빈 상태, roundId 전달, 폴백, focus trap, ErrorBoundary, race condition, SMTP 테스트 강제 |
| 🔵 Minor | 3 | mock 잔존, 초기화 순서, i18n |

### 2.2 🔴 Critical

| # | 파일:라인 | 이슈 | 조치 |
|---|---|---|---|
| C1 | `app/lib/store/authStore.ts` 다수 | localStorage SSR 가드 누락 | 모든 localStorage 접근 전 `typeof window !== 'undefined'` 체크 |
| C2 | `app/app/admin/users/page.tsx:52–55` | 이메일 형식·이름 길이 검증 없음 | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` + 2–50자 길이 제약 |
| C3 | `app/app/admin/users/page.tsx:19` | SMTP 미설정인데 "메일 발송" 기본 true | SmtpSettings 상태 확인 후 기본값 false 또는 disable |
| C4 | `app/components/modals/preview/PreviewDrawer.tsx:74–75` | 안건 변동 시 `activeIndex` 범위 초과 | `activeIndex >= agendas.length` 시 0으로 보정 |
| C5 | `app/app/admin/users/page.tsx:31–44` | 라우트 가드가 페이지 내부 `isAdmin()` 만 — FOUC | AuthProvider 또는 middleware에서 리다이렉트 |
| C6 | `app/lib/store/authStore.ts:44–47` | 실제 도메인 계정 + 기본 PW 소스 하드코딩 | 환경 변수로 이동 또는 DB seed 스크립트로 분리 |

### 2.3 🟡 Warning

| # | 파일 | 이슈 | 조치 |
|---|---|---|---|
| W1 | `admin/users/page.tsx` | 폼 제출 중 중복 submit 가드 없음 | `submitting` state + 버튼 disabled |
| W2 | `modals/report/ReportModal.tsx` | 완료 회의 0건일 때 빈 상태 UI 없음 | early return으로 빈 상태 메시지 |
| W3 | `dashboard/CurrentMeetingCard.tsx:63` | `openReportModal`이 roundId 미전달 — 항상 첫 회의만 표시 | `openReportModal(round.id)` + uiStore 시그니처 변경 |
| W4 | `archive/AgendaTable.tsx:22–36` | Web Share API 폴백 silent fail | 클립보드도 없으면 토스트 안내 |
| W5 | 각 모달 | focus trap 미구현 | `react-aria` 또는 수동 focus trap |
| W6 | 루트 layout | ErrorBoundary / `error.tsx` 없음 | App Router 컨벤션에 따라 `error.tsx` 추가 |
| W7 | `meetings/new/page.tsx:62–65, 98–101` | 회차 중복 검증 클라·서버 양쪽 race condition | DB unique constraint로 위임, 서버에서만 검증 |
| W8 | `components/admin/SmtpSettings.tsx` | 저장 시 연결 테스트 강제 안 함 | 저장 전 verify 자동 실행 또는 테스트 미통과 시 경고 |

### 2.4 🔵 Minor

- **M1**: `PreviewDrawer.tsx:16–24` — 하드코딩된 댓글 mock 잔존 (`initialCommentsMap`)
- **M2**: `AuthProvider` 초기화 순서 — `initializeUsers` → `restoreAuthState` 경합 가능
- **M3**: 한국어 문자열 하드코딩 산재 — 향후 i18n 도입 시 비용 가중

---

## Part 3. 우선순위 실행 계획

### 이번 주 (Critical 선행)
1. **C6** 자격증명 하드코딩 제거 — 현재 코드부터 정리 (git history 세탁은 추후 검토)
2. **C2** 폼 validation + **C3** SMTP 기본값 로직
3. **C1** SSR 가드 + **C4** activeIndex 안전장치

### 다음 스프린트 (DB 이관 시작)
4. **Phase 1 — users 테이블 + bcrypt** (현재 멀티 관리자 운영 자체가 불가)
5. **Phase 2 — smtp_settings 테이블 이관**
6. **C5** 라우트 가드 middleware, **W6** ErrorBoundary

### 백로그
- Phase 3 세션 쿠키 전환
- Phase 4 감사 로그
- W1~W8 UX 개선
- i18n, 접근성(focus trap)

---

## 결론

- **회의 도메인** (MeetingRound · Agenda · CeoReport) 데이터는 이미 MariaDB에 적절히 올라가 있음.
- **인증 · 메일** 영역은 localStorage + 서버 파일에 머물러 **멀티 관리자 운영이 실질적으로 불가능**. P1 테이블 3개(users, smtp_settings, mail_send_logs) 신설이 최우선 과제.
- 사용성 측면에서는 Critical 6건이 데이터 무결성·보안과 직결 — Phase 1 DB 이관과 병행해 해결 권장.
