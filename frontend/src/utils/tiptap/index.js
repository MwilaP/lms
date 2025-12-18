import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'

// Import custom extensions for interactive blocks
import { AccordionExtension } from './extensions/accordion'
import { TabsExtension } from './extensions/tabs'
import { FlipCardsExtension } from './extensions/flipcards'
import { TimelineExtension } from './extensions/timeline'
import { ProcessExtension } from './extensions/process'
import { LabeledGraphicExtension } from './extensions/labeledgraphic'
import { SortableListExtension } from './extensions/sortablelist'
import { FlashcardsExtension } from './extensions/flashcards'
import { MatchingPairsExtension } from './extensions/matchingpairs'
import { ScenarioExtension } from './extensions/scenario'
import { QuizExtension } from './extensions/quiz'
import { AssignmentExtension } from './extensions/assignment'
import { ProgramExtension } from './extensions/program'
import { UploadExtension } from './extensions/upload'

/**
 * Get Tiptap editor configuration
 * @param {Object} options - Configuration options
 * @param {boolean} options.editable - Whether the editor is editable
 * @param {string} options.content - Initial content
 * @param {Function} options.onUpdate - Callback for content updates
 * @returns {Object} Tiptap editor configuration
 */
export function getTiptapConfig(options = {}) {
	const {
		editable = true,
		content = '',
		onUpdate = null,
		placeholder = 'Start writing your lesson content...',
	} = options

	return {
		editable,
		content,
		onUpdate,
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4, 5, 6],
				},
				codeBlock: {
					HTMLAttributes: {
						class: 'code-block',
					},
				},
			}),
			Image.configure({
				HTMLAttributes: {
					class: 'tiptap-image',
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'tiptap-link',
				},
			}),
			Table.configure({
				resizable: true,
				HTMLAttributes: {
					class: 'tiptap-table',
				},
			}),
			TableRow,
			TableCell,
			TableHeader,
			TaskList.configure({
				HTMLAttributes: {
					class: 'tiptap-task-list',
				},
			}),
			TaskItem.configure({
				nested: true,
				HTMLAttributes: {
					class: 'tiptap-task-item',
				},
			}),
			Highlight.configure({
				multicolor: true,
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Underline,
			TextStyle,
			Color,
			Youtube.configure({
				controls: true,
				nocookie: true,
				HTMLAttributes: {
					class: 'tiptap-youtube',
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			// Phase 1: Interactive Content Blocks
			AccordionExtension,
			TabsExtension,
			FlipCardsExtension,
			TimelineExtension,
			ProcessExtension,
			LabeledGraphicExtension,
			// Phase 2: Knowledge Check Blocks
			SortableListExtension,
			FlashcardsExtension,
			MatchingPairsExtension,
			ScenarioExtension,
			// Existing LMS Blocks
			QuizExtension,
			AssignmentExtension,
			ProgramExtension,
			UploadExtension,
		],
		editorProps: {
			attributes: {
				class: 'tiptap-editor prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
			},
		},
	}
}

/**
 * Create a new Tiptap editor instance
 * @param {HTMLElement} element - DOM element to mount the editor
 * @param {Object} options - Configuration options
 * @returns {Editor} Tiptap editor instance
 */
export function createTiptapEditor(element, options = {}) {
	const config = getTiptapConfig(options)
	return new Editor({
		element,
		...config,
	})
}

/**
 * Convert EditorJS JSON to Tiptap JSON
 * @param {Object} editorJsData - EditorJS data object
 * @returns {Object} Tiptap JSON data
 */
export function convertEditorJsToTiptap(editorJsData) {
	if (!editorJsData || !editorJsData.blocks) {
		return { type: 'doc', content: [] }
	}

	const content = editorJsData.blocks.map((block) => {
		switch (block.type) {
			case 'header':
				return {
					type: 'heading',
					attrs: { level: block.data.level || 2 },
					content: [{ type: 'text', text: block.data.text || '' }],
				}

			case 'paragraph':
				return {
					type: 'paragraph',
					content: block.data.text
						? [{ type: 'text', text: block.data.text }]
						: [],
				}

			case 'list':
				return {
					type: block.data.style === 'ordered' ? 'orderedList' : 'bulletList',
					content: block.data.items.map((item) => ({
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: item }],
							},
						],
					})),
				}

			case 'table':
				return {
					type: 'table',
					content: block.data.content.map((row) => ({
						type: 'tableRow',
						content: row.map((cell) => ({
							type: 'tableCell',
							content: [
								{
									type: 'paragraph',
									content: [{ type: 'text', text: cell }],
								},
							],
						})),
					})),
				}

			case 'image':
				return {
					type: 'image',
					attrs: {
						src: block.data.url || block.data.file?.url || '',
						alt: block.data.caption || '',
					},
				}

			case 'code':
				return {
					type: 'codeBlock',
					content: [{ type: 'text', text: block.data.code || '' }],
				}

			// Interactive blocks - preserve data structure
			case 'accordion':
				return {
					type: 'accordion',
					attrs: block.data,
				}

			case 'tabs':
				return {
					type: 'tabs',
					attrs: block.data,
				}

			case 'flipcards':
				return {
					type: 'flipcards',
					attrs: block.data,
				}

			case 'timeline':
				return {
					type: 'timeline',
					attrs: block.data,
				}

			case 'process':
				return {
					type: 'process',
					attrs: block.data,
				}

			case 'labeledgraphic':
				return {
					type: 'labeledgraphic',
					attrs: block.data,
				}

			case 'sortablelist':
				return {
					type: 'sortablelist',
					attrs: block.data,
				}

			case 'flashcards':
				return {
					type: 'flashcards',
					attrs: block.data,
				}

			case 'matchingpairs':
				return {
					type: 'matchingpairs',
					attrs: block.data,
				}

			case 'scenario':
				return {
					type: 'scenario',
					attrs: block.data,
				}

			case 'quiz':
				return {
					type: 'quiz',
					attrs: block.data,
				}

			case 'assignment':
				return {
					type: 'assignment',
					attrs: block.data,
				}

			case 'program':
				return {
					type: 'program',
					attrs: block.data,
				}

			case 'upload':
				return {
					type: 'upload',
					attrs: block.data,
				}

			case 'embed':
				if (block.data.service === 'youtube') {
					return {
						type: 'youtube',
						attrs: {
							src: block.data.embed,
							width: block.data.width || 640,
							height: block.data.height || 480,
						},
					}
				}
				return {
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: `[Embedded content: ${block.data.service}]`,
						},
					],
				}

			default:
				// Fallback for unknown block types
				return {
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: `[Unsupported block type: ${block.type}]`,
						},
					],
				}
		}
	})

	return {
		type: 'doc',
		content,
	}
}

/**
 * Convert Tiptap JSON to EditorJS JSON (for backward compatibility)
 * @param {Object} tiptapData - Tiptap JSON data
 * @returns {Object} EditorJS data object
 */
export function convertTiptapToEditorJs(tiptapData) {
	if (!tiptapData || !tiptapData.content) {
		return { blocks: [] }
	}

	const blocks = tiptapData.content.map((node, index) => {
		const id = `block-${index}`

		switch (node.type) {
			case 'heading':
				return {
					id,
					type: 'header',
					data: {
						text: node.content?.[0]?.text || '',
						level: node.attrs?.level || 2,
					},
				}

			case 'paragraph':
				return {
					id,
					type: 'paragraph',
					data: {
						text: node.content?.[0]?.text || '',
					},
				}

			case 'bulletList':
			case 'orderedList':
				return {
					id,
					type: 'list',
					data: {
						style: node.type === 'orderedList' ? 'ordered' : 'unordered',
						items:
							node.content?.map(
								(item) => item.content?.[0]?.content?.[0]?.text || ''
							) || [],
					},
				}

			case 'image':
				return {
					id,
					type: 'image',
					data: {
						url: node.attrs?.src || '',
						caption: node.attrs?.alt || '',
					},
				}

			// Interactive blocks
			case 'accordion':
			case 'tabs':
			case 'flipcards':
			case 'timeline':
			case 'process':
			case 'labeledgraphic':
			case 'sortablelist':
			case 'flashcards':
			case 'matchingpairs':
			case 'scenario':
			case 'quiz':
			case 'assignment':
			case 'program':
			case 'upload':
				return {
					id,
					type: node.type,
					data: node.attrs || {},
				}

			default:
				return {
					id,
					type: 'paragraph',
					data: {
						text: `[${node.type}]`,
					},
				}
		}
	})

	return { blocks }
}
