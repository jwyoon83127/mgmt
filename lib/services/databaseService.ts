import { supabase } from '../supabaseClient';
import { MeetingRound, Agenda, CeoReport } from '../types/meeting';

export const databaseService = {
  // --- Meeting Rounds ---
  async getMeetingRounds() {
    const { data: rounds, error } = await supabase
      .from('meeting_rounds')
      .select(`
        *,
        agendas (*)
      `)
      .order('year', { ascending: false })
      .order('round', { ascending: false });

    if (error) throw error;
    return rounds as MeetingRound[];
  },

  async createMeetingRound(round: Partial<MeetingRound>) {
    const { data, error } = await supabase
      .from('meeting_rounds')
      .insert([{
        year: round.year,
        round: round.round,
        date: round.date,
        time: round.time,
        location: round.location,
        attendees: round.attendees,
        ai_summary: round.aiSummary,
        duration: round.duration,
        status: 'planned'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMeetingRound(id: string, updates: Partial<MeetingRound>) {
    const { data, error } = await supabase
      .from('meeting_rounds')
      .update({
        date: updates.date,
        time: updates.time,
        location: updates.location,
        attendees: updates.attendees,
        ai_summary: updates.aiSummary,
        duration: updates.duration
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Agendas ---
  async saveAgendas(meetingId: string, agendas: Partial<Agenda>[]) {
    // Delete existing agendas for this meeting first (simple sync strategy)
    await supabase.from('agendas').delete().eq('meeting_id', meetingId);

    const formattedAgendas = agendas.map(a => ({
      meeting_id: meetingId,
      index: a.index,
      title: a.title,
      summary: a.summary,
      vote_result: a.voteResult,
      vote_comment: a.voteComment,
      transcript: a.transcript
    }));

    const { data, error } = await supabase
      .from('agendas')
      .insert(formattedAgendas)
      .select();

    if (error) throw error;
    return data;
  },

  // --- CEO Reports ---
  async getCeoReport(roundId: string) {
    const { data, error } = await supabase
      .from('ceo_reports')
      .select('*')
      .eq('round_id', roundId)
      .maybeSingle();

    if (error) throw error;
    return data as CeoReport | null;
  },

  async saveCeoReport(report: Partial<CeoReport>) {
    const { data, error } = await supabase
      .from('ceo_reports')
      .upsert({
        round_id: report.roundId,
        title: report.title,
        summary: report.summary,
        key_decisions: report.keyDecisions,
        action_items: report.actionItems,
        risks: report.risks,
        opportunities: report.opportunities,
        generated_at: new Date().toISOString()
      }, { onConflict: 'round_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
