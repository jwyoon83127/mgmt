'use client';

interface AgendaFormData {
  title: string;
  description: string;
  fileName?: string;
}

interface AgendaItemFormProps {
  index: number;
  data: AgendaFormData;
  onChange: (index: number, data: AgendaFormData) => void;
  onRemove: (index: number) => void;
}

export default function AgendaItemForm({ index, data, onChange, onRemove }: AgendaItemFormProps) {
  const update = (patch: Partial<AgendaFormData>) => onChange(index, { ...data, ...patch });

  return (
    <div className="p-5 rounded-2xl bg-ui-low border border-ui-high/60 space-y-3">
      {/* 안건 번호 + 삭제 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-primary bg-brand-container/50 px-2.5 py-0.5 rounded-full">
          안건 {index + 1}
        </span>
        {index > 0 && (
          <button
            onClick={() => onRemove(index)}
            className="text-ui-variant hover:text-status-error transition-colors p-1 rounded-lg hover:bg-status-e-container cursor-pointer"
            aria-label="안건 삭제"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 제목 */}
      <input
        type="text"
        placeholder="안건 제목을 입력하세요"
        value={data.title}
        onChange={(e) => update({ title: e.target.value })}
        className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-ui-high focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-ui-on-surface placeholder:text-ui-variant transition-all"
      />

      {/* 내용 */}
      <textarea
        placeholder="안건 내용을 간략히 입력하세요"
        value={data.description}
        onChange={(e) => update({ description: e.target.value })}
        rows={3}
        className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-ui-high focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-ui-on-surface placeholder:text-ui-variant transition-all resize-none"
      />

      {/* 파일 첨부 */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-ui-high bg-white group-hover:border-brand-primary transition-colors">
          <svg className="w-4 h-4 text-ui-variant group-hover:text-brand-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span className="text-sm text-ui-variant group-hover:text-brand-primary transition-colors">
            {data.fileName || '의결 문서 첨부 (PDF, DOCX)'}
          </span>
        </div>
        <input
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) update({ fileName: file.name });
          }}
        />
      </label>
    </div>
  );
}

export type { AgendaFormData };
