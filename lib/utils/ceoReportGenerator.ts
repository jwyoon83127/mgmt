import { MeetingRound, CeoReport } from '@/lib/types/meeting';

/**
 * 회의 데이터를 기반으로 CEO 보고서를 생성합니다
 * 실제 운영환경에서는 Claude API를 사용하여 AI 기반 요약을 생성합니다
 */
export function generateCeoReport(round: MeetingRound): CeoReport {
  // 투표 결과 분석
  const totalAgendas = round.agendas.length;
  const approvalRate = ((round.voteStats.approved / totalAgendas) * 100).toFixed(1);

  // 의사결정 항목 추출
  const keyDecisions = round.agendas
    .filter((a) => a.voteResult === 'approved')
    .map((a) => `${a.title} (승인)`);

  // 조건부 승인 항목
  const conditionalItems = round.agendas
    .filter((a) => a.voteResult === 'conditional')
    .map((a) => `${a.title} - ${a.voteComment || '추가 검토 필요'}`);

  // 재검토 필요 항목
  const reviewItems = round.agendas
    .filter((a) => a.voteResult === 'review')
    .map((a) => `${a.title} - ${a.voteComment || '재검토 예정'}`);

  // 주요 위험 요소
  const risks = reviewItems.length > 0 ? [`재검토 필요: ${reviewItems.join(', ')}`] : [];

  if (conditionalItems.length > 0) {
    risks.push(`조건부 승인: 세부 조건 검토 필요`);
  }

  // 기회 요소
  const opportunities = [];
  if (approvalRate >= '70') {
    opportunities.push('높은 승인률로 조직의 의사결정 효율성 입증');
  }
  if (round.agendas.some((a) => a.voteComment?.includes('기회'))) {
    opportunities.push('성장 기회 발굴 및 신사업 추진');
  }

  const summary = generateExecutiveSummary(round, approvalRate);

  return {
    id: `report-${round.id}`,
    roundId: round.id,
    title: `${round.year}년 제${round.round}회 경영집행위원회 보고서`,
    summary,
    keyDecisions: [...keyDecisions, ...conditionalItems].slice(0, 5),
    actionItems: [
      `${round.voteStats.approved}건 안건 승인 완료`,
      conditionalItems.length > 0 ? `${conditionalItems.length}건 조건부 승인 관리` : null,
      reviewItems.length > 0 ? `${reviewItems.length}건 재검토 일정 수립` : null,
    ].filter(Boolean) as string[],
    risks,
    opportunities,
    generatedAt: new Date(),
  };
}

function generateExecutiveSummary(round: MeetingRound, approvalRate: string): string {
  const dateStr = new Date(round.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const attendeeCount = round.attendees.length;
  const durationStr = round.duration;

  return `${dateStr} ${round.location}에서 개최된 제${round.round}회 경영집행위원회에서 총 ${round.agendas.length}개 안건이 논의되었으며, ${round.voteStats.approved}건이 승인(${approvalRate}%)되고 ${round.voteStats.conditional}건이 조건부 승인, ${round.voteStats.review}건이 재검토 대상으로 결정되었습니다.

${attendeeCount}명의 임원진이 참석하여 ${durationStr}에 걸쳐 집중 논의하였으며, 각 안건별 세부 의견과 함께 향후 조치사항이 확정되었습니다. 특히 조건부 승인 안건에 대해서는 추가 분석 및 검토를 통해 최종 의사결정을 진행하기로 결정하였습니다.`;
}

/**
 * CEO 보고서를 PDF로 생성하고 다운로드합니다
 */
export async function downloadCeoReportPdf(report: CeoReport, element?: HTMLElement): Promise<void> {
  try {
    const jsPDF = (await import('jspdf')).jsPDF;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (element) {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          clonedDoc.body.classList.remove('antigravity-scroll-lock');
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const match = report.roundId.match(/round-(\d+)-(\d+)/);
      const fileName = match 
        ? `CEO_보고서_${match[1]}_${match[2]}회차.pdf`
        : `CEO_보고서_${report.roundId}.pdf`;
        
      pdf.save(fileName);
    } else {
      // Fallback to manual drawing if no element provided
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // 제목
      doc.setFontSize(16);
      doc.text('경영진 보고서', margin, yPosition);
      yPosition += 10;

      // 보고서 제목
      doc.setFontSize(12);
      doc.text(report.title, margin, yPosition);
      yPosition += 10;

      // 요약
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(report.summary, contentWidth) as string[];
      summaryLines.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }

    // 다운로드 파일명: CEO_보고서_년도_xx회차.pdf
    const match = report.roundId.match(/round-(\d+)-(\d+)/);
    const fileName = match 
      ? `CEO_보고서_${match[1]}_${match[2]}회차.pdf`
      : `CEO_보고서_${report.roundId}.pdf`;
      
    doc.save(fileName);
  } catch (error) {
    console.error('CEO 보고서 PDF 생성 실패:', error);
    throw error;
  }
}
