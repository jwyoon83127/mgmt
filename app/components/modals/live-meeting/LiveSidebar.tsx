'use client';

import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';

export default function LiveSidebar() {
  const { agendas, currentStep, totalSteps } = useLiveMeetingStore();

  const steps = [
    { step: 0, label: '초대 및 안내' },
    ...agendas.map((a, i) => ({ step: i + 1, label: `안건 ${a.index}: ${a.title}` })),
    { step: totalSteps - 1, label: '결과 종합' },
  ];

  return (
    <div className="w-64 shrink-0 border-r flex flex-col py-4 overflow-y-auto" style={{ borderColor: '#e0e4e8' }}>
      {steps.map(({ step, label }) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <div
            key={step}
            className={`relative flex items-center gap-3 px-4 py-3.5 transition-colors ${isActive ? 'bg-ui-low' : ''}`}
          >
            {/* 활성 인디케이터 */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full bg-brand-primary">
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-primary animate-pulse-dot" />
              </div>
            )}

            {/* 스텝 넘버 */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-brand-primary text-white'
                  : isCompleted
                  ? 'bg-brand-primary/20 text-brand-container'
                  : 'bg-ui-low text-ui-variant'
              }`}
            >
              {isCompleted ? '✓' : step === 0 ? '•' : step === totalSteps - 1 ? '★' : step}
            </div>

            {/* 레이블 */}
            <p
              className={`text-xs font-medium leading-snug line-clamp-2 transition-opacity ${
                isActive ? 'text-ui-on-surface' : isCompleted ? 'text-ui-variant' : 'text-ui-low'
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
