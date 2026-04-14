/**
 * SDA Participant App — Main Controller
 * Vanilla JS, no build step, mobile-first
 */

(function () {
  'use strict';

  // ---- Config ----
  const SUPABASE_URL = 'https://oxabwsnqfqeyrpgjwnde.supabase.co';
  const SUPABASE_ANON_KEY = ''; // Set before deployment
  const MIN_WORDS = 50;

  // ---- State ----
  let supabase = null;
  let participant = null;
  let study = null;
  let dreams = [];
  let currentDream = {}; // in-progress dream entry
  let partBResponses = {};
  let selfCodingResult = null;

  // ---- Init ----
  async function init() {
    const token = new URLSearchParams(window.location.search).get('t');
    if (!token) return showScreen('invalid');

    if (!SUPABASE_ANON_KEY) {
      // Dev mode: no Supabase, use localStorage
      console.warn('No Supabase key — running in local-only mode');
      initLocalMode(token);
      return;
    }

    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { 'x-participant-token': token } },
      });

      const { data: p, error } = await supabase
        .from('participants')
        .select('*, studies(*)')
        .eq('token', token)
        .single();

      if (error || !p) return showScreen('invalid');

      participant = p;
      study = p.studies;
      await loadDreams();

      if (!participant.consented_at) {
        showConsent();
      } else {
        showJournal();
      }
    } catch (e) {
      console.error('Init error:', e);
      showScreen('invalid');
    }
  }

  function initLocalMode(token) {
    // Offline / dev fallback using localStorage
    const stored = localStorage.getItem('sda-participant-' + token);
    if (stored) {
      const data = JSON.parse(stored);
      participant = data.participant;
      study = data.study;
      dreams = data.dreams || [];
    } else {
      participant = { id: token, token, consented_at: null, label: 'local' };
      study = { id: 'local', name: 'Local Development Study', mode: 'SDA-SI' };
      dreams = [];
    }

    if (!participant.consented_at) {
      showConsent();
    } else {
      showJournal();
    }
  }

  function saveLocal() {
    if (!participant) return;
    localStorage.setItem('sda-participant-' + participant.token, JSON.stringify({
      participant, study, dreams,
    }));
  }

  // ---- Screen Management ----
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
  }

  // ---- Consent ----
  function showConsent() {
    document.getElementById('consent-study-name').textContent = study.name;
    showScreen('consent');
  }

  document.getElementById('consent-checkbox').addEventListener('change', function () {
    document.getElementById('consent-btn').disabled = !this.checked;
  });

  document.getElementById('consent-btn').addEventListener('click', async function () {
    participant.consented_at = new Date().toISOString();
    if (supabase) {
      await supabase.from('participants').update({ consented_at: participant.consented_at }).eq('id', participant.id);
    }
    saveLocal();
    showJournal();
  });

  // ---- Journal ----
  async function loadDreams() {
    if (!supabase) return;
    const { data } = await supabase
      .from('dreams')
      .select('*, part_b_scores(*), self_codings(*)')
      .eq('participant_id', participant.id)
      .order('sequence_num', { ascending: true });
    dreams = data || [];
  }

  function showJournal() {
    renderDreamList();
    showScreen('journal');
  }

  function renderDreamList() {
    const list = document.getElementById('dream-list');
    const noDreams = document.getElementById('no-dreams');
    const countEl = document.getElementById('dream-count');
    const trajBtn = document.getElementById('view-trajectory-btn');

    if (dreams.length === 0) {
      list.innerHTML = '';
      noDreams.style.display = 'block';
      trajBtn.style.display = 'none';
      countEl.textContent = '';
      return;
    }

    noDreams.style.display = 'none';
    countEl.textContent = dreams.length + ' dream' + (dreams.length !== 1 ? 's' : '');
    trajBtn.style.display = dreams.length >= 3 ? 'block' : 'none';

    list.innerHTML = dreams.map(d => {
      const excerpt = d.dream_text.substring(0, 60) + (d.dream_text.length > 60 ? '...' : '');
      const dateStr = d.dream_date || '';
      const partB = d.part_b_scores?.[0] || d.part_b_scores;
      const agency = partB?.agency;
      return `
        <div class="dream-item" data-id="${d.id}">
          <div class="dream-num">${d.sequence_num}</div>
          <div class="dream-preview">
            <div class="date">${dateStr}</div>
            <div class="excerpt">${escapeHtml(excerpt)}</div>
          </div>
          ${agency != null ? `<div class="dream-scores"><span class="score-badge">A:${agency}</span></div>` : ''}
        </div>`;
    }).join('');
  }

  document.getElementById('new-dream-btn').addEventListener('click', function () {
    currentDream = {};
    partBResponses = {};
    selfCodingResult = null;
    document.getElementById('dream-text').value = '';
    document.getElementById('dream-date').value = new Date().toISOString().split('T')[0];
    updateWordCount();
    showScreen('entry');
    document.getElementById('dream-text').focus();
  });

  document.getElementById('view-trajectory-btn').addEventListener('click', showTrajectory);

  // ---- Dream Entry ----
  const dreamText = document.getElementById('dream-text');
  const wordCountEl = document.getElementById('word-count');
  const entryNextBtn = document.getElementById('entry-next-btn');

  dreamText.addEventListener('input', updateWordCount);

  function updateWordCount() {
    const count = countWords(dreamText.value);
    wordCountEl.textContent = count + ' words' + (count < MIN_WORDS ? ` (minimum ${MIN_WORDS})` : '');
    wordCountEl.className = 'word-count ' + (count < MIN_WORDS ? 'low' : 'ok');
    entryNextBtn.disabled = count < MIN_WORDS;
  }

  document.getElementById('entry-back-btn').addEventListener('click', showJournal);

  document.getElementById('entry-next-btn').addEventListener('click', function () {
    currentDream.text = dreamText.value;
    currentDream.date = document.getElementById('dream-date').value;
    currentDream.wordCount = countWords(dreamText.value);
    showPartB();
  });

  // ---- Part B ----
  function showPartB() {
    const items = SDA_PART_B_ITEMS.core.slice();
    if (study.mode === 'SDA-TNS') items.push(...SDA_PART_B_ITEMS.trauma);

    const container = document.getElementById('partb-items');
    container.innerHTML = items.map(item => `
      <div class="likert-item">
        <div class="likert-text">${item.num}. ${item.text}</div>
        <div class="likert-options">
          ${SDA_LIKERT_ANCHORS.map(a => `
            <div class="likert-option">
              <input type="radio" name="partb-${item.num}" id="partb-${item.num}-${a.value}" value="${a.value}">
              <label for="partb-${item.num}-${a.value}">${a.value}<br><span style="font-size:0.65rem;">${a.label}</span></label>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Restore any prior selections
    for (const [num, val] of Object.entries(partBResponses)) {
      const radio = document.getElementById(`partb-${num}-${val}`);
      if (radio) radio.checked = true;
    }

    updatePartBComplete();
    showScreen('partb');
  }

  document.getElementById('partb-items').addEventListener('change', function (e) {
    if (e.target.type === 'radio') {
      const num = parseInt(e.target.name.split('-')[1]);
      partBResponses[num] = parseInt(e.target.value);
      updatePartBComplete();
    }
  });

  function updatePartBComplete() {
    const items = SDA_PART_B_ITEMS.core.slice();
    if (study.mode === 'SDA-TNS') items.push(...SDA_PART_B_ITEMS.trauma);
    const allAnswered = items.every(item => partBResponses[item.num] != null);
    document.getElementById('partb-next-btn').disabled = !allAnswered;
  }

  document.getElementById('partb-back-btn').addEventListener('click', function () {
    showScreen('entry');
  });

  document.getElementById('partb-next-btn').addEventListener('click', function () {
    showSelfCoding();
  });

  // ---- Self-Coding (Decision Tree) ----
  function showSelfCoding() {
    selfCodingResult = null;
    document.getElementById('selfcode-save-btn').style.display = 'none';
    renderTreeNode(SDA_DECISION_TREE);
    showScreen('selfcode');
  }

  function renderTreeNode(node) {
    const container = document.getElementById('tree-container');
    container.innerHTML = `
      <div class="tree-step">
        <div class="question">${node.question}</div>
        ${node.hint ? `<div class="hint">${node.hint}</div>` : ''}
        ${node.branches.map((b, i) => `
          <button class="tree-branch" data-index="${i}">${b.label}</button>
        `).join('')}
      </div>`;

    container.querySelectorAll('.tree-branch').forEach(btn => {
      btn.addEventListener('click', function () {
        const branch = node.branches[parseInt(this.dataset.index)];
        if (branch.result) {
          showTreeResult(branch.result);
        } else if (branch.node) {
          renderTreeNode(branch.node);
        }
      });
    });
  }

  function showTreeResult(result) {
    selfCodingResult = result;
    const container = document.getElementById('tree-container');
    container.innerHTML = `
      <div class="tree-result">
        <div class="code">${result.code}</div>
        <div class="label">${result.label}</div>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.75rem;">
          This is how you classified your dream's structure. A researcher will also score your dream independently.
        </p>
      </div>
      <button class="btn btn-secondary" id="tree-redo" style="margin-top:0.5rem;">Redo Classification</button>`;

    document.getElementById('tree-redo').addEventListener('click', function () {
      selfCodingResult = null;
      document.getElementById('selfcode-save-btn').style.display = 'none';
      renderTreeNode(SDA_DECISION_TREE);
    });

    document.getElementById('selfcode-save-btn').style.display = 'block';
  }

  document.getElementById('selfcode-skip-btn').addEventListener('click', saveDream);
  document.getElementById('selfcode-save-btn').addEventListener('click', saveDream);

  // ---- Save Dream ----
  async function saveDream() {
    const seqNum = dreams.length + 1;
    const partBScores = scorePartB(partBResponses, study.mode);

    if (supabase) {
      try {
        // Insert dream
        const { data: dream, error: dErr } = await supabase.from('dreams').insert({
          participant_id: participant.id,
          sequence_num: seqNum,
          dream_text: currentDream.text,
          word_count: currentDream.wordCount,
          dream_date: currentDream.date || null,
        }).select().single();

        if (dErr) throw dErr;

        // Insert Part B
        await supabase.from('part_b_scores').insert({
          dream_id: dream.id,
          responses: partBResponses,
          ...partBScores,
        });

        // Insert self-coding if done
        if (selfCodingResult) {
          await supabase.from('self_codings').insert({
            dream_id: dream.id,
            ptc_code: selfCodingResult.code,
            ptc_linear: linearizePTC(selfCodingResult.code),
          });
        }

        // Reload dreams
        await loadDreams();
      } catch (e) {
        console.error('Save error:', e);
        // Fall back to local
        saveDreamLocal(seqNum, partBScores);
      }
    } else {
      saveDreamLocal(seqNum, partBScores);
    }

    showSaved(seqNum, partBScores);
  }

  function saveDreamLocal(seqNum, partBScores) {
    const dream = {
      id: 'local-' + Date.now(),
      participant_id: participant.id,
      sequence_num: seqNum,
      dream_text: currentDream.text,
      word_count: currentDream.wordCount,
      dream_date: currentDream.date,
      part_b_scores: { responses: partBResponses, ...partBScores },
      self_codings: selfCodingResult ? [{ ptc_code: selfCodingResult.code, ptc_linear: linearizePTC(selfCodingResult.code) }] : [],
    };
    dreams.push(dream);
    saveLocal();
  }

  function showSaved(seqNum, scores) {
    document.getElementById('saved-summary').textContent =
      `Dream #${seqNum} recorded (${currentDream.wordCount} words)`;

    const scoresHtml = [];
    if (scores.agency != null) scoresHtml.push(`Agency: ${scores.agency}`);
    if (scores.threat != null) scoresHtml.push(`Threat: ${scores.threat}`);
    if (selfCodingResult) scoresHtml.push(`Self-coding: ${selfCodingResult.code} (${selfCodingResult.label})`);

    document.getElementById('saved-scores').innerHTML = scoresHtml.length
      ? `<p style="font-size:0.85rem; color:var(--text-secondary);">${scoresHtml.join(' &middot; ')}</p>`
      : '';

    showScreen('saved');
  }

  document.getElementById('saved-journal-btn').addEventListener('click', showJournal);

  // ---- Trajectory ----
  function showTrajectory() {
    const canvas = document.getElementById('trajectory-canvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 250 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '250px';
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 250;
    const pad = { top: 20, right: 20, bottom: 40, left: 45 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Extract agency scores
    const data = dreams.map(d => {
      const pb = d.part_b_scores?.[0] || d.part_b_scores;
      return { seq: d.sequence_num, agency: pb?.agency };
    }).filter(d => d.agency != null);

    if (data.length < 2) {
      ctx.fillStyle = '#57534E';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Need at least 2 scored dreams for trajectory', w / 2, h / 2);
      showScreen('trajectory');
      return;
    }

    const maxSeq = Math.max(...data.map(d => d.seq));
    const maxAgency = study.mode === 'SDA-TNS' ? 20 : 15;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + plotH - (i / 5) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = '#57534E';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / 5) * maxAgency), pad.left - 8, y + 4);
    }

    // X axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#57534E';
    data.forEach(d => {
      const x = pad.left + ((d.seq - 1) / (maxSeq - 1 || 1)) * plotW;
      ctx.fillText(d.seq, x, h - pad.bottom + 20);
    });
    ctx.fillText('Dream #', w / 2, h - 5);

    // Y axis label
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Agency Score', 0, 0);
    ctx.restore();

    // Line
    ctx.strokeStyle = '#4A5568';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = pad.left + ((d.seq - 1) / (maxSeq - 1 || 1)) * plotW;
      const y = pad.top + plotH - (d.agency / maxAgency) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    data.forEach(d => {
      const x = pad.left + ((d.seq - 1) / (maxSeq - 1 || 1)) * plotW;
      const y = pad.top + plotH - (d.agency / maxAgency) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#4A5568';
      ctx.fill();
      ctx.strokeStyle = '#FAFAF7';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Stats
    const agencyScores = data.map(d => d.agency);
    const statsEl = document.getElementById('trajectory-stats');
    if (data.length >= 5) {
      const traj = ptcTrajectory(agencyScores);
      const fl = firstLastDifference(agencyScores);
      statsEl.style.display = 'block';
      statsEl.innerHTML = `
        <h3>Summary Statistics</h3>
        <p style="font-size:0.88rem;"><strong>Trend (Spearman r):</strong> ${traj.rho != null ? traj.rho : 'N/A'} (${traj.rho > 0.3 ? 'upward trend' : traj.rho < -0.3 ? 'downward trend' : 'no clear trend'})</p>
        ${fl ? `<p style="font-size:0.88rem;"><strong>First 3 mean:</strong> ${fl.firstMean} &rarr; <strong>Last 3 mean:</strong> ${fl.lastMean} (change: ${fl.diff > 0 ? '+' : ''}${fl.diff})</p>` : ''}
        <p style="font-size:0.88rem;"><strong>Dreams recorded:</strong> ${data.length}</p>`;
    } else {
      statsEl.style.display = 'none';
    }

    showScreen('trajectory');
  }

  document.getElementById('trajectory-back-btn').addEventListener('click', showJournal);

  // ---- Utilities ----
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Start ----
  document.addEventListener('DOMContentLoaded', init);
})();
