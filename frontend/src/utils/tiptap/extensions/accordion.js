import { createBlockExtension } from './base-block'
import AccordionNodeView from './components/AccordionNodeView.vue'

export const AccordionExtension = createBlockExtension({
	name: 'accordion',
	component: AccordionNodeView,
	defaultAttrs: {
		items: {
			default: [
				{
					title: 'Section 1',
					content: 'Content for section 1',
				},
				{
					title: 'Section 2',
					content: 'Content for section 2',
				},
			],
		},
		expandAll: {
			default: false,
		},
	},
})
