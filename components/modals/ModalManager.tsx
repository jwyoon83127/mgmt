'use client';

import { useEffect } from 'react';
import AgendaUploadDrawer from './agenda-upload/AgendaUploadDrawer';
import PreviewDrawer from './preview/PreviewDrawer';
import LiveMeetingModal from './live-meeting/LiveMeetingModal';
import ReportModal from './report/ReportModal';
import MeetingStartModal from './meeting-start/MeetingStartModal';
import AdminModal from './admin/AdminModal';
import { useUIStore } from '@/lib/store/uiStore';

export default function ModalManager() {
  const { agendaDrawerOpen, previewDrawerOpen, reportModalOpen, meetingStartModalOpen, adminModalOpen, closeAgendaDrawer, closePreviewModal, closeReportModal, closeMeetingStartModal, closeAdminModal } = useUIStore();

  // ESC 키로 드로어 닫기 (라이브 회의 제외 — 실수 방지)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (agendaDrawerOpen) closeAgendaDrawer();
      else if (previewDrawerOpen) closePreviewModal();
      else if (reportModalOpen) closeReportModal();
      else if (meetingStartModalOpen) closeMeetingStartModal();
      else if (adminModalOpen) closeAdminModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [agendaDrawerOpen, previewDrawerOpen, reportModalOpen, meetingStartModalOpen, adminModalOpen]);

  return (
    <>
      <AgendaUploadDrawer />
      <PreviewDrawer />
      <LiveMeetingModal />
      <ReportModal />
      <MeetingStartModal />
      <AdminModal />
    </>
  );
}
