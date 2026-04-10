'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MeetingRound, VoteType } from '@/lib/types/meeting';

import { databaseService } from '@/lib/services/databaseService';

interface MeetingStoreState {
  rounds: MeetingRound[];
  isLoading: boolean;
  error: string | null;
  fetchRounds: () => Promise<void>;
  addRound: (round: MeetingRound) => Promise<void>;
  updateRound: (roundId: string, updates: Partial<MeetingRound>) => Promise<void>;
  getRound: (roundId: string) => MeetingRound | undefined;
}

export const useMeetingStore = create<MeetingStoreState>((set, get) => ({
  rounds: [],
  isLoading: false,
  error: null,

  fetchRounds: async () => {
    set({ isLoading: true });
    try {
      const rounds = await databaseService.getMeetingRounds();
      set({ rounds, isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      console.error('회의 정보 로드 실패:', err);
    }
  },

  addRound: async (round) => {
    try {
      const newRound = await databaseService.createMeetingRound(round);
      // 안건이 함께 있는 경우 저장
      if (round.agendas && round.agendas.length > 0) {
        await databaseService.saveAgendas(newRound.id, round.agendas);
      }
      // UI 즉시 업데이트를 위해 다시 로드
      const rounds = await databaseService.getMeetingRounds();
      set({ rounds });
    } catch (err: any) {
      console.error('회의 생성 실패:', err);
      throw err;
    }
  },

  updateRound: async (roundId, updates) => {
    try {
      await databaseService.updateMeetingRound(roundId, updates);
      if (updates.agendas) {
        await databaseService.saveAgendas(roundId, updates.agendas);
      }
      // UI 즉시 업데이트
      const rounds = await databaseService.getMeetingRounds();
      set({ rounds });
    } catch (err: any) {
      console.error('회의 업데이트 실패:', err);
      throw err;
    }
  },

  getRound: (roundId) => get().rounds.find((r) => r.id === roundId),
}));
