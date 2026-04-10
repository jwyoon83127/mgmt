import { NextRequest } from 'next/server';

interface SummarizeRequest {
  transcripts: Record<string, string>; // agendaIndex -> transcript text
  agendas: {
    index: number;
    title: string;
    voteResult: string;
    voteComment?: string;
  }[];
  meetingRound: number;
}

/**
 * POST /api/ai/summarize
 *
 * 음성 기록(transcript)을 받아 회의 요약을 생성합니다.
 * 현재는 로컬 텍스트 분석 기반으로 동작하며,
 * 향후 Claude API 연동 시 AI 기반 요약으로 교체 가능합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: SummarizeRequest = await request.json();
    const { transcripts, agendas, meetingRound } = body;

    if (!transcripts || !agendas) {
      return Response.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 안건별 요약 생성
    const agendaSummaries = agendas.map((agenda) => {
      const transcript = transcripts[String(agenda.index)] || '';
      const summary = generateAgendaSummary(agenda, transcript);
      return {
        agendaIndex: agenda.index,
        title: agenda.title,
        voteResult: agenda.voteResult,
        transcript,
        summary,
        keyPoints: extractKeyPoints(transcript),
      };
    });

    // 전체 회의 요약 생성
    const overallSummary = generateOverallSummary(agendaSummaries, meetingRound);

    return Response.json({
      success: true,
      meetingRound,
      overallSummary,
      agendaSummaries,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Summarize API error:', error);
    return Response.json(
      { error: '요약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateAgendaSummary(
  agenda: { index: number; title: string; voteResult: string; voteComment?: string },
  transcript: string
): string {
  const voteLabel =
    agenda.voteResult === 'approved'
      ? '승인'
      : agenda.voteResult === 'conditional'
      ? '조건부 승인'
      : '재검토';

  if (!transcript || transcript.trim().length === 0) {
    return `안건 ${agenda.index} "${agenda.title}"에 대해 논의가 진행되었으며, ${voteLabel}으로 결정되었습니다.${agenda.voteComment ? ` 의견: ${agenda.voteComment}` : ''}`;
  }

  // 문장 분리
  const sentences = transcript
    .split(/[.!?。]\s*/g)
    .filter((s) => s.trim().length > 5);

  const wordCount = transcript.split(/\s+/).length;

  // 요약 구성
  let summary = `안건 ${agenda.index} "${agenda.title}"에 대해 `;

  if (wordCount > 50) {
    summary += `총 ${wordCount}개 단어에 걸쳐 심층 논의가 이루어졌습니다. `;
  } else if (wordCount > 20) {
    summary += `논의가 진행되었습니다. `;
  } else {
    summary += `간략한 논의 후 `;
  }

  // 주요 발언 포함
  if (sentences.length > 0) {
    const keySentence = sentences.reduce((longest, s) =>
      s.length > longest.length ? s : longest
    , '');
    summary += `주요 발언: "${keySentence.trim().substring(0, 100)}${keySentence.length > 100 ? '...' : ''}". `;
  }

  summary += `최종 결정: ${voteLabel}.`;

  if (agenda.voteComment) {
    summary += ` 부가 의견: ${agenda.voteComment}`;
  }

  return summary;
}

function extractKeyPoints(transcript: string): string[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  const keyPoints: string[] = [];
  const sentences = transcript
    .split(/[.!?。,，]\s*/g)
    .filter((s) => s.trim().length > 8);

  // 중요 키워드를 포함한 문장 추출
  const importantKeywords = [
    '결정', '승인', '반대', '동의', '제안', '필요', '중요',
    '예산', '일정', '목표', '계획', '검토', '확인', '진행',
    '문제', '해결', '조건', '추가', '변경', '보완',
  ];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    const hasKeyword = importantKeywords.some((kw) => trimmed.includes(kw));

    if (hasKeyword && keyPoints.length < 5) {
      keyPoints.push(trimmed.substring(0, 80) + (trimmed.length > 80 ? '...' : ''));
    }
  }

  // 키워드 매칭이 없으면 가장 긴 문장 3개
  if (keyPoints.length === 0) {
    const sorted = [...sentences].sort((a, b) => b.length - a.length);
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      const s = sorted[i].trim();
      keyPoints.push(s.substring(0, 80) + (s.length > 80 ? '...' : ''));
    }
  }

  return keyPoints;
}

function generateOverallSummary(
  agendaSummaries: {
    agendaIndex: number;
    title: string;
    voteResult: string;
    transcript: string;
    summary: string;
    keyPoints: string[];
  }[],
  meetingRound: number
): string {
  const totalAgendas = agendaSummaries.length;
  const approved = agendaSummaries.filter((a) => a.voteResult === 'approved').length;
  const conditional = agendaSummaries.filter((a) => a.voteResult === 'conditional').length;
  const review = agendaSummaries.filter((a) => a.voteResult === 'review').length;

  const hasTranscripts = agendaSummaries.some((a) => a.transcript.trim().length > 0);
  const totalWords = agendaSummaries.reduce(
    (sum, a) => sum + a.transcript.split(/\s+/).filter(Boolean).length,
    0
  );

  let summary = `제${meetingRound}회 경영집행위원회에서 총 ${totalAgendas}개 안건이 논의되었습니다. `;

  if (hasTranscripts) {
    summary += `음성 기록 총 ${totalWords}개 단어가 기록되었으며, `;
  }

  summary += `${approved}건 승인`;
  if (conditional > 0) summary += `, ${conditional}건 조건부 승인`;
  if (review > 0) summary += `, ${review}건 재검토`;
  summary += `로 결정되었습니다.\n\n`;

  // 안건별 한줄 요약
  agendaSummaries.forEach((a) => {
    const voteLabel =
      a.voteResult === 'approved' ? '✅ 승인' :
      a.voteResult === 'conditional' ? '⚠️ 조건부' : '🔄 재검토';
    summary += `• 안건 ${a.agendaIndex}: ${a.title} — ${voteLabel}\n`;
  });

  return summary;
}
