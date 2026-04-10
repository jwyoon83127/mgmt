'use client';

import { create } from 'zustand';
import { ArchiveRow } from '@/lib/types/meeting';

interface AgendaStoreState {
  submittedAgendas: ArchiveRow[];
  addAgendas: (agendas: ArchiveRow[]) => void;
}

export const useAgendaStore = create<AgendaStoreState>((set) => ({
  submittedAgendas: [],
  addAgendas: (agendas) =>
    set((state) => ({
      submittedAgendas: [...agendas, ...state.submittedAgendas],
    })),
}));
