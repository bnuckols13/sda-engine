import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  SDA_PTC_CODES, SDA_PATTERN_TYPES,
  ptcTrajectory, firstLastDifference, halfSplitComparison, dominantPattern, patternShiftPoint,
} from '../../lib/scoring-bridge';
import type { ParticipantWithDreams, Study } from '../../lib/types';

interface Props {
  participant: ParticipantWithDreams;
  study: Study;
}

export default function ParticipantView({ participant, study }: Props) {
  const dreams = participant.dreams;
  const scored = dreams.filter(d => d.part_a_scores?.length);

  // Chart data
  const chartData = dreams.map(d => {
    const pa = d.part_a_scores?.[0];
    const pb = d.part_b_scores?.[0];
    return {
      seq: d.sequence_num,
      date: d.dream_date || '',
      ptcLinear: pa?.ptc_linear || null,
      ptcCode: pa?.ptc_code || '',
      agency: pb?.agency || null,
      threat: pb?.threat || null,
    };
  });

  // Statistics
  const ptcScores = scored.map(d => d.part_a_scores![0].ptc_linear);
  const ptcCodes = scored.map(d => d.part_a_scores![0].ptc_code);
  const traj = ptcScores.length >= 3 ? ptcTrajectory(ptcScores) : null;
  const fl = ptcScores.length >= 6 ? firstLastDifference(ptcScores) : null;
  const hs = ptcScores.length >= 6 ? halfSplitComparison(ptcScores) : null;
  const dom = ptcCodes.length ? dominantPattern(ptcCodes) : null;
  const shift = ptcCodes.length >= 4 ? patternShiftPoint(ptcCodes) : null;
  const domLabel = dom ? SDA_PATTERN_TYPES.find(t => t.type === dom)?.label : '';

  return (
    <div>
      <h2>{participant.label} — Dream Series</h2>

      {/* Stats row */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="value">{dreams.length}</div>
          <div className="label">Dreams</div>
        </div>
        <div className="stat-box">
          <div className="value">{scored.length}</div>
          <div className="label">Scored</div>
        </div>
        {traj && (
          <div className="stat-box">
            <div className="value" style={{ color: traj.rho! > 0 ? 'var(--success)' : traj.rho! < 0 ? 'var(--warning)' : 'var(--accent)' }}>
              {traj.rho}
            </div>
            <div className="label">Trajectory (r<sub>s</sub>)</div>
          </div>
        )}
        {dom && (
          <div className="stat-box">
            <div className="value">Type {dom}</div>
            <div className="label">{domLabel}</div>
          </div>
        )}
        {fl && (
          <div className="stat-box">
            <div className="value" style={{ color: fl.diff > 0 ? 'var(--success)' : fl.diff < 0 ? 'var(--warning)' : 'var(--accent)' }}>
              {fl.diff > 0 ? '+' : ''}{fl.diff}
            </div>
            <div className="label">First 3 → Last 3</div>
          </div>
        )}
      </div>

      {/* PTC Trajectory Chart */}
      {scored.length >= 2 && (
        <div className="card">
          <h3>PTC Trajectory</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.filter(d => d.ptcLinear)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="seq" label={{ value: 'Dream #', position: 'insideBottom', offset: -5, fontSize: 12 }} />
              <YAxis domain={[0, 21]} ticks={[1, 6, 9, 14, 17, 21]}
                label={{ value: 'PTC Linear', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => {
                  const code = SDA_PTC_CODES.find(c => c.linear === value);
                  return code ? `${code.code} — ${code.label}` : value;
                }}
                labelFormatter={(seq) => `Dream #${seq}`}
              />
              {/* Pattern type boundaries */}
              <ReferenceLine y={1.5} stroke="#E2E8F0" strokeDasharray="2 2" />
              <ReferenceLine y={6.5} stroke="#E2E8F0" strokeDasharray="2 2" />
              <ReferenceLine y={9.5} stroke="#E2E8F0" strokeDasharray="2 2" />
              <ReferenceLine y={14.5} stroke="#E2E8F0" strokeDasharray="2 2" />
              <ReferenceLine y={17.5} stroke="#E2E8F0" strokeDasharray="2 2" />
              <Line type="monotone" dataKey="ptcLinear" stroke="#4A5568" strokeWidth={2}
                dot={{ fill: '#4A5568', r: 5 }} activeDot={{ r: 7 }} name="PTC" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0 1rem' }}>
            {SDA_PATTERN_TYPES.map(t => (
              <span key={t.type} style={{ color: t.color }}>T{t.type}: {t.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Part B Agency Trajectory */}
      {dreams.filter(d => d.part_b_scores?.[0]?.agency).length >= 2 && (
        <div className="card">
          <h3>Part B — Agency Score Trajectory</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData.filter(d => d.agency)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="seq" />
              <YAxis domain={[0, study.mode === 'SDA-TNS' ? 20 : 15]} />
              <Tooltip />
              <Line type="monotone" dataKey="agency" stroke="#2B6CB0" strokeWidth={2} dot={{ r: 4 }} name="Agency" />
              <Line type="monotone" dataKey="threat" stroke="#C53030" strokeWidth={2} dot={{ r: 4 }} name="Threat" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Series Statistics Detail */}
      {(fl || hs || shift) && (
        <div className="card">
          <h3>Series Statistics</h3>
          <table>
            <tbody>
              {traj && <tr><td>Spearman r<sub>s</sub></td><td><strong>{traj.rho}</strong> (n={traj.n})</td></tr>}
              {fl && (
                <>
                  <tr><td>First 3 mean PTC</td><td>{fl.firstMean}</td></tr>
                  <tr><td>Last 3 mean PTC</td><td>{fl.lastMean}</td></tr>
                  <tr><td>Difference</td><td style={{ color: fl.diff > 0 ? 'var(--success)' : 'var(--warning)' }}><strong>{fl.diff > 0 ? '+' : ''}{fl.diff}</strong></td></tr>
                </>
              )}
              {hs && <tr><td>Half-split (Mann-Whitney z)</td><td>{hs.z} (1st half mean: {hs.firstHalfMean}, 2nd: {hs.secondHalfMean})</td></tr>}
              {shift && <tr><td>Pattern shift point</td><td>Dream #{shift}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Dream Table */}
      <div className="card">
        <h3>All Dreams</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Words</th>
              <th>PTC</th>
              <th>Linear</th>
              <th>EP</th>
              <th>NA</th>
              <th>TM</th>
              <th>B-Agency</th>
              <th>B-Threat</th>
            </tr>
          </thead>
          <tbody>
            {dreams.map(d => {
              const pa = d.part_a_scores?.[0];
              const pb = d.part_b_scores?.[0];
              return (
                <tr key={d.id}>
                  <td>{d.sequence_num}</td>
                  <td>{d.dream_date || '—'}</td>
                  <td>{d.word_count}</td>
                  <td>{pa ? <span className="badge badge-accent">{pa.ptc_code}</span> : <span className="badge badge-warning">—</span>}</td>
                  <td>{pa?.ptc_linear || '—'}</td>
                  <td>{pa?.ego_position || '—'}</td>
                  <td>{pa?.narrative_arc || '—'}</td>
                  <td>{pa?.tm_markers.length || 0}</td>
                  <td>{pb?.agency ?? '—'}</td>
                  <td>{pb?.threat ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
