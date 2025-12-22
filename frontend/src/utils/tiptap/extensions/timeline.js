import { createBlockExtension } from './base-block'
import TimelineNodeView from './components/TimelineNodeView.vue'

export const TimelineExtension = createBlockExtension({
	name: 'timeline',
	component: TimelineNodeView,
	defaultAttrs: {
		events: {
			default: [
				{ date: '2024', title: 'Event 1', description: 'Description 1' },
				{ date: '2025', title: 'Event 2', description: 'Description 2' },
			],
		},
		layout: {
			default: 'vertical',
		},
	},
})
