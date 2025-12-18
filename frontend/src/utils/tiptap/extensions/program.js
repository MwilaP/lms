import { createBlockExtension } from './base-block'
import ProgramNodeView from './components/ProgramNodeView.vue'

export const ProgramExtension = createBlockExtension({
	name: 'program',
	component: ProgramNodeView,
	defaultAttrs: {
		program: {
			default: '',
		},
		title: {
			default: '',
		},
	},
})
