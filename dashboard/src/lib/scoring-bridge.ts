// Load vanilla scoring engine via ?raw import
// @ts-ignore
import scoringDataRaw from '../../../scoring/sda-scoring-data.js?raw';
// @ts-ignore
import scoringEngineRaw from '../../../scoring/sda-scoring-engine.js?raw';
// @ts-ignore
import statisticsRaw from '../../../scoring/sda-statistics.js?raw';
// @ts-ignore
import decisionTreeRaw from '../../../scoring/decision-tree-data.js?raw';

// Strip module.exports blocks (not needed in browser scope) and evaluate all in one shared context
function stripModuleExports(code: string): string {
  return code.replace(/if\s*\(typeof module[\s\S]*?module\.exports[\s\S]*?\}\s*\}/, '');
}

const allCode = [scoringDataRaw, scoringEngineRaw, statisticsRaw, decisionTreeRaw]
  .map(stripModuleExports)
  .join('\n;\n');

// Evaluate everything in one function scope; return references via a collector object
const collector: Record<string, unknown> = {};
const wrappedCode = allCode + `
;Object.assign(__collector, {
  SDA_PTC_CODES, SDA_PATTERN_TYPES, SDA_EGO_POSITIONS, SDA_NARRATIVE_ARCS,
  SDA_TM_MARKERS, SDA_FFF_POSITIONS, SDA_AWAKENING_PATTERNS,
  SDA_PART_B_ITEMS, SDA_LIKERT_ANCHORS, SDA_SUBSCALES, SDA_DECISION_TREE,
  linearizePTC, ptcFromLinear, patternType, deriveFFF, scorePartB, countWords, isScoreable,
  spearmanRho, ptcTrajectory, firstLastDifference, mannWhitneyU,
  halfSplitComparison, dominantPattern, patternShiftPoint, cohensWeightedKappa,
});`;

new Function('__collector', wrappedCode)(collector);

// Export typed references
export const SDA_PTC_CODES = collector.SDA_PTC_CODES as Array<{
  code: string; linear: number; type: number; label: string; desc: string;
}>;
export const SDA_PATTERN_TYPES = collector.SDA_PATTERN_TYPES as Array<{
  type: number; label: string; color: string; question: string;
}>;
export const SDA_EGO_POSITIONS = collector.SDA_EGO_POSITIONS as Array<{
  code: number; label: string; desc: string;
}>;
export const SDA_NARRATIVE_ARCS = collector.SDA_NARRATIVE_ARCS as Array<{
  code: number; label: string; desc: string;
}>;
export const SDA_TM_MARKERS = collector.SDA_TM_MARKERS as Array<{
  code: string; label: string; desc: string;
}>;
export const SDA_FFF_POSITIONS = collector.SDA_FFF_POSITIONS as Array<{
  code: number; label: string; ptc: string; desc: string; color: string;
}>;
export const SDA_AWAKENING_PATTERNS = collector.SDA_AWAKENING_PATTERNS as Array<{
  code: string; label: string; desc: string;
}>;
export const SDA_DECISION_TREE = collector.SDA_DECISION_TREE as unknown;

export const linearizePTC = collector.linearizePTC as (code: string) => number;
export const ptcFromLinear = collector.ptcFromLinear as (linear: number) => string | null;
export const deriveFFF = collector.deriveFFF as (code: string) => number;
export const scorePartB = collector.scorePartB as (responses: Record<number, number>, mode: string) => Record<string, number | null>;
export const spearmanRho = collector.spearmanRho as (x: number[], y: number[]) => { rho: number | null; n: number };
export const ptcTrajectory = collector.ptcTrajectory as (scores: number[]) => { rho: number | null; n: number };
export const firstLastDifference = collector.firstLastDifference as (scores: number[], k?: number) => { firstMean: number; lastMean: number; diff: number } | null;
export const halfSplitComparison = collector.halfSplitComparison as (scores: number[]) => { u: number | null; z: number | null; firstHalfMean: number; secondHalfMean: number };
export const dominantPattern = collector.dominantPattern as (codes: string[]) => number;
export const patternShiftPoint = collector.patternShiftPoint as (codes: string[]) => number | null;
export const cohensWeightedKappa = collector.cohensWeightedKappa as (r1: number[], r2: number[]) => { kappa: number | null; n: number };
