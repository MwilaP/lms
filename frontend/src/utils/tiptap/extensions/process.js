import { createBlockExtension } from './base-block'
import ProcessNodeView from './components/ProcessNodeView.vue'

export const ProcessExtension = createBlockExtension({
	name: 'process',
	component: ProcessNodeView,
	defaultAttrs: {
		steps: {
			default: [
				{ title: 'Step 1', description: 'Description 1' },
				{ title: 'Step 2', description: 'Description 2' },
			],
		},
		layout: {
			default: 'horizontal',
		},
		showNumbers: {
			default: true,
		},
	},
})
