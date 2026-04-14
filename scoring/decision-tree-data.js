/**
 * PTC Decision Tree — Interactive walkthrough for coding dreams
 * Each node has a question, and branches lead to either another question or a PTC code.
 */

const SDA_DECISION_TREE = {
  id: 'root',
  question: 'Is the dream ego (the "I" in the dream) present and participating in the dream?',
  hint: 'The dream ego is the figure the dreamer experiences as themselves. If the dreamer is watching a scene without being in it, like a movie, the ego is absent.',
  branches: [
    {
      label: 'No — watching like a film, not participating',
      result: { code: '1.0', label: 'No Dream Ego' },
    },
    {
      label: 'Yes — the dream ego is present',
      node: {
        id: 'primary',
        question: 'What is the dream ego\'s primary situation? Choose the best fit.',
        hint: 'Focus on the dominant trajectory — what the dream is fundamentally about for the ego.',
        branches: [
          {
            label: 'Being threatened, attacked, or pursued',
            node: {
              id: 'type2',
              question: 'How does the dream ego respond to the threat?',
              hint: 'Focus on the outcome — where does the ego end up by the dream\'s end?',
              branches: [
                { label: 'The ego is destroyed, killed, severely wounded, or dismembered', result: { code: '2.1', label: 'Destroyed' } },
                { label: 'The ego is overwhelmed and powerless — cannot move, speak, or act', result: { code: '2.2', label: 'Overwhelmed / Frozen' } },
                { label: 'The ego flees — runs, hides, escapes', result: { code: '2.3', label: 'Flees' } },
                { label: 'The ego fights back or resists, but the threat persists', result: { code: '2.4', label: 'Resists (unsuccessfully)' } },
                { label: 'The ego successfully overcomes or neutralizes the threat', result: { code: '2.5', label: 'Overcomes Threat' } },
              ],
            },
          },
          {
            label: 'Facing a task, test, or demand imposed by others',
            node: {
              id: 'type3',
              question: 'How does the dream ego handle the demand?',
              hint: 'Someone or something is requiring the ego to perform, find something, pass a test, or produce something.',
              branches: [
                { label: 'The ego fails — unprepared, cannot do it, subjected to external control', result: { code: '3.1', label: 'Fails the Demand' } },
                { label: 'The ego has prepared but encounters obstacles — task remains unsolved', result: { code: '3.2', label: 'Blocked by Obstacles' } },
                { label: 'The ego masters the demand through its own activity', result: { code: '3.3', label: 'Masters the Demand' } },
              ],
            },
          },
          {
            label: 'Trying to get somewhere, travel, or move',
            node: {
              id: 'type4',
              question: 'How does the ego\'s movement go?',
              hint: 'The ego is pursuing a destination or trying to move on its own initiative.',
              branches: [
                { label: 'Locked in, trapped — tries to get out but fails', result: { code: '4.1', label: 'Locked In' } },
                { label: 'Wants to move but has no means — misses the train, no vehicle', result: { code: '4.2', label: 'No Means' } },
                { label: 'Moves successfully at first, then encounters an obstacle and stops', result: { code: '4.3', label: 'Obstructed' } },
                { label: 'In motion, encounters obstacles, keeps going but doesn\'t reach the goal', result: { code: '4.4', label: 'Goal Not Reached' } },
                { label: 'Successfully reaches the desired destination', result: { code: '4.5', label: 'Arrives Successfully' } },
              ],
            },
          },
          {
            label: 'Trying to connect with, communicate with, or relate to someone',
            node: {
              id: 'type5',
              question: 'How does the social interaction go?',
              hint: 'The ego wants to establish contact, communicate, or create a connection with another person.',
              branches: [
                { label: 'The ego wants contact but is ignored', result: { code: '5.1', label: 'Ignored' } },
                { label: 'The ego makes contact but it fails — obstacles prevent connection', result: { code: '5.2', label: 'Contact Fails' } },
                { label: 'The ego successfully establishes the desired contact', result: { code: '5.3', label: 'Connects Successfully' } },
              ],
            },
          },
          {
            label: 'Dealing with independence, separation, being alone, or helping others',
            node: {
              id: 'type6',
              question: 'What form does the autonomy take?',
              hint: 'The ego is occupied with its own independence, self-sufficiency, or capacity to give to others.',
              branches: [
                { label: 'The ego is flooded by others\' affection or attention (uninvited)', result: { code: '6.1', label: 'Flooded by Others' } },
                { label: 'The ego is aggressive toward others — expressing will to separate or be independent', result: { code: '6.2', label: 'Separates Aggressively' } },
                { label: 'The ego is alone and content — self-sufficient, at peace', result: { code: '6.3', label: 'Alone and Content' } },
                { label: 'The ego helps others from its own abundance — shares resources on its own initiative', result: { code: '6.4', label: 'Helps Others' } },
              ],
            },
          },
        ],
      },
    },
  ],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SDA_DECISION_TREE };
}
