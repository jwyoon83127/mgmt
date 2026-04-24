'use client';

import { create } from 'zustand';

interface UIState {
  agendaDrawerOpen: boolean;
  previewDrawerOpen: boolean;
  liveMeetingOpen: boolean;
  reportModalOpen: boolean;
  meetingStartModalOpen: boolean;
  adminModalOpen: boolean;
  pendingRoundId: string | null;
  pendingPreviewRoundId: string | null;
  pendingAgendaRoundId: string | null;
  openAgendaDrawer: (roundId?: string) => void;
  closeAgendaDrawer: () => void;
  openPreviewModal: (roundId?: string) => void;
  closePreviewModal: () => void;
  openLiveMeeting: () => void;
  closeLiveMeeting: () => void;
  openReportModal: () => void;
  closeReportModal: () => void;
  openMeetingStartModal: (roundId: string) => void;
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
  pendingRoundId: null,
  pendingPreviewRoundId: null,
  pendingAgendaRoundId: null,
  openAgendaDrawer: (roundId) => set({ agendaDrawerOpen: true, pendingAgendaRoundId: roundId ?? null }),
  closeAgendaDrawer: () => set({ agendaDrawerOpen: false, pendingAgendaRoundId: null }),
  openPreviewModal: (roundId) => set({ previewDrawerOpen: true, pendingPreviewRoundId: roundId ?? null }),
  closePreviewModal: () => set({ previewDrawerOpen: false, pendingPreviewRoundId: null }),
  openLiveMeeting: () => set({ liveMeetingOpen: true }),
  closeLiveMeeting: () => set({ liveMeetingOpen: false }),
  openReportModal: () => set({ reportModalOpen: true }),
  closeReportModal: () => set({ reportModalOpen: false }),
  openMeetingStartModal: (roundId) => set({ meetingStartModalOpen: true, pendingRoundId: roundId }),
  closeMeetingStartModal: () => set({ meetingStartModalOpen: false, pendingRoundId: null }),
  openAdminModal: () => set({ adminModalOpen: true }),
  closeAdminModal: () => set({ adminModalOpen: false }),
}));
