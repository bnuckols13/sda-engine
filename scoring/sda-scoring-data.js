/**
 * SDA Scoring Data — Immutable configuration
 * Pattern Type Codes, Part B items, decision tree structure
 */

const SDA_PTC_CODES = [
  { code: '1.0', linear: 1,  type: 1, label: 'No Dream Ego',          desc: 'Dream ego absent; observing like a film' },
  { code: '2.1', linear: 2,  type: 2, label: 'Threatened — Destroyed', desc: 'Ego destroyed, dismembered, killed' },
  { code: '2.2', linear: 3,  type: 2, label: 'Threatened — Overwhelmed', desc: 'Ego overwhelmed, completely powerless, no strategy' },
  { code: '2.3', linear: 4,  type: 2, label: 'Threatened — Flees',     desc: 'Ego flees from threat' },
  { code: '2.4', linear: 5,  type: 2, label: 'Threatened — Resists',   desc: 'Ego resists but threat persists' },
  { code: '2.5', linear: 6,  type: 2, label: 'Threatened — Overcomes', desc: 'Ego successfully resists threat' },
  { code: '3.1', linear: 7,  type: 3, label: 'Performance — Fails',    desc: 'Ego fails the demand; subjected to external control' },
  { code: '3.2', linear: 8,  type: 3, label: 'Performance — Blocked',  desc: 'Ego prepared but encounters obstacles; task unsolved' },
  { code: '3.3', linear: 9,  type: 3, label: 'Performance — Masters',  desc: 'Ego masters the demand through own activity' },
  { code: '4.1', linear: 10, type: 4, label: 'Mobility — Locked In',   desc: 'Locked in, tries to escape, fails' },
  { code: '4.2', linear: 11, type: 4, label: 'Mobility — No Means',    desc: 'Wants to move but lacks means (misses the train)' },
  { code: '4.3', linear: 12, type: 4, label: 'Mobility — Obstructed',  desc: 'Moves successfully, encounters obstacle, cannot continue' },
  { code: '4.4', linear: 13, type: 4, label: 'Mobility — Incomplete',  desc: 'In motion, encounters obstacles, goal not reached' },
  { code: '4.5', linear: 14, type: 4, label: 'Mobility — Arrives',     desc: 'Reaches desired destination successfully' },
  { code: '5.1', linear: 15, type: 5, label: 'Social — Ignored',       desc: 'Wants contact but is ignored' },
  { code: '5.2', linear: 16, type: 5, label: 'Social — Blocked',       desc: 'Makes contact, encounters obstacles, contact fails' },
  { code: '5.3', linear: 17, type: 5, label: 'Social — Connects',      desc: 'Establishes desired contact successfully' },
  { code: '6.1', linear: 18, type: 6, label: 'Autonomy — Flooded',     desc: 'Flooded by others\' affection' },
  { code: '6.2', linear: 19, type: 6, label: 'Autonomy — Separates',   desc: 'Aggressive toward others; will to separate/be independent' },
  { code: '6.3', linear: 20, type: 6, label: 'Autonomy — Content',     desc: 'Alone and content' },
  { code: '6.4', linear: 21, type: 6, label: 'Autonomy — Helps',       desc: 'Helps others from abundance of resources, on own initiative' },
];

const SDA_PATTERN_TYPES = [
  { type: 1, label: 'No Dream Ego',      color: '#c53030', question: 'Is the dream ego present in the dream?' },
  { type: 2, label: 'Threatened',         color: '#c05621', question: 'Is the dream ego being threatened or pursued?' },
  { type: 3, label: 'Performance Demand', color: '#b7791f', question: 'Is the dream ego facing a task or demand imposed by others?' },
  { type: 4, label: 'Mobility',           color: '#2f855a', question: 'Is the dream ego trying to get somewhere or move?' },
  { type: 5, label: 'Social Interaction', color: '#2b6cb0', question: 'Is the dream ego trying to connect with someone?' },
  { type: 6, label: 'Autonomy',           color: '#6b46c1', question: 'Is the dream ego dealing with independence, separation, or self-sufficiency?' },
];

const SDA_EGO_POSITIONS = [
  { code: 1, label: 'Full Initiative',     desc: 'Ego drives all events throughout. Others react to the ego.' },
  { code: 2, label: 'No Initiative',       desc: 'Things happen to the ego throughout. Ego is object, never agent.' },
  { code: 3, label: 'Lost Initiative',     desc: 'Ego starts active, then loses control. Dream ends with ego passive.' },
  { code: 4, label: 'Regained Initiative', desc: 'U-shaped: ego acts, loses control, then reasserts agency before end.' },
  { code: 5, label: 'Embedded',            desc: 'Ego has moments of action within a narrative driven by others.' },
];

const SDA_NARRATIVE_ARCS = [
  { code: 1, label: 'Static / Fragmented', desc: 'No recognizable development; scene or disconnected images.' },
  { code: 2, label: 'Decline',             desc: 'Situation deteriorates; ends worse than it began.' },
  { code: 3, label: 'Failed Attempt',      desc: 'Ego engages a problem but fails to resolve it.' },
  { code: 4, label: 'Recovery',            desc: 'Situation deteriorates then recovers; returns to baseline or better.' },
  { code: 5, label: 'Ascent',              desc: 'Progressive development toward a positive outcome.' },
];

const SDA_TM_MARKERS = [
  { code: 'TM-C', label: 'Child/Infant',       desc: 'Baby or young child appears, especially needing care from dream ego.' },
  { code: 'TM-H', label: 'Helper Figure',       desc: 'A figure provides guidance or support without being sought.' },
  { code: 'TM-P', label: 'Passage/Transition',  desc: 'Ego moves through a narrow space and emerges into a different scene.' },
  { code: 'TM-L', label: 'Celebration/Liberation', desc: 'Dancing, celebration, or expressed sense of freedom.' },
  { code: 'TM-F', label: 'Figure Transformation', desc: 'A threatening figure transforms into something benign or helpful.' },
];

const SDA_FFF_POSITIONS = [
  { code: 1, label: 'Annihilation',      ptc: '2.1', desc: 'Ego destroyed. System collapse.', color: '#c53030' },
  { code: 2, label: 'Freeze',            ptc: '2.2', desc: 'Ego present but paralyzed. Cannot act.', color: '#c05621' },
  { code: 3, label: 'Flight',            ptc: '2.3', desc: 'Motor reactivation. Running, hiding.', color: '#b7791f' },
  { code: 4, label: 'Fight (unsuccessful)', ptc: '2.4', desc: 'Active resistance. Threat persists.', color: '#2f855a' },
  { code: 5, label: 'Fight (successful)',   ptc: '2.5', desc: 'Mastery. Ego overcomes the threat.', color: '#2b6cb0' },
  { code: 6, label: 'Post-Threat',         ptc: '3+',  desc: 'Beyond threat. Types 3-6.', color: '#6b46c1' },
];

const SDA_AWAKENING_PATTERNS = [
  { code: 'AP-1', label: 'Distressed Awakening', desc: 'Woke abruptly with fear, sweating, racing heart' },
  { code: 'AP-2', label: 'Alert Awakening',      desc: 'Woke abruptly but without significant distress' },
  { code: 'AP-3', label: 'Natural Transition',   desc: 'Dream faded into waking or shifted to another dream' },
  { code: 'AP-4', label: 'Dream Completion',     desc: 'Dream reached a natural narrative endpoint' },
];

const SDA_PART_B_ITEMS = {
  // Core items (SDA-SI, items 1-8)
  core: [
    { num: 1, text: 'In this dream, I felt I could make choices or decisions.', subscale: 'agency' },
    { num: 2, text: 'In this dream, I felt threatened or in danger.', subscale: 'threat' },
    { num: 3, text: 'In this dream, I was actively doing things, not just watching.', subscale: 'agency' },
    { num: 4, text: 'Other people or figures in my dream were helpful or supportive.', subscale: 'relational' },
    { num: 5, text: 'In this dream, I felt stuck, trapped, or unable to move.', subscale: 'threat' },
    { num: 6, text: 'In this dream, I was trying to get somewhere or accomplish something.', subscale: 'relational' },
    { num: 7, text: 'This dream felt connected to concerns or situations in my waking life.', subscale: 'continuity' },
    { num: 8, text: 'In this dream, I felt confident, capable, or in control.', subscale: 'agency' },
  ],
  // Trauma-specific items (SDA-TNS, items 9-14)
  trauma: [
    { num: 9,  text: 'I tried to escape or run away in this dream.', subscale: 'trauma_threat' },
    { num: 10, text: 'I tried to fight back or defend myself in this dream.', subscale: 'trauma_agency' },
    { num: 11, text: 'This dream felt like a memory of something that actually happened to me.', subscale: 'trauma_impact' },
    { num: 12, text: 'This dream was similar to a nightmare I have had before.', subscale: 'repetition' },
    { num: 13, text: 'I woke up with physical symptoms (sweating, racing heart, shaking, disorientation).', subscale: 'trauma_impact' },
    { num: 14, text: 'After waking, it took me time to realize I was safe and the dream was not real.', subscale: 'trauma_impact' },
  ],
};

const SDA_LIKERT_ANCHORS = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Extremely' },
];

// Subscale definitions: which items sum into which score
const SDA_SUBSCALES = {
  'SDA-SI': {
    agency:     { items: [1, 3, 8], range: [3, 15] },
    threat:     { items: [2, 5],    range: [2, 10] },
    relational: { items: [4, 6],    range: [2, 10] },
    continuity: { items: [7],       range: [1, 5] },
  },
  'SDA-TNS': {
    agency:         { items: [1, 3, 8, 10], range: [4, 20] },
    threat:         { items: [2, 5, 9],     range: [3, 15] },
    relational:     { items: [4, 6],        range: [2, 10] },
    continuity:     { items: [7],           range: [1, 5] },
    trauma_impact:  { items: [11, 13, 14],  range: [3, 15] },
    repetition:     { items: [12],          range: [1, 5] },
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SDA_PTC_CODES, SDA_PATTERN_TYPES, SDA_EGO_POSITIONS, SDA_NARRATIVE_ARCS,
    SDA_TM_MARKERS, SDA_FFF_POSITIONS, SDA_AWAKENING_PATTERNS,
    SDA_PART_B_ITEMS, SDA_LIKERT_ANCHORS, SDA_SUBSCALES,
  };
}
