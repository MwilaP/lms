<template>
	<div class="tiptap-editor-container">
		<!-- Floating Toolbar -->
		<div v-if="editor" class="tiptap-toolbar">
			<!-- Text Formatting -->
			<div class="toolbar-section">
				<div class="section-label">Format</div>
				<div class="button-group">
					<button
						@click="editor.chain().focus().toggleBold().run()"
						:class="{ active: editor.isActive('bold') }"
						class="toolbar-btn"
						title="Bold (Ctrl+B)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
					</button>
					<button
						@click="editor.chain().focus().toggleItalic().run()"
						:class="{ active: editor.isActive('italic') }"
						class="toolbar-btn"
						title="Italic (Ctrl+I)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
					</button>
					<button
						@click="editor.chain().focus().toggleUnderline().run()"
						:class="{ active: editor.isActive('underline') }"
						class="toolbar-btn"
						title="Underline (Ctrl+U)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
					</button>
					<button
						@click="editor.chain().focus().toggleStrike().run()"
						:class="{ active: editor.isActive('strike') }"
						class="toolbar-btn"
						title="Strikethrough"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
					</button>
					<button
						@click="editor.chain().focus().toggleHighlight().run()"
						:class="{ active: editor.isActive('highlight') }"
						class="toolbar-btn"
						title="Highlight"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
					</button>
				</div>
			</div>

			<div class="toolbar-divider"></div>

			<!-- Headings -->
			<div class="toolbar-section">
				<div class="section-label">Headings</div>
				<div class="button-group">
					<button
						@click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
						:class="{ active: editor.isActive('heading', { level: 1 }) }"
						class="toolbar-btn heading-btn"
						title="Heading 1"
					>
						H1
					</button>
					<button
						@click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
						:class="{ active: editor.isActive('heading', { level: 2 }) }"
						class="toolbar-btn heading-btn"
						title="Heading 2"
					>
						H2
					</button>
					<button
						@click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
						:class="{ active: editor.isActive('heading', { level: 3 }) }"
						class="toolbar-btn heading-btn"
						title="Heading 3"
					>
						H3
					</button>
				</div>
			</div>

			<div class="toolbar-divider"></div>

			<!-- Lists -->
			<div class="toolbar-section">
				<div class="section-label">Lists</div>
				<div class="button-group">
					<button
						@click="editor.chain().focus().toggleBulletList().run()"
						:class="{ active: editor.isActive('bulletList') }"
						class="toolbar-btn"
						title="Bullet List"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
					</button>
					<button
						@click="editor.chain().focus().toggleOrderedList().run()"
						:class="{ active: editor.isActive('orderedList') }"
						class="toolbar-btn"
						title="Numbered List"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
					</button>
					<button
						@click="editor.chain().focus().toggleTaskList().run()"
						:class="{ active: editor.isActive('taskList') }"
						class="toolbar-btn"
						title="Task List"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
					</button>
				</div>
			</div>

			<div class="toolbar-divider"></div>

			<!-- Insert -->
			<div class="toolbar-section">
				<div class="section-label">Insert</div>
				<div class="button-group">
					<button @click="addImage" class="toolbar-btn" title="Insert Image">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
					</button>
					<button @click="addYoutubeVideo" class="toolbar-btn" title="Insert YouTube Video">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
					</button>
					<button
						@click="editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()"
						class="toolbar-btn"
						title="Insert Table"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
					</button>
					<button
						@click="editor.chain().focus().setHorizontalRule().run()"
						class="toolbar-btn"
						title="Horizontal Line"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>
					</button>
				</div>
			</div>

			<div class="toolbar-divider"></div>

			<!-- Interactive Blocks -->
			<div class="toolbar-section blocks-section">
				<div class="section-label">Interactive Blocks</div>
				<div class="blocks-dropdown">
					<button class="blocks-trigger" @click="toggleBlocksMenu">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
						<span>Add Block</span>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
					</button>
					<div v-if="showBlocksMenu" class="blocks-menu">
						<div class="blocks-menu-section">
							<div class="menu-section-title">Content Blocks</div>
							<button @click="insertBlock('accordion')" class="block-menu-item">
								<span class="block-icon">📋</span>
								<div class="block-info">
									<div class="block-name">Accordion</div>
									<div class="block-desc">Collapsible sections</div>
								</div>
							</button>
							<button @click="insertBlock('tabs')" class="block-menu-item">
								<span class="block-icon">📑</span>
								<div class="block-info">
									<div class="block-name">Tabs</div>
									<div class="block-desc">Tabbed content</div>
								</div>
							</button>
							<button @click="insertBlock('flipcards')" class="block-menu-item">
								<span class="block-icon">🔄</span>
								<div class="block-info">
									<div class="block-name">Flip Cards</div>
									<div class="block-desc">Interactive cards</div>
								</div>
							</button>
							<button @click="insertBlock('timeline')" class="block-menu-item">
								<span class="block-icon">📅</span>
								<div class="block-info">
									<div class="block-name">Timeline</div>
									<div class="block-desc">Event timeline</div>
								</div>
							</button>
							<button @click="insertBlock('process')" class="block-menu-item">
								<span class="block-icon">🔄</span>
								<div class="block-info">
									<div class="block-name">Process</div>
									<div class="block-desc">Step-by-step guide</div>
								</div>
							</button>
							<button @click="insertBlock('labeledgraphic')" class="block-menu-item">
								<span class="block-icon">🏷</span>
								<div class="block-info">
									<div class="block-name">Labeled Graphic</div>
									<div class="block-desc">Interactive image</div>
								</div>
							</button>
						</div>
						<div class="blocks-menu-section">
							<div class="menu-section-title">Knowledge Checks</div>
							<button @click="insertBlock('sortablelist')" class="block-menu-item">
								<span class="block-icon">↕</span>
								<div class="block-info">
									<div class="block-name">Sortable List</div>
									<div class="block-desc">Drag to order</div>
								</div>
							</button>
							<button @click="insertBlock('flashcards')" class="block-menu-item">
								<span class="block-icon">🎴</span>
								<div class="block-info">
									<div class="block-name">Flashcards</div>
									<div class="block-desc">Study cards</div>
								</div>
							</button>
							<button @click="insertBlock('matchingpairs')" class="block-menu-item">
								<span class="block-icon">🔗</span>
								<div class="block-info">
									<div class="block-name">Matching Pairs</div>
									<div class="block-desc">Connect items</div>
								</div>
							</button>
							<button @click="insertBlock('scenario')" class="block-menu-item">
								<span class="block-icon">🎭</span>
								<div class="block-info">
									<div class="block-name">Scenario</div>
									<div class="block-desc">Branching paths</div>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="toolbar-divider"></div>

			<!-- History -->
			<div class="toolbar-section">
				<div class="button-group">
					<button
						@click="editor.chain().focus().undo().run()"
						:disabled="!editor.can().undo()"
						class="toolbar-btn"
						title="Undo (Ctrl+Z)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
					</button>
					<button
						@click="editor.chain().focus().redo().run()"
						:disabled="!editor.can().redo()"
						class="toolbar-btn"
						title="Redo (Ctrl+Y)"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Editor Content -->
		<div class="tiptap-editor-content">
			<editor-content :editor="editor" />
		</div>
	</div>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { getTiptapConfig } from '@/utils/tiptap'

const props = defineProps({
	modelValue: {
		type: [String, Object],
		default: '',
	},
	editable: {
		type: Boolean,
		default: true,
	},
	placeholder: {
		type: String,
		default: 'Start writing your lesson content...',
	},
})

const emit = defineEmits(['update:modelValue'])

const showBlocksMenu = ref(false)

const editor = useEditor({
	...getTiptapConfig({
		editable: props.editable,
		content: props.modelValue,
		placeholder: props.placeholder,
		onUpdate: ({ editor }) => {
			emit('update:modelValue', editor.getJSON())
		},
	}),
})

watch(
	() => props.modelValue,
	(value) => {
		if (editor.value) {
			const isSame = JSON.stringify(editor.value.getJSON()) === JSON.stringify(value)
			if (!isSame) {
				editor.value.commands.setContent(value, false)
			}
		}
	}
)

watch(
	() => props.editable,
	(value) => {
		if (editor.value) {
			editor.value.setEditable(value)
		}
	}
)

const toggleBlocksMenu = () => {
	showBlocksMenu.value = !showBlocksMenu.value
}

const addImage = () => {
	const url = window.prompt('Enter image URL:')
	if (url) {
		editor.value.chain().focus().setImage({ src: url }).run()
	}
}

const addYoutubeVideo = () => {
	const url = window.prompt('Enter YouTube URL:')
	if (url) {
		editor.value.chain().focus().setYoutubeVideo({ src: url }).run()
	}
}

const insertBlock = (blockType) => {
	if (!blockType) return

	const commandName = `insert${blockType.charAt(0).toUpperCase() + blockType.slice(1)}`
	
	if (editor.value.commands[commandName]) {
		editor.value.commands[commandName]({})
	}

	showBlocksMenu.value = false
	editor.value.chain().focus().run()
}

onBeforeUnmount(() => {
	if (editor.value) {
		editor.value.destroy()
	}
})
</script>

<style scoped>
/* Modern RISE 360-inspired Editor Styling */

.tiptap-editor-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
	border-radius: 12px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

/* Toolbar Styling */
.tiptap-toolbar {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.5rem;
	background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
	border-bottom: 2px solid #e2e8f0;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	flex-wrap: wrap;
	position: sticky;
	top: 0;
	z-index: 10;
}

.toolbar-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.section-label {
	font-size: 0.625rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #64748b;
	padding: 0 0.25rem;
}

.button-group {
	display: flex;
	gap: 0.25rem;
	background-color: #f1f5f9;
	padding: 0.25rem;
	border-radius: 8px;
}

.toolbar-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	padding: 0;
	background-color: white;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	color: #475569;
	position: relative;
}

.toolbar-btn:hover:not(:disabled) {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	border-color: #2563eb;
	color: white;
	transform: translateY(-1px);
	box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
}

.toolbar-btn.active {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	border-color: #2563eb;
	color: white;
	box-shadow: 0 2px 4px rgba(37, 99, 235, 0.4);
}

.toolbar-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
	background-color: #f8fafc;
}

.toolbar-btn svg {
	width: 16px;
	height: 16px;
}

.heading-btn {
	font-weight: 700;
	font-size: 0.875rem;
}

.toolbar-divider {
	width: 1px;
	height: 48px;
	background: linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%);
	margin: 0 0.25rem;
}

/* Blocks Dropdown */
.blocks-section {
	position: relative;
}

.blocks-dropdown {
	position: relative;
}

.blocks-trigger {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1rem;
	background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 600;
	font-size: 0.875rem;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.blocks-trigger:hover {
	background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
}

.blocks-trigger svg {
	width: 16px;
	height: 16px;
}

.blocks-menu {
	position: absolute;
	top: calc(100% + 0.5rem);
	left: 0;
	min-width: 320px;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	z-index: 50;
	overflow: hidden;
	animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.blocks-menu-section {
	padding: 0.75rem;
	border-bottom: 1px solid #f1f5f9;
}

.blocks-menu-section:last-child {
	border-bottom: none;
}

.menu-section-title {
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #64748b;
	margin-bottom: 0.5rem;
	padding: 0 0.5rem;
}

.block-menu-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	width: 100%;
	padding: 0.75rem;
	background: transparent;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s ease;
	text-align: left;
}

.block-menu-item:hover {
	background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
	transform: translateX(4px);
}

.block-icon {
	font-size: 1.5rem;
	flex-shrink: 0;
}

.block-info {
	flex: 1;
}

.block-name {
	font-weight: 600;
	color: #1e293b;
	font-size: 0.875rem;
	margin-bottom: 0.125rem;
}

.block-desc {
	font-size: 0.75rem;
	color: #64748b;
}

/* Editor Content Area */
.tiptap-editor-content {
	flex: 1;
	overflow-y: auto;
	padding: 2rem;
	background: white;
}

.tiptap-editor-content :deep(.ProseMirror) {
	outline: none;
	min-height: 500px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 1rem;
	line-height: 1.75;
	color: #1e293b;
}

.tiptap-editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
	content: attr(data-placeholder);
	float: left;
	color: #94a3b8;
	pointer-events: none;
	height: 0;
	font-style: italic;
}

/* Typography Enhancements */
.tiptap-editor-content :deep(.ProseMirror h1) {
	font-size: 2.25rem;
	font-weight: 800;
	line-height: 1.2;
	margin: 2rem 0 1rem;
	color: #0f172a;
	background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.tiptap-editor-content :deep(.ProseMirror h2) {
	font-size: 1.875rem;
	font-weight: 700;
	line-height: 1.3;
	margin: 1.75rem 0 0.875rem;
	color: #1e293b;
}

.tiptap-editor-content :deep(.ProseMirror h3) {
	font-size: 1.5rem;
	font-weight: 600;
	line-height: 1.4;
	margin: 1.5rem 0 0.75rem;
	color: #334155;
}

.tiptap-editor-content :deep(.ProseMirror p) {
	margin: 0.75rem 0;
}

.tiptap-editor-content :deep(.ProseMirror strong) {
	font-weight: 700;
	color: #0f172a;
}

.tiptap-editor-content :deep(.ProseMirror em) {
	font-style: italic;
	color: #475569;
}

.tiptap-editor-content :deep(.ProseMirror mark) {
	background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
	padding: 0.125rem 0.25rem;
	border-radius: 3px;
}

/* Lists */
.tiptap-editor-content :deep(.ProseMirror ul),
.tiptap-editor-content :deep(.ProseMirror ol) {
	padding-left: 1.5rem;
	margin: 1rem 0;
}

.tiptap-editor-content :deep(.ProseMirror li) {
	margin: 0.5rem 0;
	padding-left: 0.5rem;
}

.tiptap-editor-content :deep(.ProseMirror ul li::marker) {
	color: #3b82f6;
}

.tiptap-editor-content :deep(.ProseMirror ol li::marker) {
	color: #8b5cf6;
	font-weight: 700;
}

/* Task Lists */
.tiptap-editor-content :deep(.ProseMirror ul[data-type="taskList"]) {
	list-style: none;
	padding-left: 0;
}

.tiptap-editor-content :deep(.ProseMirror li[data-type="taskItem"]) {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
}

.tiptap-editor-content :deep(.ProseMirror li[data-type="taskItem"] > label) {
	flex-shrink: 0;
	margin-top: 0.125rem;
}

.tiptap-editor-content :deep(.ProseMirror li[data-type="taskItem"] > div) {
	flex: 1;
}

/* Blockquote */
.tiptap-editor-content :deep(.ProseMirror blockquote) {
	border-left: 4px solid #3b82f6;
	padding: 1rem 1.5rem;
	margin: 1.5rem 0;
	background: linear-gradient(90deg, #eff6ff 0%, transparent 100%);
	border-radius: 0 8px 8px 0;
	font-style: italic;
	color: #475569;
	position: relative;
}

.tiptap-editor-content :deep(.ProseMirror blockquote::before) {
	content: '"';
	position: absolute;
	left: 0.5rem;
	top: -0.5rem;
	font-size: 3rem;
	color: #3b82f6;
	opacity: 0.2;
	font-family: Georgia, serif;
}

/* Code */
.tiptap-editor-content :deep(.ProseMirror pre) {
	background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
	color: #e2e8f0;
	padding: 1.5rem;
	border-radius: 12px;
	overflow-x: auto;
	margin: 1.5rem 0;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
	font-family: 'Fira Code', 'Courier New', monospace;
	font-size: 0.875rem;
	line-height: 1.6;
}

.tiptap-editor-content :deep(.ProseMirror code) {
	background-color: #f1f5f9;
	color: #e11d48;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-family: 'Fira Code', 'Courier New', monospace;
	font-size: 0.875em;
	font-weight: 500;
}

/* Horizontal Rule */
.tiptap-editor-content :deep(.ProseMirror hr) {
	border: none;
	height: 2px;
	background: linear-gradient(90deg, transparent 0%, #cbd5e1 50%, transparent 100%);
	margin: 3rem 0;
}

/* Images */
.tiptap-editor-content :deep(.ProseMirror img) {
	max-width: 100%;
	height: auto;
	border-radius: 12px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	margin: 1.5rem 0;
	transition: transform 0.2s ease;
}

.tiptap-editor-content :deep(.ProseMirror img:hover) {
	transform: scale(1.02);
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
}

/* Links */
.tiptap-editor-content :deep(.ProseMirror a) {
	color: #3b82f6;
	text-decoration: none;
	font-weight: 500;
	border-bottom: 2px solid transparent;
	transition: all 0.2s ease;
}

.tiptap-editor-content :deep(.ProseMirror a:hover) {
	color: #2563eb;
	border-bottom-color: #3b82f6;
}

/* Tables */
.tiptap-editor-content :deep(.ProseMirror table) {
	border-collapse: collapse;
	width: 100%;
	margin: 1.5rem 0;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.tiptap-editor-content :deep(.ProseMirror th),
.tiptap-editor-content :deep(.ProseMirror td) {
	border: 1px solid #e2e8f0;
	padding: 0.75rem 1rem;
	text-align: left;
}

.tiptap-editor-content :deep(.ProseMirror th) {
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	font-weight: 700;
	color: #1e293b;
	text-transform: uppercase;
	font-size: 0.75rem;
	letter-spacing: 0.05em;
}

.tiptap-editor-content :deep(.ProseMirror td) {
	background-color: white;
}

.tiptap-editor-content :deep(.ProseMirror tr:hover td) {
	background-color: #f8fafc;
}

/* Responsive Design */
@media (max-width: 1024px) {
	.tiptap-toolbar {
		padding: 0.75rem 1rem;
		gap: 0.5rem;
	}

	.section-label {
		font-size: 0.5rem;
	}

	.toolbar-btn {
		width: 32px;
		height: 32px;
	}
}

@media (max-width: 768px) {
	.tiptap-toolbar {
		padding: 0.5rem;
		gap: 0.25rem;
	}

	.toolbar-section {
		gap: 0.25rem;
	}

	.section-label {
		display: none;
	}

	.toolbar-btn {
		width: 28px;
		height: 28px;
	}

	.toolbar-btn svg {
		width: 14px;
		height: 14px;
	}

	.blocks-trigger {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
	}

	.tiptap-editor-content {
		padding: 1rem;
	}

	.tiptap-editor-content :deep(.ProseMirror) {
		font-size: 0.9375rem;
	}

	.tiptap-editor-content :deep(.ProseMirror h1) {
		font-size: 1.875rem;
	}

	.tiptap-editor-content :deep(.ProseMirror h2) {
		font-size: 1.5rem;
	}

	.tiptap-editor-content :deep(.ProseMirror h3) {
		font-size: 1.25rem;
	}
}

/* Scrollbar Styling */
.tiptap-editor-content::-webkit-scrollbar {
	width: 8px;
}

.tiptap-editor-content::-webkit-scrollbar-track {
	background: #f1f5f9;
	border-radius: 4px;
}

.tiptap-editor-content::-webkit-scrollbar-thumb {
	background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
	border-radius: 4px;
}

.tiptap-editor-content::-webkit-scrollbar-thumb:hover {
	background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}
</style>
