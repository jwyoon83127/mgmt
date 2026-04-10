import AppHeader from '@/components/layout/AppHeader';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import ArchiveSection from '@/components/archive/ArchiveSection';
import ModalManager from '@/components/modals/ModalManager';

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface no-print">
        <WorkflowSection />

        {/* 섹션 구분선 */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-ui-high" />
            <span className="text-xs font-semibold text-ui-variant bg-ui-high px-3 py-1 rounded-full uppercase tracking-wider">
              Archive & Tracking
            </span>
            <div className="flex-1 h-px bg-ui-high" />
          </div>
        </div>

        <ArchiveSection />
      </main>
      <ModalManager />
    </>
  );
}
