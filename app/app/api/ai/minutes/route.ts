import { NextRequest } from 'next/server';

interface MinutesRequest {
  meetingRound: number;
  date: string;
  location: string;
  attendees: string[];
  duration: string;
  agendas: {
    index: number;
    title: string;
    voteResult: string;
    voteComment?: string;
    transcript?: string;
  }[];
  voteStats: {
    approved: number;
    conditional: number;
    review: number;
  };
  transcripts?: Record<string, string>;
}

/**
 * POST /api/ai/minutes
 *
 * 회의 데이터 + 음성 기록을 받아 정형화된 회의록을 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: MinutesRequest = await request.json();
    const { meetingRound, date, location, attendees, duration, agendas, voteStats, transcripts } = body;

    if (!agendas || agendas.length === 0) {
      return Response.json(
        { error: '안건 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const dateStr = new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    // 회의록 마크다운 생성
    let minutes = `# 제${meetingRound}회 경영집행위원회 회의록\n\n`;
    minutes += `## 회의 개요\n\n`;
    minutes += `| 항목 | 내용 |\n`;
    minutes += `| --- | --- |\n`;
    minutes += `| 일시 | ${dateStr} |\n`;
    minutes += `| 장소 | ${location} |\n`;
    minutes += `| 참석자 | ${attendees.join(', ')} |\n`;
    minutes += `| 소요시간 | ${duration} |\n`;
    minutes += `| 안건 수 | ${agendas.length}건 |\n\n`;

    // 표결 결과 요약
    minutes += `## 표결 결과 요약\n\n`;
    minutes += `- 승인: ${voteStats.approved}건\n`;
    minutes += `- 조건부 승인: ${voteStats.conditional}건\n`;
    minutes += `- 재검토: ${voteStats.review}건\n\n`;

    // 안건별 상세
    minutes += `## 안건별 상세\n\n`;

    for (const agenda of agendas) {
      const voteLabel =
        agenda.voteResult === 'approved' ? '승인' :
        agenda.voteResult === 'conditional' ? '조건부 승인' : '재검토';

      minutes += `### 안건 ${agenda.index}: ${agenda.title}\n\n`;
      minutes += `**표결 결과:** ${voteLabel}\n\n`;

      if (agenda.voteComment) {
        minutes += `**부가 의견:** ${agenda.voteComment}\n\n`;
      }

      // 음성 기록 포함
      const transcript = transcripts?.[String(agenda.index)] || agenda.transcript || '';
      if (transcript.trim()) {
        minutes += `**논의 내용 (음성 기록):**\n\n`;
        minutes += `> ${transcript}\n\n`;

        // 핵심 내용 추출
        const keyPoints = extractKeyPointsFromTranscript(transcript);
        if (keyPoints.length > 0) {
          minutes += `**핵심 논의사항:**\n\n`;
          keyPoints.forEach((point) => {
            minutes += `- ${point}\n`;
          });
          minutes += '\n';
        }
      }

      minutes += `---\n\n`;
    }

    // 종합 의견
    minutes += `## 종합 의견\n\n`;
    minutes += generateOverallOpinion(agendas, voteStats, transcripts);
    minutes += '\n\n';

    // 향후 조치사항
    const actionItems = generateActionItems(agendas);
    if (actionItems.length > 0) {
      minutes += `## 향후 조치사항\n\n`;
      actionItems.forEach((item, i) => {
        minutes += `${i + 1}. ${item}\n`;
      });
      minutes += '\n';
    }

    minutes += `---\n\n`;
    minutes += `*본 회의록은 음성 기록 기반으로 자동 생성되었습니다.*\n`;
    minutes += `*생성 일시: ${new Date().toLocaleString('ko-KR')}*\n`;

    return Response.json({
      success: true,
      minutes,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Minutes API error:', error);
    return Response.json(
      { error: '회의록 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function extractKeyPointsFromTranscript(transcript: string): string[] {
  if (!transcript) return [];

  const sentences = transcript
    .split(/[.!?。]\s*/g)
    .filter((s) => s.trim().length > 10);

  const importantKeywords = [
    '결정', '승인', '반대', '동의', '제안', '필요', '중요',
    '예산', '일정', '목표', '계획', '검토', '확인', '진행',
    '문제', '해결', '조건', '추가', '변경', '보완', '합의',
  ];

  const keyPoints: string[] = [];
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (importantKeywords.some((kw) => trimmed.includes(kw)) && keyPoints.length < 5) {
      keyPoints.push(trimmed);
    }
  }

  if (keyPoints.length === 0 && sentences.length > 0) {
    return sentences.slice(0, 3).map((s) => s.trim());
  }

  return keyPoints;
}

function generateOverallOpinion(
  agendas: MinutesRequest['agendas'],
  voteStats: MinutesRequest['voteStats'],
  transcripts?: Record<string, string>
): string {
  const total = agendas.length;
  const approvalRate = ((voteStats.approved / total) * 100).toFixed(0);

  let opinion = `총 ${total}개 안건 중 ${voteStats.approved}건이 승인되어 승인률 ${approvalRate}%를 기록하였습니다. `;

  if (voteStats.conditional > 0) {
    opinion += `${voteStats.conditional}건의 조건부 승인 안건에 대해서는 조건 충족 후 최종 결정이 필요합니다. `;
  }

  if (voteStats.review > 0) {
    opinion += `${voteStats.review}건의 재검토 안건에 대해서는 차기 회의에서 재논의할 예정입니다. `;
  }

  const hasTranscripts = transcripts && Object.values(transcripts).some((t) => t.trim().length > 0);
  if (hasTranscripts) {
    opinion += `회의 중 음성 기록이 자동으로 수집되어 각 안건별 논의 내용이 상세히 기록되었습니다.`;
  }

  return opinion;
}

function generateActionItems(agendas: MinutesRequest['agendas']): string[] {
  const items: string[] = [];

  agendas.forEach((agenda) => {
    if (agenda.voteResult === 'approved') {
      items.push(`"${agenda.title}" 승인 내용 이행 추진`);
    } else if (agenda.voteResult === 'conditional') {
      items.push(`"${agenda.title}" 조건 사항 검토 및 보완 후 재보고`);
    } else if (agenda.voteResult === 'review') {
      items.push(`"${agenda.title}" 보완 자료 준비 및 차기 회의 재상정`);
    }
  });

  return items;
}
