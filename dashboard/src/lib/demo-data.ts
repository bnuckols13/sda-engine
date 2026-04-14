import type { Study, ParticipantWithDreams, Dream, PartAScore, PartBScore } from './types';

// Demo data for development without Supabase
export const DEMO_STUDY: Study = {
  id: 'demo-study',
  name: 'SDA Pilot Study — General Psychotherapy',
  mode: 'SDA-SI',
  config: {},
  created_at: '2026-04-01T00:00:00Z',
};

const makeDream = (seq: number, text: string, date: string, partA?: Partial<PartAScore>, partB?: Partial<PartBScore>): Dream => ({
  id: `dream-${seq}`,
  participant_id: 'p1',
  sequence_num: seq,
  dream_text: text,
  word_count: text.split(/\s+/).length,
  dream_date: date,
  created_at: date + 'T08:00:00Z',
  part_a_scores: partA ? [{
    id: `pa-${seq}`, dream_id: `dream-${seq}`, rater_id: 'rater-1',
    ptc_code: '2.3', ptc_linear: 4, ego_position: 3, narrative_arc: 2,
    tm_markers: [], fff_position: null, threat_specificity: null,
    threat_proximity: null, threat_familiarity: null, threat_transformation: null,
    repetition_fidelity: null, awakening_pattern: null, notes: '', scored_at: date + 'T10:00:00Z',
    ...partA,
  }] : [],
  part_b_scores: [{
    id: `pb-${seq}`, dream_id: `dream-${seq}`,
    responses: { 1: 2, 2: 4, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 2 },
    agency: 7, threat: 7, relational: 5, continuity: 4,
    trauma_agency: null, trauma_threat: null, trauma_impact: null, repetition: null,
    ...partB,
  }],
  self_codings: [],
});

export const DEMO_PARTICIPANT: ParticipantWithDreams = {
  id: 'p1',
  study_id: 'demo-study',
  token: 'demo-token',
  label: 'P01',
  consented_at: '2026-04-02T09:00:00Z',
  created_at: '2026-04-01T00:00:00Z',
  study: DEMO_STUDY,
  dreams: [
    makeDream(1, 'I was in a dark corridor and something was following me. I could hear footsteps behind me getting louder. I tried to run but my legs felt heavy, like moving through water. The walls were closing in and I could not find any exit. I kept running until I woke up gasping.', '2026-04-03',
      { ptc_code: '2.3', ptc_linear: 4, ego_position: 3, narrative_arc: 2 },
      { agency: 6, threat: 8, relational: 3 }),
    makeDream(2, 'I was taking an exam in a large hall. The paper was in a language I could not read. Everyone around me was writing confidently. I looked at the clock and half the time was gone. I tried to write something but my pen ran out of ink. I searched my bag and found nothing useful.', '2026-04-06',
      { ptc_code: '3.1', ptc_linear: 7, ego_position: 2, narrative_arc: 3 },
      { agency: 5, threat: 6, relational: 4 }),
    makeDream(3, 'I was driving on a highway trying to reach a town I had never been to. The road kept splitting and I did not know which way to go. I stopped at a gas station and asked for directions. The attendant pointed me toward a road that looked familiar. I started driving again with some hope.', '2026-04-10',
      { ptc_code: '4.3', ptc_linear: 12, ego_position: 4, narrative_arc: 4 },
      { agency: 9, threat: 4, relational: 6 }),
    makeDream(4, 'I was at a gathering and noticed someone I wanted to talk to across the room. I walked over and introduced myself. We talked about traveling and she told me about a place she loved. I felt comfortable and she asked if I wanted to sit outside together. We walked to the garden.', '2026-04-14',
      { ptc_code: '5.3', ptc_linear: 17, ego_position: 1, narrative_arc: 5 },
      { agency: 13, threat: 2, relational: 8 }),
    makeDream(5, 'I was walking through a forest alone and felt peaceful. The sunlight came through the trees and I found a clearing with a stream. I sat by the water and watched the light on the surface. A bird landed nearby and we looked at each other. I felt no need to be anywhere else.', '2026-04-17',
      undefined,
      { agency: 14, threat: 2, relational: 4 }),
  ],
};

export const DEMO_PARTICIPANTS = [
  DEMO_PARTICIPANT,
  {
    ...DEMO_PARTICIPANT,
    id: 'p2', label: 'P02', token: 'demo-token-2',
    dreams: DEMO_PARTICIPANT.dreams.slice(0, 3).map(d => ({
      ...d, id: d.id + '-p2', participant_id: 'p2',
    })),
  },
];
