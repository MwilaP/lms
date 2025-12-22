import { createBlockExtension } from './base-block'
import MatchingPairsNodeView from './components/MatchingPairsNodeView.vue'

export const MatchingPairsExtension = createBlockExtension({
	name: 'matchingpairs',
	component: MatchingPairsNodeView,
	defaultAttrs: {
		question: {
			default: 'Match the items on the left with their corresponding pairs on the right:',
		},
		pairs: {
			default: [
				{ left: 'Item A', right: 'Match A' },
				{ left: 'Item B', right: 'Match B' },
			],
		},
		showFeedback: {
			default: true,
		},
		feedbackCorrect: {
			default: 'Perfect! All matches are correct.',
		},
		feedbackIncorrect: {
			default: 'Some matches are incorrect. Try again!',
		},
	},
})
