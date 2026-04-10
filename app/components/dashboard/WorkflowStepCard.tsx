'use client';

interface WorkflowStepCardProps {
  number: 1 | 2 | 3 | 4;
  label: string;
  description: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function WorkflowStepCard({
  number,
  label,
  description,
  isActive = false,
  disabled = false,
  onClick,
}: WorkflowStepCardProps) {
  if (disabled) {
    return (
      <div
        className="flex-1 min-w-0 rounded-2xl p-6 bg-white border border-ui-high/60 opacity-40 cursor-not-allowed select-none"
        style={{ boxShadow: 'var(--shadow-layer)' }}
      >
        <div className="step-circle bg-ui-low text-ui-variant mb-4">{number}</div>
        <p className="text-sm font-bold text-ui-on-surface font-display mb-2">{label}</p>
        <p className="text-xs text-ui-variant leading-relaxed">{description}</p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group flex-1 min-w-0 rounded-2xl p-6 bg-white border border-ui-high/60 cursor-pointer select-none relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-transparent"
      style={{ boxShadow: 'var(--shadow-layer)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = '#1b3a5c';
        el.style.boxShadow = '0 16px 40px rgba(27,58,92,0.35)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = '';
        el.style.boxShadow = 'var(--shadow-layer)';
      }}
    >
      {/* LIVE 인디케이터 (3번 카드만) */}
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse-dot" />
          <span className="text-xs font-semibold text-[#4ade80] group-hover:text-[#4ade80] transition-colors duration-300">LIVE</span>
        </div>
      )}
      <div className="step-circle bg-ui-low text-ui-variant mb-4 transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">{number}</div>
      <p className="text-sm font-bold text-ui-on-surface font-display mb-2 transition-colors duration-300 group-hover:text-white">{label}</p>
      <p className="text-xs text-ui-variant leading-relaxed transition-colors duration-300 group-hover:text-white/60">{description}</p>
    </div>
  );
}
