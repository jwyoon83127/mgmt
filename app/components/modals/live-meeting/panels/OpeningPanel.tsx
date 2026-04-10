export default function OpeningPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-16 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
        style={{ background: '#2a676c15' }}>
        <svg className="w-8 h-8 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21V8l9-6 9 6v13" />
          <path d="M9 21v-6h6v6" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold font-display text-ui-on-surface mb-3">
        경영집행위원회 정기회의
      </h2>
      <p className="text-sm text-ui-variant mb-12 max-w-md">
        회의를 시작합니다. 모든 위원님께서는 발언 시 마이크를 활성화해 주시기 바랍니다.
      </p>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        {[
          { icon: '🎤', title: '발언 원칙', desc: '발언자는 안건과 관련된 의견을 간결하게 전달합니다.' },
          { icon: '🗳️', title: '표결 원칙', desc: '각 안건별 표결은 발언 종료 후 즉시 진행됩니다.' },
          { icon: '📋', title: '기록 원칙', desc: '모든 발언과 표결 결과는 자동으로 기록됩니다.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl p-5 text-left border" style={{ background: '#f0f5f7', borderColor: '#d0d5dc' }}>
            <div className="text-2xl mb-3">{item.icon}</div>
            <p className="text-sm font-semibold text-ui-on-surface mb-1.5">{item.title}</p>
            <p className="text-xs text-ui-variant leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
