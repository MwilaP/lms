import { createBlockExtension } from './base-block'
import ScenarioNodeView from './components/ScenarioNodeView.vue'

export const ScenarioExtension = createBlockExtension({
	name: 'scenario',
	component: ScenarioNodeView,
	defaultAttrs: {
		title: {
			default: 'Interactive Scenario',
		},
		startNode: {
			default: 'node-1',
		},
		nodes: {
			default: {
				'node-1': {
					id: 'node-1',
					type: 'scenario',
					content: 'You are faced with a challenging situation. What do you do?',
					choices: [
						{ text: 'Option A', nextNode: 'node-2' },
						{ text: 'Option B', nextNode: 'node-3' },
					],
				},
				'node-2': {
					id: 'node-2',
					type: 'outcome',
					content: 'Good choice! This leads to a positive outcome.',
					feedback: 'Well done!',
				},
				'node-3': {
					id: 'node-3',
					type: 'outcome',
					content: 'This choice has consequences.',
					feedback: 'Think about other options.',
				},
			},
		},
	},
})
