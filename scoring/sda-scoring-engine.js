/**
 * SDA Scoring Engine — Pure functions
 * No dependencies. Works in browser and Node.
 */

/**
 * Linearize a PTC code string to its 1-21 score.
 * @param {string} code - e.g., '2.3', '4.5', '6.4'
 * @returns {number} Linear score 1-21, or -1 if invalid
 */
function linearizePTC(code) {
  const entry = SDA_PTC_CODES.find(c => c.code === code);
  return entry ? entry.linear : -1;
}

/**
 * Get PTC code from linear score.
 * @param {number} linear - 1-21
 * @returns {string|null}
 */
function ptcFromLinear(linear) {
  const entry = SDA_PTC_CODES.find(c => c.linear === linear);
  return entry ? entry.code : null;
}

/**
 * Get the pattern type (1-6) from a PTC code.
 * @param {string} code
 * @returns {number}
 */
function patternType(code) {
  const entry = SDA_PTC_CODES.find(c => c.code === code);
  return entry ? entry.type : -1;
}

/**
 * Derive FFF position from PTC code (for TNS mode).
 * @param {string} ptcCode
 * @returns {number} 1-6
 */
function deriveFFF(ptcCode) {
  const type = patternType(ptcCode);
  if (type >= 3) return 6; // Post-Threat
  const map = { '2.1': 1, '2.2': 2, '2.3': 3, '2.4': 4, '2.5': 5 };
  return map[ptcCode] || (type === 1 ? 1 : -1);
}

/**
 * Score Part B self-report responses.
 * @param {Object} responses - { 1: 3, 2: 5, ... } item number to Likert value
 * @param {string} mode - 'SDA-SI' or 'SDA-TNS'
 * @returns {Object} Subscale scores
 */
function scorePartB(responses, mode) {
  const subscaleDefs = SDA_SUBSCALES[mode] || SDA_SUBSCALES['SDA-SI'];
  const result = {};
  for (const [name, def] of Object.entries(subscaleDefs)) {
    const values = def.items.map(i => responses[i]).filter(v => v != null);
    result[name] = values.length === def.items.length
      ? values.reduce((a, b) => a + b, 0)
      : null; // incomplete
  }
  return result;
}

/**
 * Count words in dream text.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Check if dream text meets minimum word count.
 * @param {string} text
 * @param {number} minimum - default 50
 * @returns {boolean}
 */
function isScoreable(text, minimum = 50) {
  return countWords(text) >= minimum;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    linearizePTC, ptcFromLinear, patternType, deriveFFF,
    scorePartB, countWords, isScoreable,
  };
}
