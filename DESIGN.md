# Design System: Management Committee (The Digital Curator)

본 문서는 **경영집행위원회 (Executive Committee) 대시보드**의 통일된 시각적 규칙을 정의하는 디자인 시스템 가이드(DESIGN.md)입니다. 향후 추가되는 모든 관련 화면과 컴포넌트는 이 규칙을 엄격하게 준수해야 합니다.

## 1. 디자인 철학 (Design Philosophy)

*   **The Digital Curator (디지털 큐레이터)**: 복잡한 경영 데이터를 혼란스럽지 않게, 갤러리의 정제된 전시물처럼 깔끔하고 권위 있게 배치합니다.
*   **No-Line Rule (선 없는 레이아웃)**: 테이블이나 리스트를 나눌 때 1px의 딱딱한 테두리(`border`)를 최대한 지양합니다. 그 대신 명도(색상 대비)와 여백을 활용해 영역을 구분합니다.
*   **Depth & Layer (깊이와 층)**: 중요도가 높은 데이터나 포커스된 기능은 투명도(Glassmorphism)와 그림자를 통해 시각적으로 띄워 직관적인 하이라키를 구성합니다.

---

## 2. 컬러 팔레트 (Color Palette)

브랜드의 무게감과 신뢰감을 주기 위해 'Deep Emerald'를 핵심 컬러로 사용하며, 배경은 빛 반사가 적은 오프화이트(Off-White) 톤으로 구성합니다.

### 2.1 브랜드 & 프라이머리 (Brand & Primary)
*   `brand-primary` (`#2a676c`): 버튼, 주요 아이콘, 활성화된 상태의 메인 컬러 (Deep Emerald)
*   `brand-dim` (`#1b5b60`): 호버(Hover) 상태, 가장 집중이 필요한 라이브 밋팅 상태
*   `brand-container` (`#b1edf2`): 프라이머리 요소의 부드러운 배경색
*   `brand-on_container` (`#00474c`): 컨테이너 위에 올라가는 텍스트/아이콘 색상

### 2.2 서피스 & 백그라운드 (UI Surfaces)
*   `ui-lowest` (`#ffffff`): 가장 위에 떠 있는 카드나 모달 (Pure White)
*   `ui-surface` (`#f8f9fa`): 전체 페이지의 기본 배경색 (Off-white)
*   `ui-low` (`#f1f4f6`): 마우스 호버 시의 은은한 리스트 배경 교체 색상
*   `ui-outline_ghost` (`rgba(171, 179, 183, 0.15)`): 구분선이 꼭 필요할 때만 사용하는 아주 연한 유령 테두리

### 2.3 텍스트 (Typography Colors)
*   `ui-on_surface` (`#2b3437`): 순수 블랙(Black)을 대체하는 메인 텍스트 (#000000 픽셀 금지)
*   `ui-variant` (`#586064`): 보조 텍스트, 설명, 메타데이터 정보

### 2.4 상태 알림 (Status & Badges)
*   `status-tertiary` (`#1c6d25`): 완료 (Success/Completed)
*   `status-secondary` (`#4d626c`): 조건부 승인 / 대기 (Warning/Hold)
*   `status-error` (`#ba1a1a`): 재검토 / 딜레이 (Error/Delayed)

---

## 3. 타이포그래피 (Typography)

세련되고 현대적인 느낌을 주기 위해 2개의 폰트를 역할을 나누어 조합합니다.

*   **Display Font (헤딩 및 강조 숫자)**: `Manrope` (font-weight: 600, 700, 800)
    *   두툼하고 기하학적인 형태로 타이틀 및 대시보드의 주요 KPI 숫자에 사용됩니다.
    *   타이틀에는 자간 조정(`letter-spacing: -0.02em;`)을 넣어 밀도를 높입니다.
*   **Body Font (본문 및 데이터 나열)**: `Inter` (font-weight: 400, 500, 600)
    *   높은 가독성이 필요한 테이블 데이터, 안건 설명, 날짜 등에 폭넓게 사용됩니다.

---

## 4. 컴포넌트 특화 규칙 (Component Rules)

### 4.1 카드와 보드 (Cards & Boards)
*   **모서리 곡선율 (Border Radius)**: 메인 카드는 `0.75rem (xl)`을 적용하여 너무 딱딱하지 않은 부드러운 인상을 줍니다.
*   **그림자 (Shadows)**: 구조적 그림자보다 분위기를 위한 그림자를 씁니다. 모달은 `box-shadow: 0 20px 40px rgba(43, 52, 55, 0.06);` 을 적용합니다.

### 4.2 버튼 및 액션 (Buttons)
*   **Primary Button**: 단색이 아닌 그라데이션(`linear-gradient(135deg, #2a676c, #1b5b60)`)을 넣어 버튼을 누르고 싶게 만드는 입체감을 제공합니다.
*   **상태 뱃지 (Badges)**: 무조건 모서리가 완전히 둥근 `rounded-full` 형태를 띄며, 상태에 맞는 옅은 컨테이너 배경과 중간 톤 이상의 텍스트 색상으로 대비를 명확히 합니다.

### 4.3 리스트와 테이블 (Lists & Tables)
앞서 설명한 *No-Line Rule*을 가장 엄격히 지켜야 하는 구간입니다. 항목 간의 구분선을 넣는 대신, 넉넉한 상하 패딩(`py-4`)과 마우스가 올라갈 경우 발생하는 배경색 스무스 치환(`transition: all 0.2s ease-out; hover:background-color: #f1f4f6`)을 이용해 항목의 포커싱을 조절합니다.
