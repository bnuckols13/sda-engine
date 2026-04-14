import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  SDA_PTC_CODES, SDA_EGO_POSITIONS, SDA_NARRATIVE_ARCS,
  SDA_TM_MARKERS, SDA_FFF_POSITIONS, SDA_AWAKENING_PATTERNS,
  linearizePTC, deriveFFF,
} from '../../lib/scoring-bridge';
import type { Study, ParticipantWithDreams } from '../../lib/types';

interface Props {
  participants: ParticipantWithDreams[];
  study: Study;
}

export default function DreamScorer({ participants, study }: Props) {
  const { participantId, dreamId } = useParams();
  const participant = participants.find(p => p.id === participantId);
  const dream = participant?.dreams.find(d => d.id === dreamId);

  const [ptcCode, setPtcCode] = useState(dream?.part_a_scores?.[0]?.ptc_code || '');
  const [ep, setEp] = useState<number | ''>(dream?.part_a_scores?.[0]?.ego_position || '');
  const [na, setNa] = useState<number | ''>(dream?.part_a_scores?.[0]?.narrative_arc || '');
  const [tmMarkers, setTmMarkers] = useState<string[]>(dream?.part_a_scores?.[0]?.tm_markers || []);
  const [fff, setFff] = useState<number | ''>(dream?.part_a_scores?.[0]?.fff_position || '');
  const [rf, setRf] = useState<number | ''>(dream?.part_a_scores?.[0]?.repetition_fidelity || '');
  const [ap, setAp] = useState(dream?.part_a_scores?.[0]?.awakening_pattern || '');
  const [notes, setNotes] = useState(dream?.part_a_scores?.[0]?.notes || '');
  const [saved, setSaved] = useState(false);

  if (!dream || !participant) {
    return <div className="empty-state">Dream not found.</div>;
  }

  const isTNS = study.mode === 'SDA-TNS';
  const ptcLinear = ptcCode ? linearizePTC(ptcCode) : 0;
  const ptcEntry = SDA_PTC_CODES.find(c => c.code === ptcCode);
  const partB = dream.part_b_scores?.[0];
  const existing = dream.part_a_scores?.[0];

  const toggleTM = (code: string) => {
    setTmMarkers(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev.filter(c => c !== 'TM-0'), code]
    );
  };

  const handleSave = () => {
    // In production: POST to Supabase part_a_scores
    console.log('Saving Part A:', {
      dream_id: dream.id, rater_id: 'clinician-1',
      ptc_code: ptcCode, ptc_linear: ptcLinear,
      ego_position: ep || null, narrative_arc: na || null,
      tm_markers: tmMarkers, fff_position: fff || null,
      repetition_fidelity: rf || null, awakening_pattern: ap || null,
      notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2>Score Dream — {participant.label} #{dream.sequence_num}</h2>

      <div className="split-pane">
        {/* LEFT: Dream Text */}
        <div>
          <div className="card">
            <h3>Dream Text</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {dream.word_count} words · {dream.dream_date || 'No date'}
            </p>
            <div style={{
              background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)',
              fontSize: '0.92rem', lineHeight: 1.7, maxHeight: 400, overflowY: 'auto',
            }}>
              {dream.dream_text}
            </div>
          </div>

          {partB && (
            <div className="card">
              <h3>Part B Self-Report</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Agency:</strong> {partB.agency}</div>
                <div><strong>Threat:</strong> {partB.threat}</div>
                <div><strong>Relational:</strong> {partB.relational}</div>
              </div>
            </div>
          )}

          {dream.self_codings?.[0] && (
            <div className="card">
              <h3>Participant Self-Coding</h3>
              <span className="badge badge-accent">
                {dream.self_codings[0].ptc_code} (Linear: {dream.self_codings[0].ptc_linear})
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Scoring Form */}
        <div>
          {/* PTC */}
          <div className="card">
            <h3>Pattern Type Code (PTC)</h3>
            <div className="form-group">
              <select
                value={ptcCode}
                onChange={e => { setPtcCode(e.target.value); if (isTNS) setFff(deriveFFF(e.target.value)); }}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="">Select PTC...</option>
                {SDA_PTC_CODES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label} ({c.desc})
                  </option>
                ))}
              </select>
            </div>
            {ptcEntry && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span className="badge badge-accent" style={{ fontSize: '1.1rem', padding: '0.3rem 0.75rem' }}>
                  {ptcCode}
                </span>
                <span style={{ fontSize: '0.85rem' }}>Linear: {ptcLinear} / 21</span>
              </div>
            )}
          </div>

          {/* EP */}
          <div className="card">
            <h3>Ego Position (EP)</h3>
            <div className="radio-group">
              {SDA_EGO_POSITIONS.map(e => (
                <label
                  key={e.code}
                  className={`radio-option ${ep === e.code ? 'selected' : ''}`}
                >
                  <input type="radio" name="ep" value={e.code} checked={ep === e.code}
                    onChange={() => setEp(e.code)} />
                  <div>
                    <div className="radio-label">EP-{e.code}: {e.label}</div>
                    <div className="radio-desc">{e.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* NA */}
          <div className="card">
            <h3>Narrative Arc (NA)</h3>
            <div className="radio-group">
              {SDA_NARRATIVE_ARCS.map(a => (
                <label
                  key={a.code}
                  className={`radio-option ${na === a.code ? 'selected' : ''}`}
                >
                  <input type="radio" name="na" value={a.code} checked={na === a.code}
                    onChange={() => setNa(a.code)} />
                  <div>
                    <div className="radio-label">NA-{a.code}: {a.label}</div>
                    <div className="radio-desc">{a.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* TM */}
          <div className="card">
            <h3>Transformative Markers (TM)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {SDA_TM_MARKERS.map(m => (
                <button
                  key={m.code}
                  className={`btn btn-sm ${tmMarkers.includes(m.code) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleTM(m.code)}
                  title={m.desc}
                >
                  {m.code.replace('TM-', '')} {m.label}
                </button>
              ))}
              <button
                className={`btn btn-sm ${tmMarkers.length === 0 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTmMarkers([])}
              >
                None
              </button>
            </div>
          </div>

          {/* TNS Extensions */}
          {isTNS && (
            <>
              <div className="card">
                <h3>Freeze-Flight-Fight (FFF)</h3>
                <div className="radio-group">
                  {SDA_FFF_POSITIONS.map(f => (
                    <label
                      key={f.code}
                      className={`radio-option ${fff === f.code ? 'selected' : ''}`}
                      style={{ borderLeftColor: f.color, borderLeftWidth: 3 }}
                    >
                      <input type="radio" name="fff" value={f.code} checked={fff === f.code}
                        onChange={() => setFff(f.code)} />
                      <div>
                        <div className="radio-label">{f.code}: {f.label}</div>
                        <div className="radio-desc">{f.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Repetition Fidelity (RF)</h3>
                <div className="form-group">
                  <select value={rf} onChange={e => setRf(Number(e.target.value) || '')}>
                    <option value="">Select...</option>
                    <option value="1">1 — Exact Replication</option>
                    <option value="2">2 — Minor Variation</option>
                    <option value="3">3 — Thematic Preservation</option>
                    <option value="4">4 — Thematic Echo</option>
                    <option value="5">5 — Substantially Transformed</option>
                  </select>
                </div>
              </div>

              <div className="card">
                <h3>Awakening Pattern (AP)</h3>
                <div className="radio-group">
                  {SDA_AWAKENING_PATTERNS.map(a => (
                    <label
                      key={a.code}
                      className={`radio-option ${ap === a.code ? 'selected' : ''}`}
                    >
                      <input type="radio" name="ap" value={a.code} checked={ap === a.code}
                        onChange={() => setAp(a.code)} />
                      <div>
                        <div className="radio-label">{a.code}: {a.label}</div>
                        <div className="radio-desc">{a.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="card">
            <h3>Clinical Notes</h3>
            <div className="form-group">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Secondary patterns, notable symbols, ambiguities..."
              />
            </div>
          </div>

          {/* Save */}
          <button
            className="btn btn-success"
            style={{ width: '100%', padding: '0.75rem' }}
            onClick={handleSave}
            disabled={!ptcCode}
          >
            {saved ? '✓ Saved' : existing ? 'Update Score' : 'Save Score'}
          </button>
        </div>
      </div>
    </div>
  );
}
