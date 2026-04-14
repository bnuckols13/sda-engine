import type { Dream, PartAScore } from './types';

/**
 * Export study data as long-format CSV (one row per dream-score).
 * Compatible with R read.csv() and SPSS import.
 */
export function exportStudyCSV(
  participants: Array<{ label: string; dreams: Dream[] }>,
  studyName: string,
): string {
  const headers = [
    'participant', 'dream_seq', 'dream_date', 'word_count',
    'rater_id', 'ptc_code', 'ptc_linear', 'ego_position', 'narrative_arc',
    'tm_count', 'tm_markers',
    'fff_position', 'repetition_fidelity', 'awakening_pattern',
    'partb_agency', 'partb_threat', 'partb_relational', 'partb_continuity',
    'partb_trauma_impact', 'partb_repetition',
    'self_coding_ptc', 'self_coding_linear',
  ];

  const rows: string[][] = [];

  for (const p of participants) {
    for (const d of p.dreams) {
      const pb = d.part_b_scores?.[0];
      const sc = d.self_codings?.[0];
      const scores = d.part_a_scores || [];

      if (scores.length === 0) {
        // Row with Part B only (no clinician scoring yet)
        rows.push([
          p.label, String(d.sequence_num), d.dream_date || '', String(d.word_count),
          '', '', '', '', '', '', '',
          '', '', '',
          str(pb?.agency), str(pb?.threat), str(pb?.relational), str(pb?.continuity),
          str(pb?.trauma_impact), str(pb?.repetition),
          sc?.ptc_code || '', sc ? String(sc.ptc_linear) : '',
        ]);
      } else {
        for (const a of scores) {
          rows.push([
            p.label, String(d.sequence_num), d.dream_date || '', String(d.word_count),
            a.rater_id, a.ptc_code, String(a.ptc_linear),
            str(a.ego_position), str(a.narrative_arc),
            String(a.tm_markers.length), a.tm_markers.join(';'),
            str(a.fff_position), str(a.repetition_fidelity), a.awakening_pattern || '',
            str(pb?.agency), str(pb?.threat), str(pb?.relational), str(pb?.continuity),
            str(pb?.trauma_impact), str(pb?.repetition),
            sc?.ptc_code || '', sc ? String(sc.ptc_linear) : '',
          ]);
        }
      }
    }
  }

  const csv = [headers.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n');
  return csv;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function str(v: number | null | undefined): string {
  return v != null ? String(v) : '';
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}
