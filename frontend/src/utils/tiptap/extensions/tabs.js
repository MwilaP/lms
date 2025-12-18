import { createBlockExtension } from './base-block'
import TabsNodeView from './components/TabsNodeView.vue'

export const TabsExtension = createBlockExtension({
	name: 'tabs',
	component: TabsNodeView,
	defaultAttrs: {
		tabs: {
			default: [
				{ title: 'Tab 1', content: 'Content for tab 1' },
				{ title: 'Tab 2', content: 'Content for tab 2' },
			],
		},
		layout: {
			default: 'horizontal',
		},
	},
})
