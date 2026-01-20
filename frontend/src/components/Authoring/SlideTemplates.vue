<template>
	<Transition
		enter-active-class="transition ease-out duration-200"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition ease-in duration-150"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
			<div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
				<div class="flex items-center justify-between px-6 py-4 border-b">
					<div>
						<h3 class="text-lg font-semibold text-ink-gray-9">{{ __('Slide Templates') }}</h3>
						<p class="text-sm text-ink-gray-5 mt-0.5">{{ __('Choose a template to apply to your slide') }}</p>
					</div>
					<Button variant="ghost" size="sm" @click="$emit('close')">
						<template #icon>
							<X class="w-4 h-4" />
						</template>
					</Button>
				</div>

				<div class="flex-1 overflow-y-auto p-6">
					<div class="grid grid-cols-3 gap-4">
						<div
							v-for="template in templates"
							:key="template.id"
							class="group cursor-pointer"
							@click="applyTemplate(template)"
						>
							<div
								class="aspect-video bg-surface-gray-1 rounded-lg border-2 overflow-hidden transition-all"
								:class="selectedTemplate === template.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-blue-300 hover:shadow-md'"
							>
								<div class="w-full h-full p-3 flex flex-col" :style="{ backgroundColor: template.bgColor }">
									<component :is="template.preview" />
								</div>
							</div>
							<p class="text-sm text-ink-gray-7 mt-2 text-center group-hover:text-blue-600 transition-colors">
								{{ template.name }}
							</p>
						</div>
					</div>
				</div>

				<div class="border-t px-6 py-4 flex justify-end space-x-3">
					<Button variant="outline" @click="$emit('close')">{{ __('Cancel') }}</Button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { ref, h } from 'vue'
import { Button } from 'frappe-ui'
import { X } from 'lucide-vue-next'

const props = defineProps({
	show: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'apply'])

const selectedTemplate = ref(null)

const templates = [
	{
		id: 'blank',
		name: 'Blank',
		bgColor: '#ffffff',
		preview: () => h('div', { class: 'flex-1' }),
		elements: [],
	},
	{
		id: 'title',
		name: 'Title Slide',
		bgColor: '#1e3a5f',
		preview: () => h('div', { class: 'flex-1 flex flex-col items-center justify-center' }, [
			h('div', { class: 'w-3/4 h-3 bg-white/90 rounded mb-2' }),
			h('div', { class: 'w-1/2 h-2 bg-white/50 rounded' }),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 512, y: 220, text: 'Title Goes Here', fontSize: 64, fontStyle: 'bold', fill: '#ffffff', align: 'center', offsetX: 180 } },
			{ type: 'Text', attrs: { x: 512, y: 320, text: 'Subtitle or description', fontSize: 28, fill: '#94a3b8', align: 'center', offsetX: 140 } },
		],
		background: '#1e3a5f',
	},
	{
		id: 'title-content',
		name: 'Title & Content',
		bgColor: '#ffffff',
		preview: () => h('div', { class: 'flex-1 flex flex-col' }, [
			h('div', { class: 'w-2/3 h-2 bg-gray-800 rounded mb-3' }),
			h('div', { class: 'flex-1 flex flex-col space-y-1' }, [
				h('div', { class: 'w-full h-1.5 bg-gray-300 rounded' }),
				h('div', { class: 'w-5/6 h-1.5 bg-gray-300 rounded' }),
				h('div', { class: 'w-4/5 h-1.5 bg-gray-300 rounded' }),
			]),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 60, y: 50, text: 'Slide Title', fontSize: 42, fontStyle: 'bold', fill: '#111827' } },
			{ type: 'Text', attrs: { x: 60, y: 130, text: '• First point goes here\n• Second point with details\n• Third important item\n• Additional content', fontSize: 24, fill: '#374151', lineHeight: 1.8 } },
		],
		background: '#ffffff',
	},
	{
		id: 'two-column',
		name: 'Two Columns',
		bgColor: '#ffffff',
		preview: () => h('div', { class: 'flex-1 flex flex-col' }, [
			h('div', { class: 'w-1/2 h-2 bg-gray-800 rounded mb-3' }),
			h('div', { class: 'flex-1 flex space-x-2' }, [
				h('div', { class: 'flex-1 bg-gray-100 rounded p-1' }, [
					h('div', { class: 'w-full h-1 bg-gray-300 rounded mb-1' }),
					h('div', { class: 'w-3/4 h-1 bg-gray-300 rounded' }),
				]),
				h('div', { class: 'flex-1 bg-gray-100 rounded p-1' }, [
					h('div', { class: 'w-full h-1 bg-gray-300 rounded mb-1' }),
					h('div', { class: 'w-3/4 h-1 bg-gray-300 rounded' }),
				]),
			]),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 60, y: 50, text: 'Two Column Layout', fontSize: 42, fontStyle: 'bold', fill: '#111827' } },
			{ type: 'Rect', attrs: { x: 60, y: 120, width: 440, height: 400, fill: '#f3f4f6', cornerRadius: 8 } },
			{ type: 'Text', attrs: { x: 80, y: 140, text: 'Left Column\n\nContent here...', fontSize: 20, fill: '#374151', width: 400 } },
			{ type: 'Rect', attrs: { x: 524, y: 120, width: 440, height: 400, fill: '#f3f4f6', cornerRadius: 8 } },
			{ type: 'Text', attrs: { x: 544, y: 140, text: 'Right Column\n\nContent here...', fontSize: 20, fill: '#374151', width: 400 } },
		],
		background: '#ffffff',
	},
	{
		id: 'image-left',
		name: 'Image Left',
		bgColor: '#ffffff',
		preview: () => h('div', { class: 'flex-1 flex space-x-2' }, [
			h('div', { class: 'w-1/2 bg-blue-100 rounded flex items-center justify-center' }, [
				h('div', { class: 'w-6 h-6 border-2 border-blue-300 rounded' }),
			]),
			h('div', { class: 'w-1/2 flex flex-col justify-center space-y-1' }, [
				h('div', { class: 'w-full h-2 bg-gray-800 rounded' }),
				h('div', { class: 'w-3/4 h-1 bg-gray-300 rounded' }),
				h('div', { class: 'w-5/6 h-1 bg-gray-300 rounded' }),
			]),
		]),
		elements: [
			{ type: 'Rect', attrs: { x: 60, y: 88, width: 440, height: 400, fill: '#e0e7ff', stroke: '#c7d2fe', strokeWidth: 2, cornerRadius: 8 } },
			{ type: 'Text', attrs: { x: 200, y: 270, text: 'Image', fontSize: 24, fill: '#6366f1' } },
			{ type: 'Text', attrs: { x: 540, y: 150, text: 'Content Title', fontSize: 36, fontStyle: 'bold', fill: '#111827' } },
			{ type: 'Text', attrs: { x: 540, y: 210, text: 'Description text goes here.\nAdd your content and\nexplanations.', fontSize: 20, fill: '#6b7280', lineHeight: 1.6 } },
		],
		background: '#ffffff',
	},
	{
		id: 'image-right',
		name: 'Image Right',
		bgColor: '#ffffff',
		preview: () => h('div', { class: 'flex-1 flex space-x-2' }, [
			h('div', { class: 'w-1/2 flex flex-col justify-center space-y-1' }, [
				h('div', { class: 'w-full h-2 bg-gray-800 rounded' }),
				h('div', { class: 'w-3/4 h-1 bg-gray-300 rounded' }),
				h('div', { class: 'w-5/6 h-1 bg-gray-300 rounded' }),
			]),
			h('div', { class: 'w-1/2 bg-green-100 rounded flex items-center justify-center' }, [
				h('div', { class: 'w-6 h-6 border-2 border-green-300 rounded' }),
			]),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 60, y: 150, text: 'Content Title', fontSize: 36, fontStyle: 'bold', fill: '#111827' } },
			{ type: 'Text', attrs: { x: 60, y: 210, text: 'Description text goes here.\nAdd your content and\nexplanations.', fontSize: 20, fill: '#6b7280', lineHeight: 1.6 } },
			{ type: 'Rect', attrs: { x: 524, y: 88, width: 440, height: 400, fill: '#d1fae5', stroke: '#a7f3d0', strokeWidth: 2, cornerRadius: 8 } },
			{ type: 'Text', attrs: { x: 680, y: 270, text: 'Image', fontSize: 24, fill: '#10b981' } },
		],
		background: '#ffffff',
	},
	{
		id: 'quote',
		name: 'Quote',
		bgColor: '#fef3c7',
		preview: () => h('div', { class: 'flex-1 flex flex-col items-center justify-center' }, [
			h('div', { class: 'text-2xl text-amber-600 mb-1' }, '"'),
			h('div', { class: 'w-3/4 h-2 bg-amber-800/60 rounded mb-1' }),
			h('div', { class: 'w-1/2 h-2 bg-amber-800/60 rounded mb-2' }),
			h('div', { class: 'w-1/4 h-1.5 bg-amber-600/40 rounded' }),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 512, y: 180, text: '"', fontSize: 120, fill: '#d97706', align: 'center', offsetX: 20 } },
			{ type: 'Text', attrs: { x: 512, y: 280, text: 'Your inspiring quote goes here.\nMake it memorable.', fontSize: 32, fill: '#78350f', align: 'center', offsetX: 220, fontStyle: 'italic' } },
			{ type: 'Text', attrs: { x: 512, y: 420, text: '— Author Name', fontSize: 20, fill: '#92400e', align: 'center', offsetX: 70 } },
		],
		background: '#fef3c7',
	},
	{
		id: 'section',
		name: 'Section Break',
		bgColor: '#3b82f6',
		preview: () => h('div', { class: 'flex-1 flex items-center justify-center' }, [
			h('div', { class: 'w-1/2 h-3 bg-white/90 rounded' }),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 512, y: 270, text: 'Section Title', fontSize: 56, fontStyle: 'bold', fill: '#ffffff', align: 'center', offsetX: 170 } },
		],
		background: '#3b82f6',
	},
	{
		id: 'comparison',
		name: 'Comparison',
		bgColor: '#ffffff',
		preview: () => h('div', { class: 'flex-1 flex flex-col' }, [
			h('div', { class: 'w-1/2 h-2 bg-gray-800 rounded mb-2 mx-auto' }),
			h('div', { class: 'flex-1 flex space-x-2' }, [
				h('div', { class: 'flex-1 bg-green-100 rounded p-1 flex flex-col items-center' }, [
					h('div', { class: 'w-4 h-4 bg-green-500 rounded-full mb-1' }),
					h('div', { class: 'w-3/4 h-1 bg-green-300 rounded' }),
				]),
				h('div', { class: 'flex-1 bg-red-100 rounded p-1 flex flex-col items-center' }, [
					h('div', { class: 'w-4 h-4 bg-red-500 rounded-full mb-1' }),
					h('div', { class: 'w-3/4 h-1 bg-red-300 rounded' }),
				]),
			]),
		]),
		elements: [
			{ type: 'Text', attrs: { x: 512, y: 40, text: 'Comparison', fontSize: 42, fontStyle: 'bold', fill: '#111827', align: 'center', offsetX: 100 } },
			{ type: 'Rect', attrs: { x: 60, y: 100, width: 440, height: 420, fill: '#d1fae5', cornerRadius: 12 } },
			{ type: 'Circle', attrs: { x: 280, y: 160, radius: 30, fill: '#10b981' } },
			{ type: 'Text', attrs: { x: 265, y: 150, text: '✓', fontSize: 32, fill: '#ffffff' } },
			{ type: 'Text', attrs: { x: 280, y: 210, text: 'Pros', fontSize: 28, fontStyle: 'bold', fill: '#065f46', align: 'center', offsetX: 30 } },
			{ type: 'Text', attrs: { x: 80, y: 260, text: '• Advantage one\n• Advantage two\n• Advantage three', fontSize: 18, fill: '#047857', lineHeight: 1.8 } },
			{ type: 'Rect', attrs: { x: 524, y: 100, width: 440, height: 420, fill: '#fee2e2', cornerRadius: 12 } },
			{ type: 'Circle', attrs: { x: 744, y: 160, radius: 30, fill: '#ef4444' } },
			{ type: 'Text', attrs: { x: 733, y: 150, text: '✗', fontSize: 32, fill: '#ffffff' } },
			{ type: 'Text', attrs: { x: 744, y: 210, text: 'Cons', fontSize: 28, fontStyle: 'bold', fill: '#991b1b', align: 'center', offsetX: 30 } },
			{ type: 'Text', attrs: { x: 544, y: 260, text: '• Disadvantage one\n• Disadvantage two\n• Disadvantage three', fontSize: 18, fill: '#dc2626', lineHeight: 1.8 } },
		],
		background: '#ffffff',
	},
]

function applyTemplate(template) {
	selectedTemplate.value = template.id
	emit('apply', template)
	emit('close')
}
</script>
