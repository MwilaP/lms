import { createBlockExtension } from './base-block'
import QuizNodeView from './components/QuizNodeView.vue'

export const QuizExtension = createBlockExtension({
	name: 'quiz',
	component: QuizNodeView,
	defaultAttrs: {
		quiz: {
			default: '',
		},
		title: {
			default: '',
		},
	},
})
