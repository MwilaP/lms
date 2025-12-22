import { createBlockExtension } from './base-block'
import FlipCardsNodeView from './components/FlipCardsNodeView.vue'

export const FlipCardsExtension = createBlockExtension({
	name: 'flipcards',
	component: FlipCardsNodeView,
	defaultAttrs: {
		cards: {
			default: [
				{ front: 'Front 1', back: 'Back 1' },
				{ front: 'Front 2', back: 'Back 2' },
			],
		},
		columns: {
			default: 2,
		},
		flipTrigger: {
			default: 'click',
		},
	},
})
