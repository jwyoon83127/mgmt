import { MeetingRound } from '@/lib/types/meeting';

/**
 * MeetingRound를 PDF로 생성하고 다운로드
 * html2canvas를 사용하여 화면의 내용을 캡처하고 jsPDF에 삽입
 */
export async function generatePdfReport(round: MeetingRound, element: HTMLElement): Promise<void> {
  console.log('PDF 생성 시작...');
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;

    // 전체 높이 확보를 위해 임시로 높이 제한 해제
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    // 캔버스 생성
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // oklab/oklch 문제가 있는 스타일시트를 제거하지 않고, 문제되는 클래스/스타일만 필터링 시도
        // antigravity-scroll-lock 제거
        clonedDoc.body.classList.remove('antigravity-scroll-lock');
        
        // 특정 스타일 시트에서 oklab 에러가 발생하는 경우를 대비해 인라인 스타일 강화
        const clonedEl = clonedDoc.querySelector('[ref="reportRef"]') as HTMLElement;
        if (clonedEl) {
          clonedEl.style.height = 'auto';
          clonedEl.style.overflow = 'visible';
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.padding = '40px';
          clonedEl.style.width = '800px';
        }
      }
    });

    // 원래 스타일 복구
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('캔버스 생성 실패: 내용이 비어있습니다.');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // 페이지 추가 로직
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 파일명: 년도_xx회차.pdf
    const fileName = `${round.year}_${round.round}회차.pdf`;
    pdf.save(fileName);
    console.log('PDF 생성 및 다운로드 완료:', fileName);
  } catch (error) {
    console.error('PDF 생성 중 오류 발생:', error);
    throw error;
  }
}
