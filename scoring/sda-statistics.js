/**
 * SDA Statistics — Pure functions for series-level analysis
 * Spearman rho, Mann-Whitney U, Cohen's weighted kappa
 * No dependencies.
 */

/**
 * Spearman rank correlation coefficient.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {{ rho: number, n: number }}
 */
function spearmanRho(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return { rho: null, n };
  const rx = ranks(x.slice(0, n));
  const ry = ranks(y.slice(0, n));
  const dSq = rx.reduce((sum, r, i) => sum + (r - ry[i]) ** 2, 0);
  const rho = 1 - (6 * dSq) / (n * (n * n - 1));
  return { rho: Math.round(rho * 1000) / 1000, n };
}

/**
 * Compute Spearman rho of PTC linear scores against sequence number.
 * @param {number[]} ptcLinearScores - in sequence order
 * @returns {{ rho: number, n: number }}
 */
function ptcTrajectory(ptcLinearScores) {
  const seq = ptcLinearScores.map((_, i) => i + 1);
  return spearmanRho(seq, ptcLinearScores);
}

/**
 * Mean of first k vs last k scores, and difference.
 * @param {number[]} scores
 * @param {number} k - default 3
 * @returns {{ firstMean: number, lastMean: number, diff: number }|null}
 */
function firstLastDifference(scores, k = 3) {
  if (scores.length < k * 2) return null;
  const first = scores.slice(0, k);
  const last = scores.slice(-k);
  const firstMean = mean(first);
  const lastMean = mean(last);
  return {
    firstMean: round2(firstMean),
    lastMean: round2(lastMean),
    diff: round2(lastMean - firstMean),
  };
}

/**
 * Mann-Whitney U test (two-tailed).
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{ u: number, z: number }}
 */
function mannWhitneyU(a, b) {
  const n1 = a.length, n2 = b.length;
  if (n1 === 0 || n2 === 0) return { u: null, z: null };
  const combined = a.map(v => ({ v, g: 0 })).concat(b.map(v => ({ v, g: 1 })));
  combined.sort((x, y) => x.v - y.v);
  const r = ranks(combined.map(c => c.v));
  let r1 = 0;
  r.forEach((rank, i) => { if (combined[i].g === 0) r1 += rank; });
  const u1 = r1 - n1 * (n1 + 1) / 2;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);
  const mu = n1 * n2 / 2;
  const sigma = Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
  const z = sigma > 0 ? round2((u - mu) / sigma) : 0;
  return { u, z };
}

/**
 * Half-split comparison: first half vs second half of PTC series.
 * @param {number[]} scores
 * @returns {{ u: number, z: number, firstHalfMean: number, secondHalfMean: number }}
 */
function halfSplitComparison(scores) {
  const mid = Math.floor(scores.length / 2);
  const first = scores.slice(0, mid);
  const second = scores.slice(mid);
  const mwu = mannWhitneyU(first, second);
  return {
    ...mwu,
    firstHalfMean: round2(mean(first)),
    secondHalfMean: round2(mean(second)),
  };
}

/**
 * Dominant pattern type (modal type 1-6).
 * @param {string[]} ptcCodes
 * @returns {number}
 */
function dominantPattern(ptcCodes) {
  const counts = {};
  ptcCodes.forEach(code => {
    const type = parseInt(code.split('.')[0]);
    counts[type] = (counts[type] || 0) + 1;
  });
  let maxType = 1, maxCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) { maxCount = count; maxType = parseInt(type); }
  }
  return maxType;
}

/**
 * Find pattern shift point: dream index where dominant pattern in
 * remaining dreams differs from dominant in preceding dreams.
 * @param {string[]} ptcCodes
 * @returns {number|null} - 1-based dream number, or null if no shift
 */
function patternShiftPoint(ptcCodes) {
  if (ptcCodes.length < 4) return null;
  for (let i = 2; i < ptcCodes.length - 1; i++) {
    const before = dominantPattern(ptcCodes.slice(0, i));
    const after = dominantPattern(ptcCodes.slice(i));
    if (before !== after) return i + 1; // 1-based
  }
  return null;
}

/**
 * Cohen's weighted kappa for ordinal data (linear weights).
 * @param {number[]} rater1 - scores from rater 1
 * @param {number[]} rater2 - scores from rater 2
 * @returns {{ kappa: number, n: number }}
 */
function cohensWeightedKappa(rater1, rater2) {
  const n = Math.min(rater1.length, rater2.length);
  if (n < 2) return { kappa: null, n };
  const all = rater1.slice(0, n).concat(rater2.slice(0, n));
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  let po = 0, pe = 0;
  const freq1 = {}, freq2 = {};
  for (let i = 0; i < n; i++) {
    const w = 1 - Math.abs(rater1[i] - rater2[i]) / range;
    po += w;
    freq1[rater1[i]] = (freq1[rater1[i]] || 0) + 1;
    freq2[rater2[i]] = (freq2[rater2[i]] || 0) + 1;
  }
  po /= n;
  for (const v1 of Object.keys(freq1)) {
    for (const v2 of Object.keys(freq2)) {
      const w = 1 - Math.abs(parseInt(v1) - parseInt(v2)) / range;
      pe += w * (freq1[v1] / n) * (freq2[v2] / n);
    }
  }
  const kappa = pe < 1 ? (po - pe) / (1 - pe) : 1;
  return { kappa: round2(kappa), n };
}

// ---- Helpers ----

function ranks(values) {
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const r = new Array(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++;
    const avgRank = (i + j + 1) / 2; // 1-based average
    for (let k = i; k < j; k++) r[indexed[k].i] = avgRank;
    i = j;
  }
  return r;
}

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    spearmanRho, ptcTrajectory, firstLastDifference, mannWhitneyU,
    halfSplitComparison, dominantPattern, patternShiftPoint, cohensWeightedKappa,
  };
}
