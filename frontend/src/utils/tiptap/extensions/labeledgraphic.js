import { createBlockExtension } from './base-block'
import LabeledGraphicNodeView from './components/LabeledGraphicNodeView.vue'

export const LabeledGraphicExtension = createBlockExtension({
	name: 'labeledgraphic',
	component: LabeledGraphicNodeView,
	defaultAttrs: {
		imageUrl: {
			default: '',
		},
		markers: {
			default: [],
		},
	},
})
