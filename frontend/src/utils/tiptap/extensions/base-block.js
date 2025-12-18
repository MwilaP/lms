import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

/**
 * Base class for custom interactive block extensions
 * Provides common functionality for all interactive blocks
 */
export function createBlockExtension(config) {
	const {
		name,
		group = 'block',
		content = '',
		atom = true,
		draggable = true,
		selectable = true,
		defaultAttrs = {},
		component = null,
	} = config

	return Node.create({
		name,
		group,
		content,
		atom,
		draggable,
		selectable,

		addAttributes() {
			return defaultAttrs
		},

		parseHTML() {
			return [
				{
					tag: `div[data-type="${name}"]`,
				},
			]
		},

		renderHTML({ HTMLAttributes }) {
			return [
				'div',
				mergeAttributes(HTMLAttributes, {
					'data-type': name,
					class: `${name}-block`,
				}),
			]
		},

		addNodeView() {
			if (component) {
				return VueNodeViewRenderer(component)
			}
			return null
		},

		addCommands() {
			return {
				[`insert${name.charAt(0).toUpperCase() + name.slice(1)}`]:
					(attributes) =>
					({ commands }) => {
						return commands.insertContent({
							type: name,
							attrs: attributes,
						})
					},
			}
		},
	})
}
