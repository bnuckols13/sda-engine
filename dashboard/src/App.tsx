import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { DEMO_STUDY, DEMO_PARTICIPANT, DEMO_PARTICIPANTS } from './lib/demo-data';
import DreamScorer from './components/Scoring/DreamScorer';
import ParticipantView from './components/Participant/ParticipantView';
import StudyDashboard from './components/Study/StudyDashboard';

export default function App() {
  const navigate = useNavigate();
  const study = DEMO_STUDY;
  const participants = DEMO_PARTICIPANTS;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>SDA Engine</h1>
        <p className="subtitle">Research Dashboard</p>

        <div className="section-label">Study</div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Overview
          </NavLink>
        </nav>

        <div className="section-label">Participants</div>
        <nav>
          {participants.map(p => (
            <NavLink
              key={p.id}
              to={`/participant/${p.id}`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {p.label || p.id.slice(0, 6)} — {p.dreams.length} dreams
            </NavLink>
          ))}
        </nav>

        <div className="section-label">Scoring</div>
        <nav>
          {participants.flatMap(p =>
            p.dreams
              .filter(d => !d.part_a_scores?.length)
              .map(d => (
                <NavLink
                  key={d.id}
                  to={`/score/${p.id}/${d.id}`}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {p.label} #{d.sequence_num} <span className="badge badge-warning" style={{ marginLeft: 4 }}>unscored</span>
                </NavLink>
              ))
          )}
          {participants.flatMap(p =>
            p.dreams
              .filter(d => d.part_a_scores?.length)
              .map(d => (
                <NavLink
                  key={d.id}
                  to={`/score/${p.id}/${d.id}`}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {p.label} #{d.sequence_num} <span className="badge badge-success" style={{ marginLeft: 4 }}>{d.part_a_scores![0].ptc_code}</span>
                </NavLink>
              ))
          )}
        </nav>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<StudyDashboard study={study} participants={participants} />} />
          <Route path="/participant/:id" element={
            <ParticipantView participant={DEMO_PARTICIPANT} study={study} />
          } />
          <Route path="/score/:participantId/:dreamId" element={
            <DreamScorer participants={participants} study={study} />
          } />
        </Routes>
      </main>
    </div>
  );
}
