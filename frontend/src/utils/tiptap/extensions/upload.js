import { createBlockExtension } from './base-block'
import UploadNodeView from './components/UploadNodeView.vue'

export const UploadExtension = createBlockExtension({
	name: 'upload',
	component: UploadNodeView,
	defaultAttrs: {
		fileUrl: {
			default: '',
		},
		fileName: {
			default: '',
		},
		fileType: {
			default: '',
		},
	},
})
