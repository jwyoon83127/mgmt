import { LiveAgenda } from '@/lib/types/meeting';

export const mockLiveAgendas: LiveAgenda[] = [
  {
    id: 'agenda-1',
    index: 1,
    title: '2026년 상반기 투자 계획 검토',
    subtitle: '사업기획팀 · 전략투자본부',
    attachmentName: '2026_상반기_투자계획_v3.pdf',
    content: `
      <div class="space-y-4">
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">안건 배경</p>
          <p class="text-sm text-ui-variant leading-relaxed">2026년 상반기 주요 투자 포트폴리오 재검토 및 신규 투자 집행 방향을 논의합니다. 글로벌 금리 인하 사이클 진입에 따른 투자 전략 재조정이 필요한 시점입니다.</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">주요 검토 사항</p>
          <ul class="text-sm text-ui-variant space-y-1 list-disc list-inside">
            <li>기존 포트폴리오 수익률 분석 (YTD 기준)</li>
            <li>신규 투자 후보군 3개 사업 검토</li>
            <li>리스크 헷지 전략 승인 요청</li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">요청 결정사항</p>
          <p class="text-sm text-ui-variant leading-relaxed">상반기 추가 투자 한도 500억 원 승인 및 집행 우선순위 확정.</p>
        </div>
      </div>
    `,
  },
  {
    id: 'agenda-2',
    index: 2,
    title: '조직 개편안 최종 심의',
    subtitle: '인사조직팀 · HR본부',
    attachmentName: '2026_조직개편안_최종.pdf',
    content: `
      <div class="space-y-4">
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">안건 배경</p>
          <p class="text-sm text-ui-variant leading-relaxed">디지털 전환 가속화에 대응하기 위한 조직 구조 개편안을 최종 심의합니다. 3개 본부 통합 및 신규 AI추진단 신설이 핵심 내용입니다.</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">개편 핵심 사항</p>
          <ul class="text-sm text-ui-variant space-y-1 list-disc list-inside">
            <li>디지털혁신본부 + IT본부 → 통합 DT본부 (인원 234명)</li>
            <li>AI추진단 신설 (단장 별도 선임)</li>
            <li>마케팅/브랜드 조직 분리 독립</li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">시행 일정</p>
          <p class="text-sm text-ui-variant leading-relaxed">승인 시 2026년 5월 1일 자로 전면 시행.</p>
        </div>
      </div>
    `,
  },
  {
    id: 'agenda-3',
    index: 3,
    title: '신규 파트너십 계약 체결 승인',
    subtitle: '전략제휴팀 · 사업개발본부',
    attachmentName: '파트너십_계약서_초안.pdf',
    content: `
      <div class="space-y-4">
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">안건 배경</p>
          <p class="text-sm text-ui-variant leading-relaxed">글로벌 SaaS 플랫폼 기업 A社와의 전략적 파트너십 계약 체결에 대한 경영진 승인을 요청합니다.</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">계약 주요 내용</p>
          <ul class="text-sm text-ui-variant space-y-1 list-disc list-inside">
            <li>독점 공급 파트너 계약 (국내 3년)</li>
            <li>수익 배분율: 당사 60% / A社 40%</li>
            <li>최소 보장 매출: 연 120억 원</li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold text-ui-on-surface mb-1">요청 결정사항</p>
          <p class="text-sm text-ui-variant leading-relaxed">계약서 최종안 승인 및 대표이사 서명 권한 위임.</p>
        </div>
      </div>
    `,
  },
];
