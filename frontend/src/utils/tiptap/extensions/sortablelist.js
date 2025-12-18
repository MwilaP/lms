import { createBlockExtension } from './base-block'
import SortableListNodeView from './components/SortableListNodeView.vue'

export const SortableListExtension = createBlockExtension({
	name: 'sortablelist',
	component: SortableListNodeView,
	defaultAttrs: {
		question: {
			default: 'Arrange the items in the correct order:',
		},
		items: {
			default: ['Item 1', 'Item 2', 'Item 3'],
		},
		showFeedback: {
			default: true,
		},
		feedbackCorrect: {
			default: 'Correct! Well done.',
		},
		feedbackIncorrect: {
			default: 'Not quite right. Try again!',
		},
	},
})
