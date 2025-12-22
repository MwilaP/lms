<template>
	<node-view-wrapper class="accordion-node-view">
		<div v-if="editor.isEditable" class="accordion-editor-view">
			<div class="accordion-editor-header">
				<span class="block-label">📋 Accordion Block</span>
				<button @click="deleteNode" class="delete-button" title="Delete block">
					×
				</button>
			</div>
			
			<div class="accordion-settings">
				<label class="checkbox-label">
					<input 
						type="checkbox" 
						:checked="node.attrs.expandAll"
						@change="updateExpandAll"
					/>
					<span>Expand all sections by default</span>
				</label>
			</div>

			<div class="accordion-items-editor">
				<div
					v-for="(item, index) in node.attrs.items"
					:key="index"
					class="accordion-item-editor"
				>
					<div class="item-header">
						<span class="item-number">{{ index + 1 }}</span>
						<button
							v-if="node.attrs.items.length > 1"
							@click="removeItem(index)"
							class="remove-item-button"
							title="Remove section"
						>
							×
						</button>
					</div>
					<input
						type="text"
						:value="item.title"
						@input="updateItemTitle(index, $event.target.value)"
						placeholder="Section title..."
						class="item-title-input"
					/>
					<textarea
						:value="item.content"
						@input="updateItemContent(index, $event.target.value)"
						placeholder="Section content..."
						rows="3"
						class="item-content-input"
					></textarea>
				</div>
			</div>

			<button @click="addItem" class="add-item-button">
				+ Add Section
			</button>
		</div>

		<div v-else class="accordion-readonly-view">
			<div class="accordion-items">
				<div
					v-for="(item, index) in node.attrs.items"
					:key="index"
					class="accordion-item"
					:class="{ open: isOpen(index) }"
				>
					<div class="accordion-item-header" @click="toggleItem(index)">
						<span class="accordion-item-title">{{ item.title }}</span>
						<span class="accordion-item-icon">{{ isOpen(index) ? '−' : '+' }}</span>
					</div>
					<div v-if="isOpen(index)" class="accordion-item-content">
						<div v-html="formatContent(item.content)"></div>
					</div>
				</div>
			</div>
		</div>
	</node-view-wrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
	editor: {
		type: Object,
		required: true,
	},
	node: {
		type: Object,
		required: true,
	},
	updateAttributes: {
		type: Function,
		required: true,
	},
	deleteNode: {
		type: Function,
		required: true,
	},
})

const openItems = ref(new Set())

onMounted(() => {
	if (props.node.attrs.expandAll) {
		props.node.attrs.items.forEach((_, index) => {
			openItems.value.add(index)
		})
	}
})

const isOpen = (index) => {
	return openItems.value.has(index)
}

const toggleItem = (index) => {
	if (openItems.value.has(index)) {
		openItems.value.delete(index)
	} else {
		openItems.value.add(index)
	}
}

const updateExpandAll = (event) => {
	props.updateAttributes({
		expandAll: event.target.checked,
	})
}

const updateItemTitle = (index, value) => {
	const items = [...props.node.attrs.items]
	items[index] = { ...items[index], title: value }
	props.updateAttributes({ items })
}

const updateItemContent = (index, value) => {
	const items = [...props.node.attrs.items]
	items[index] = { ...items[index], content: value }
	props.updateAttributes({ items })
}

const addItem = () => {
	const items = [
		...props.node.attrs.items,
		{
			title: `Section ${props.node.attrs.items.length + 1}`,
			content: 'Content goes here...',
		},
	]
	props.updateAttributes({ items })
}

const removeItem = (index) => {
	if (props.node.attrs.items.length > 1) {
		const items = props.node.attrs.items.filter((_, i) => i !== index)
		props.updateAttributes({ items })
	}
}

const formatContent = (content) => {
	return content
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.accordion-node-view {
	margin: 1.5rem 0;
}

.accordion-editor-view {
	border: 2px solid #e5e7eb;
	border-radius: 8px;
	padding: 1rem;
	background-color: #f9fafb;
}

.accordion-editor-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid #e5e7eb;
}

.block-label {
	font-weight: 600;
	color: #374151;
	font-size: 0.875rem;
}

.delete-button {
	background-color: #ef4444;
	color: white;
	border: none;
	border-radius: 4px;
	width: 28px;
	height: 28px;
	cursor: pointer;
	font-size: 1.25rem;
	line-height: 1;
	transition: background-color 0.2s;
}

.delete-button:hover {
	background-color: #dc2626;
}

.accordion-settings {
	margin-bottom: 1rem;
}

.checkbox-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	font-size: 0.875rem;
	color: #374151;
}

.accordion-items-editor {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.accordion-item-editor {
	background-color: white;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	padding: 0.75rem;
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
}

.item-number {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	background-color: #2563eb;
	color: white;
	border-radius: 50%;
	font-size: 0.75rem;
	font-weight: 700;
}

.remove-item-button {
	background-color: #ef4444;
	color: white;
	border: none;
	border-radius: 4px;
	width: 24px;
	height: 24px;
	cursor: pointer;
	font-size: 1rem;
	line-height: 1;
	transition: background-color 0.2s;
}

.remove-item-button:hover {
	background-color: #dc2626;
}

.item-title-input,
.item-content-input {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 4px;
	font-family: inherit;
	margin-bottom: 0.5rem;
}

.item-content-input {
	resize: vertical;
	margin-bottom: 0;
}

.add-item-button {
	width: 100%;
	padding: 0.5rem;
	background-color: #2563eb;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s;
}

.add-item-button:hover {
	background-color: #1d4ed8;
}

.accordion-readonly-view {
	background-color: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 1rem;
}

.accordion-items {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.accordion-item {
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	overflow: hidden;
	transition: all 0.2s;
}

.accordion-item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	cursor: pointer;
	user-select: none;
	transition: background-color 0.2s;
}

.accordion-item-header:hover {
	background-color: #f3f4f6;
}

.accordion-item-title {
	font-weight: 600;
	color: #111827;
}

.accordion-item-icon {
	font-size: 1.25rem;
	color: #6b7280;
	font-weight: 700;
}

.accordion-item-content {
	padding: 1rem;
	border-top: 1px solid #e5e7eb;
	color: #374151;
	line-height: 1.6;
	animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		max-height: 0;
	}
	to {
		opacity: 1;
		max-height: 500px;
	}
}
</style>
