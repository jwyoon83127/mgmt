'use server';

import pool from '../db';
import { MeetingRound, Agenda, CeoReport } from '../types/meeting';

export async function getMeetingRounds() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM meeting_rounds 
      ORDER BY meeting_year DESC, round_no DESC
    `);
    
    const roundsList = rows as any[];
    const [agendas] = await pool.query(`SELECT * FROM agendas`);
    const agendasList = agendas as any[];

    return roundsList.map(round => {
      let attendees = [];
      try { attendees = typeof round.attendees === 'string' ? JSON.parse(round.attendees) : round.attendees; } catch(e) {}
      
      return {
        id: round.id,
        year: round.meeting_year,
        round: round.round_no,
        date: new Date(round.meeting_date).toISOString().split('T')[0],
        time: round.meeting_time,
        location: round.location || '',
        attendees: attendees || [],
        aiSummary: round.ai_summary || '',
        duration: round.duration || '00:00:00',
        agendas: agendasList
          .filter(a => a.meeting_id === round.id)
          .map(a => ({
            index: a.agenda_index,
            title: a.title,
            summary: a.summary || '',
            voteResult: a.vote_result,
            voteComment: a.vote_comment || '',
            transcript: a.transcript || ''
          })),
        voteStats: {
          approved: agendasList.filter(a => a.meeting_id === round.id && a.vote_result === 'approved').length,
          conditional: agendasList.filter(a => a.meeting_id === round.id && a.vote_result === 'conditional').length,
          review: agendasList.filter(a => a.meeting_id === round.id && a.vote_result === 'review').length
        },
        createdAt: round.created_at
      } as MeetingRound;
    });
  } catch (error) {
    console.error('getMeetingRounds error:', error);
    throw new Error('Failed to fetch meeting rounds');
  }
}

export async function getMeetingRoundById(id: string) {
  const rounds = await getMeetingRounds();
  return rounds.find(r => r.id === id);
}

export async function createMeetingRound(round: Partial<MeetingRound>) {
  try {
    const id = round.id || `round-${round.year}-${round.round}`;
    await pool.query(
      `INSERT INTO meeting_rounds (id, meeting_year, round_no, meeting_date, meeting_time, location, attendees, ai_summary, duration) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        round.year, 
        round.round, 
        round.date, 
        round.time, 
        round.location, 
        JSON.stringify(round.attendees || []), 
        round.aiSummary || '', 
        round.duration || '00:00:00'
      ]
    );
    
    return await getMeetingRoundById(id);
  } catch (error: any) {
    console.error('createMeetingRound error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      throw new Error(`DUPLICATE:${round.year}-${round.round}`);
    }
    throw new Error('Failed to create meeting round');
  }
}

export async function updateMeetingRound(id: string, updates: Partial<MeetingRound>) {
  try {
    if (updates.attendees) {
      await pool.query('UPDATE meeting_rounds SET attendees = ? WHERE id = ?', [JSON.stringify(updates.attendees), id]);
    }
    if (updates.date) await pool.query('UPDATE meeting_rounds SET meeting_date = ? WHERE id = ?', [updates.date, id]);
    if (updates.time) await pool.query('UPDATE meeting_rounds SET meeting_time = ? WHERE id = ?', [updates.time, id]);
    if (updates.location) await pool.query('UPDATE meeting_rounds SET location = ? WHERE id = ?', [updates.location, id]);
    if (updates.aiSummary) await pool.query('UPDATE meeting_rounds SET ai_summary = ? WHERE id = ?', [updates.aiSummary, id]);
    if (updates.duration) await pool.query('UPDATE meeting_rounds SET duration = ? WHERE id = ?', [updates.duration, id]);
    
    return await getMeetingRoundById(id);
  } catch (error) {
    console.error('updateMeetingRound error:', error);
    throw new Error('Failed to update meeting round');
  }
}

export async function deleteMeetingRound(id: string) {
  try {
    await pool.query(`DELETE FROM agendas WHERE meeting_id = ?`, [id]);
    await pool.query(`DELETE FROM ceo_reports WHERE round_id = ?`, [id]);
    await pool.query(`DELETE FROM meeting_rounds WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error('deleteMeetingRound error:', error);
    throw new Error('Failed to delete meeting round');
  }
}

export async function saveAgendas(meetingId: string, agendas: Partial<Agenda>[]) {
  try {
    await pool.query(`DELETE FROM agendas WHERE meeting_id = ?`, [meetingId]);
    
    for (const a of agendas) {
      const agendaId = `agenda-${meetingId}-${a.index}`;
      await pool.query(
        `INSERT INTO agendas (id, meeting_id, agenda_index, title, summary, vote_result, vote_comment, transcript) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [agendaId, meetingId, a.index, a.title, a.summary || '', a.voteResult, a.voteComment || '', a.transcript || '']
      );
    }
    return true;
  } catch (error) {
    console.error('saveAgendas error:', error);
    throw new Error('Failed to save agendas');
  }
}

export async function getCeoReport(roundId: string) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ceo_reports WHERE round_id = ?`, [roundId]);
    const reportList = rows as any[];
    if (reportList.length === 0) return null;
    
    const report = reportList[0];
    return {
      id: report.id,
      roundId: report.round_id,
      title: report.title,
      summary: report.summary,
      keyDecisions: typeof report.key_decisions === 'string' ? JSON.parse(report.key_decisions) : report.key_decisions || [],
      actionItems: typeof report.action_items === 'string' ? JSON.parse(report.action_items) : report.action_items || [],
      risks: typeof report.risks === 'string' ? JSON.parse(report.risks) : report.risks || [],
      opportunities: typeof report.opportunities === 'string' ? JSON.parse(report.opportunities) : report.opportunities || [],
      generatedAt: report.generated_at
    } as CeoReport;
  } catch (error) {
    console.error('getCeoReport error:', error);
    throw new Error('Failed to fetch CEO report');
  }
}

export async function saveCeoReport(report: Partial<CeoReport>) {
  try {
    const id = report.id || `ceo-report-${report.roundId}`;
    await pool.query(
      `INSERT INTO ceo_reports (id, round_id, title, summary, key_decisions, action_items, risks, opportunities) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       title=VALUES(title), summary=VALUES(summary), key_decisions=VALUES(key_decisions), 
       action_items=VALUES(action_items), risks=VALUES(risks), opportunities=VALUES(opportunities)`,
      [
        id, report.roundId, report.title, report.summary,
        JSON.stringify(report.keyDecisions || []),
        JSON.stringify(report.actionItems || []),
        JSON.stringify(report.risks || []),
        JSON.stringify(report.opportunities || [])
      ]
    );
    return await getCeoReport(report.roundId!);
  } catch (error) {
    console.error('saveCeoReport error:', error);
    throw new Error('Failed to save CEO report');
  }
}
