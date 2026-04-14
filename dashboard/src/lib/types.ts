export type StudyMode = 'SDA-SI' | 'SDA-TNS';

export interface Study {
  id: string;
  name: string;
  mode: StudyMode;
  config: Record<string, unknown>;
  created_at: string;
}

export interface Participant {
  id: string;
  study_id: string;
  token: string;
  label: string;
  consented_at: string | null;
  created_at: string;
}

export interface Dream {
  id: string;
  participant_id: string;
  sequence_num: number;
  dream_text: string;
  word_count: number;
  dream_date: string | null;
  created_at: string;
  part_b_scores?: PartBScore[];
  part_a_scores?: PartAScore[];
  self_codings?: SelfCoding[];
}

export interface PartBScore {
  id: string;
  dream_id: string;
  responses: Record<number, number>;
  agency: number | null;
  threat: number | null;
  relational: number | null;
  continuity: number | null;
  trauma_agency: number | null;
  trauma_threat: number | null;
  trauma_impact: number | null;
  repetition: number | null;
}

export interface PartAScore {
  id: string;
  dream_id: string;
  rater_id: string;
  ptc_code: string;
  ptc_linear: number;
  ego_position: number | null;
  narrative_arc: number | null;
  tm_markers: string[];
  fff_position: number | null;
  threat_specificity: string | null;
  threat_proximity: string | null;
  threat_familiarity: string | null;
  threat_transformation: string | null;
  repetition_fidelity: number | null;
  awakening_pattern: string | null;
  notes: string;
  scored_at: string;
}

export interface SelfCoding {
  id: string;
  dream_id: string;
  ptc_code: string;
  ptc_linear: number;
  tree_path: unknown;
}

export interface ParticipantWithDreams extends Participant {
  dreams: Dream[];
  study?: Study;
}

export interface StudyWithParticipants extends Study {
  participants: (Participant & { dreams: Dream[] })[];
}
