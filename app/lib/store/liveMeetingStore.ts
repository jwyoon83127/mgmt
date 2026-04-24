'use client';

import { create } from 'zustand';
import { LiveAgenda, VoteRecord, VoteType } from '@/lib/types/meeting';

interface LiveMeetingState {
  roundId: string;
  meetingRound: number;
  currentStep: number;      // 0 = 오프닝, 1..N = 안건, N+1 = 결과종합
  totalSteps: number;       // agendas.length + 2
  agendas: LiveAgenda[];
  votes: Record<number, VoteRecord>; // key: agenda index (1-based)
  transcripts: Record<number, string>; // key: agenda index (1-based), value: 음성 기록
  elapsedSeconds: number;
  timerActive: boolean;

  // Actions
  initMeeting: (agendas: LiveAgenda[], round: number, roundId: string) => void;
  nextStep: () => void;
  castVote: (agendaIndex: number, type: VoteType) => void;
  setVoteComment: (agendaIndex: number, comment: string) => void;
  appendTranscript: (agendaIndex: number, text: string) => void;
  setTranscript: (agendaIndex: number, text: string) => void;
  submitStep: (agendaIndex: number) => void;
  tickTimer: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetMeeting: () => void;
}

export const useLiveMeetingStore = create<LiveMeetingState>((set, get) => ({
  roundId: '',
  meetingRound: 0,
  currentStep: 0,
  totalSteps: 0,
  agendas: [],
  votes: {},
  transcripts: {},
  elapsedSeconds: 0,
  timerActive: false,

  initMeeting: (agendas, round, roundId) =>
    set({
      roundId,
      agendas,
      meetingRound: round,
      totalSteps: agendas.length + 2,
      currentStep: 0,
      votes: {},
      transcripts: {},
      elapsedSeconds: 0,
      timerActive: false,
    }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
    })),

  castVote: (agendaIndex, type) =>
    set((state) => ({
      votes: {
        ...state.votes,
        [agendaIndex]: {
          type,
          comment: state.votes[agendaIndex]?.comment ?? '',
          submittedAt: state.votes[agendaIndex]?.submittedAt ?? new Date(),
        },
      },
    })),

  setVoteComment: (agendaIndex, comment) =>
    set((state) => ({
      votes: {
        ...state.votes,
        [agendaIndex]: {
          ...(state.votes[agendaIndex] ?? { type: 'approved', submittedAt: new Date() }),
          comment,
        },
      },
    })),

  appendTranscript: (agendaIndex, text) =>
    set((state) => ({
      transcripts: {
        ...state.transcripts,
        [agendaIndex]: (state.transcripts[agendaIndex] || '') + (state.transcripts[agendaIndex] ? ' ' : '') + text,
      },
    })),

  setTranscript: (agendaIndex, text) =>
    set((state) => ({
      transcripts: {
        ...state.transcripts,
        [agendaIndex]: text,
      },
    })),

  submitStep: (agendaIndex) => {
    const state = get();
    const existing = state.votes[agendaIndex];
    set((s) => ({
      votes: {
        ...s.votes,
        [agendaIndex]: {
          ...existing,
          submittedAt: new Date(),
        },
      },
      currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1),
    }));
  },

  tickTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  startTimer: () => set({ timerActive: true }),
  stopTimer: () => set({ timerActive: false }),

  resetMeeting: () =>
    set({
      currentStep: 0,
      agendas: [],
      votes: {},
      transcripts: {},
      elapsedSeconds: 0,
      timerActive: false,
      totalSteps: 0,
    }),
}));
