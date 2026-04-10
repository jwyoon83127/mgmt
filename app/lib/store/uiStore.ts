'use client';

import { create } from 'zustand';

interface UIState {
  agendaDrawerOpen: boolean;
  previewDrawerOpen: boolean;
  liveMeetingOpen: boolean;
  reportModalOpen: boolean;
  meetingStartModalOpen: boolean;
  adminModalOpen: boolean;
  openAgendaDrawer: () => void;
  closeAgendaDrawer: () => void;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
  openLiveMeeting: () => void;
  closeLiveMeeting: () => void;
  openReportModal: () => void;
  closeReportModal: () => void;
  openMeetingStartModal: () => void;
  closeMeetingStartModal: () => void;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  agendaDrawerOpen: false,
  previewDrawerOpen: false,
  liveMeetingOpen: false,
  reportModalOpen: false,
  meetingStartModalOpen: false,
  adminModalOpen: false,
  openAgendaDrawer: () => set({ agendaDrawerOpen: true }),
  closeAgendaDrawer: () => set({ agendaDrawerOpen: false }),
  openPreviewModal: () => set({ previewDrawerOpen: true }),
  closePreviewModal: () => set({ previewDrawerOpen: false }),
  openLiveMeeting: () => set({ liveMeetingOpen: true }),
  closeLiveMeeting: () => set({ liveMeetingOpen: false }),
  openReportModal: () => set({ reportModalOpen: true }),
  closeReportModal: () => set({ reportModalOpen: false }),
  openMeetingStartModal: () => set({ meetingStartModalOpen: true }),
  closeMeetingStartModal: () => set({ meetingStartModalOpen: false }),
  openAdminModal: () => set({ adminModalOpen: true }),
  closeAdminModal: () => set({ adminModalOpen: false }),
}));
