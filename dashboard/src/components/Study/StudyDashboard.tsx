import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ErrorBar,
} from 'recharts';
import {
  SDA_PATTERN_TYPES,
  ptcTrajectory, firstLastDifference, cohensWeightedKappa,
} from '../../lib/scoring-bridge';
import { exportStudyCSV, downloadCSV } from '../../lib/csv-export';
import type { Study, ParticipantWithDreams } from '../../lib/types';

interface Props {
  study: Study;
  participants: ParticipantWithDreams[];
}

export default function StudyDashboard({ study, participants }: Props) {
  const totalDreams = participants.reduce((n, p) => n + p.dreams.length, 0);
  const scoredDreams = participants.reduce((n, p) =>
    n + p.dreams.filter(d => d.part_a_scores?.length).length, 0);
  const consentedCount = participants.filter(p => p.consented_at).length;

  // Group trajectory: mean PTC at each sequence position
  const maxSeq = Math.max(...participants.flatMap(p => p.dreams.map(d => d.sequence_num)), 0);
  const groupData: { seq: number; mean: number; se: number; n: number }[] = [];
  for (let seq = 1; seq <= maxSeq; seq++) {
    const scores: number[] = [];
    for (const p of participants) {
      const d = p.dreams.find(d => d.sequence_num === seq);
      const pa = d?.part_a_scores?.[0];
      if (pa) scores.push(pa.ptc_linear);
    }
    if (scores.length > 0) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.length > 1
        ? scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / (scores.length - 1)
        : 0;
      const se = Math.sqrt(variance / scores.length);
      groupData.push({
        seq,
        mean: Math.round(mean * 100) / 100,
        se: Math.round(se * 100) / 100,
        n: scores.length,
      });
    }
  }

  // Pre-post for each participant
  const prePostData = participants.map(p => {
    const scores = p.dreams
      .filter(d => d.part_a_scores?.length)
      .map(d => d.part_a_scores![0].ptc_linear);
    const fl = scores.length >= 6 ? firstLastDifference(scores) : null;
    const traj = scores.length >= 3 ? ptcTrajectory(scores) : null;
    return { label: p.label, n: scores.length, traj, fl };
  });

  // Inter-rater reliability (find dreams with 2+ raters)
  const dualRated = participants.flatMap(p =>
    p.dreams.filter(d => (d.part_a_scores?.length || 0) >= 2)
  );
  let kappaResult: { kappa: number | null; n: number } | null = null;
  if (dualRated.length >= 2) {
    const r1 = dualRated.map(d => d.part_a_scores![0].ptc_linear);
    const r2 = dualRated.map(d => d.part_a_scores![1].ptc_linear);
    kappaResult = cohensWeightedKappa(r1, r2);
  }

  const handleExport = () => {
    const csv = exportStudyCSV(participants, study.name);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `sda-${study.mode.toLowerCase()}-${dateStr}.csv`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>{study.name}</h2>
          <span className="badge badge-accent">{study.mode}</span>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
      </div>

      {/* Overview stats */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="value">{consentedCount}</div>
          <div className="label">Participants</div>
        </div>
        <div className="stat-box">
          <div className="value">{totalDreams}</div>
          <div className="label">Dreams</div>
        </div>
        <div className="stat-box">
          <div className="value">{scoredDreams}</div>
          <div className="label">Scored</div>
        </div>
        <div className="stat-box">
          <div className="value">{totalDreams && consentedCount ? (totalDreams / consentedCount).toFixed(1) : 0}</div>
          <div className="label">Mean Dreams/Participant</div>
        </div>
        {kappaResult && (
          <div className="stat-box">
            <div className="value">{kappaResult.kappa}</div>
            <div className="label">Weighted κ (n={kappaResult.n})</div>
          </div>
        )}
      </div>

      {/* Group Trajectory */}
      {groupData.length >= 2 && (
        <div className="card">
          <h3>Group PTC Trajectory (Mean ± SE)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="seq" label={{ value: 'Dream #', position: 'insideBottom', offset: -5, fontSize: 12 }} />
              <YAxis domain={[0, 21]} ticks={[1, 6, 9, 14, 17, 21]}
                label={{ value: 'Mean PTC', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => value.toFixed(2)}
                labelFormatter={(seq) => `Dream #${seq} (n=${groupData.find(d => d.seq === seq)?.n || ''})`}
              />
              <Line type="monotone" dataKey="mean" stroke="#4A5568" strokeWidth={2}
                dot={{ fill: '#4A5568', r: 5 }} name="Mean PTC">
              </Line>
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0 1rem' }}>
            {SDA_PATTERN_TYPES.map(t => (
              <span key={t.type} style={{ color: t.color }}>T{t.type}: {t.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Post Comparison */}
      <div className="card">
        <h3>Pre-Post Comparison (First 3 vs Last 3 Mean PTC)</h3>
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Dreams Scored</th>
              <th>Trajectory r<sub>s</sub></th>
              <th>First 3 Mean</th>
              <th>Last 3 Mean</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {prePostData.map(pp => (
              <tr key={pp.label}>
                <td><strong>{pp.label}</strong></td>
                <td>{pp.n}</td>
                <td>{pp.traj?.rho ?? '—'}</td>
                <td>{pp.fl?.firstMean ?? '—'}</td>
                <td>{pp.fl?.lastMean ?? '—'}</td>
                <td style={{
                  color: pp.fl ? (pp.fl.diff > 0 ? 'var(--success)' : pp.fl.diff < 0 ? 'var(--warning)' : 'inherit') : 'inherit',
                  fontWeight: pp.fl ? 700 : 400,
                }}>
                  {pp.fl ? `${pp.fl.diff > 0 ? '+' : ''}${pp.fl.diff}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prePostData.every(pp => !pp.fl) && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Pre-post comparison requires at least 6 scored dreams per participant.
          </p>
        )}
      </div>

      {/* Participant Summary */}
      <div className="card">
        <h3>Participant Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Consented</th>
              <th>Dreams</th>
              <th>Scored</th>
              <th>Last Dream</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => {
              const lastDream = p.dreams[p.dreams.length - 1];
              return (
                <tr key={p.id}>
                  <td><strong>{p.label}</strong></td>
                  <td>{p.consented_at ? '✓' : '—'}</td>
                  <td>{p.dreams.length}</td>
                  <td>{p.dreams.filter(d => d.part_a_scores?.length).length}</td>
                  <td>{lastDream?.dream_date || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
