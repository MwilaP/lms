import { createBlockExtension } from './base-block'
import AssignmentNodeView from './components/AssignmentNodeView.vue'

export const AssignmentExtension = createBlockExtension({
	name: 'assignment',
	component: AssignmentNodeView,
	defaultAttrs: {
		assignment: {
			default: '',
		},
		title: {
			default: '',
		},
	},
})
