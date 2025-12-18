import { createBlockExtension } from './base-block'
import FlashcardsNodeView from './components/FlashcardsNodeView.vue'

export const FlashcardsExtension = createBlockExtension({
	name: 'flashcards',
	component: FlashcardsNodeView,
	defaultAttrs: {
		title: {
			default: 'Flashcard Set',
		},
		cards: {
			default: [
				{ front: 'Question 1', back: 'Answer 1' },
				{ front: 'Question 2', back: 'Answer 2' },
			],
		},
		showProgress: {
			default: true,
		},
	},
})
