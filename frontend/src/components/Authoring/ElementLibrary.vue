<template>
	<div class="element-library">
		<!-- Collapse/Expand Toggle -->
		<div 
			class="flex items-center justify-between px-3 py-2 border-b cursor-pointer hover:bg-surface-gray-1 transition-colors"
			@click="isCollapsed = !isCollapsed"
		>
			<span class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide">
				{{ __('Elements') }}
			</span>
			<ChevronDown 
				class="w-4 h-4 text-ink-gray-5 transition-transform duration-200" 
				:class="{ 'rotate-180': isCollapsed }"
			/>
		</div>

		<Transition
			enter-active-class="transition-all duration-200 ease-out"
			enter-from-class="opacity-0 max-h-0"
			enter-to-class="opacity-100 max-h-[500px]"
			leave-active-class="transition-all duration-150 ease-in"
			leave-from-class="opacity-100 max-h-[500px]"
			leave-to-class="opacity-0 max-h-0"
		>
			<div v-show="!isCollapsed" class="overflow-hidden">
				<!-- Category: Shapes -->
				<div class="px-3 py-2">
					<div 
						class="flex items-center justify-between cursor-pointer mb-2"
						@click="toggleCategory('shapes')"
					>
						<span class="text-xs font-medium text-ink-gray-6">{{ __('Shapes') }}</span>
						<ChevronRight 
							class="w-3 h-3 text-ink-gray-4 transition-transform duration-150"
							:class="{ 'rotate-90': expandedCategories.shapes }"
						/>
					</div>
					<Transition
						enter-active-class="transition-all duration-150"
						enter-from-class="opacity-0 -translate-y-1"
						enter-to-class="opacity-100 translate-y-0"
						leave-active-class="transition-all duration-100"
						leave-from-class="opacity-100"
						leave-to-class="opacity-0"
					>
						<div v-show="expandedCategories.shapes" class="grid grid-cols-4 gap-1.5">
							<ElementItem
								v-for="item in shapeElements"
								:key="item.type"
								:item="item"
								:disabled="disabled"
								@add="$emit('add-element', item.type)"
							/>
						</div>
					</Transition>
				</div>

				<!-- Category: Text -->
				<div class="px-3 py-2 border-t">
					<div 
						class="flex items-center justify-between cursor-pointer mb-2"
						@click="toggleCategory('text')"
					>
						<span class="text-xs font-medium text-ink-gray-6">{{ __('Text') }}</span>
						<ChevronRight 
							class="w-3 h-3 text-ink-gray-4 transition-transform duration-150"
							:class="{ 'rotate-90': expandedCategories.text }"
						/>
					</div>
					<Transition
						enter-active-class="transition-all duration-150"
						enter-from-class="opacity-0 -translate-y-1"
						enter-to-class="opacity-100 translate-y-0"
						leave-active-class="transition-all duration-100"
						leave-from-class="opacity-100"
						leave-to-class="opacity-0"
					>
						<div v-show="expandedCategories.text" class="grid grid-cols-4 gap-1.5">
							<ElementItem
								v-for="item in textElements"
								:key="item.type"
								:item="item"
								:disabled="disabled"
								@add="$emit('add-element', item.type)"
							/>
						</div>
					</Transition>
				</div>

				<!-- Category: Media -->
				<div class="px-3 py-2 border-t">
					<div 
						class="flex items-center justify-between cursor-pointer mb-2"
						@click="toggleCategory('media')"
					>
						<span class="text-xs font-medium text-ink-gray-6">{{ __('Media') }}</span>
						<ChevronRight 
							class="w-3 h-3 text-ink-gray-4 transition-transform duration-150"
							:class="{ 'rotate-90': expandedCategories.media }"
						/>
					</div>
					<Transition
						enter-active-class="transition-all duration-150"
						enter-from-class="opacity-0 -translate-y-1"
						enter-to-class="opacity-100 translate-y-0"
						leave-active-class="transition-all duration-100"
						leave-from-class="opacity-100"
						leave-to-class="opacity-0"
					>
						<div v-show="expandedCategories.media" class="grid grid-cols-4 gap-1.5">
							<ElementItem
								v-for="item in mediaElements"
								:key="item.type"
								:item="item"
								:disabled="disabled"
								@add="handleMediaAdd(item)"
							/>
						</div>
					</Transition>
				</div>

				<!-- Quick Layouts -->
				<div class="px-3 py-2 border-t">
					<div 
						class="flex items-center justify-between cursor-pointer mb-2"
						@click="toggleCategory('layouts')"
					>
						<span class="text-xs font-medium text-ink-gray-6">{{ __('Quick Layouts') }}</span>
						<ChevronRight 
							class="w-3 h-3 text-ink-gray-4 transition-transform duration-150"
							:class="{ 'rotate-90': expandedCategories.layouts }"
						/>
					</div>
					<Transition
						enter-active-class="transition-all duration-150"
						enter-from-class="opacity-0 -translate-y-1"
						enter-to-class="opacity-100 translate-y-0"
						leave-active-class="transition-all duration-100"
						leave-from-class="opacity-100"
						leave-to-class="opacity-0"
					>
						<div v-show="expandedCategories.layouts" class="space-y-1.5">
							<button
								v-for="layout in quickLayouts"
								:key="layout.id"
								class="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors"
								:class="disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-700'"
								:disabled="disabled"
								@click="$emit('apply-layout', layout)"
							>
								<component :is="layout.icon" class="w-4 h-4 text-ink-gray-5" />
								<span class="text-xs text-ink-gray-7">{{ layout.name }}</span>
							</button>
						</div>
					</Transition>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
	ChevronDown,
	ChevronRight,
	Square,
	Circle,
	Triangle,
	Star,
	Minus,
	ArrowRight,
	Type,
	Heading,
	Image as ImageIcon,
	LayoutTemplate,
	Columns,
	LayoutList,
	Quote,
	RectangleHorizontal,
} from 'lucide-vue-next'

import ElementItem from './ElementItem.vue'

defineProps({
	disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['add-element', 'apply-layout', 'image-upload'])

const isCollapsed = ref(false)
const expandedCategories = reactive({
	shapes: true,
	text: true,
	media: true,
	layouts: false,
})

function toggleCategory(category) {
	expandedCategories[category] = !expandedCategories[category]
}

const shapeElements = [
	{ type: 'rect', icon: Square, label: 'Rectangle' },
	{ type: 'roundedRect', icon: RectangleHorizontal, label: 'Rounded' },
	{ type: 'circle', icon: Circle, label: 'Circle' },
	{ type: 'triangle', icon: Triangle, label: 'Triangle' },
	{ type: 'star', icon: Star, label: 'Star' },
	{ type: 'line', icon: Minus, label: 'Line' },
	{ type: 'arrow', icon: ArrowRight, label: 'Arrow' },
]

const textElements = [
	{ type: 'heading', icon: Heading, label: 'Heading' },
	{ type: 'text', icon: Type, label: 'Text' },
]

const mediaElements = [
	{ type: 'image', icon: ImageIcon, label: 'Image' },
]

const quickLayouts = [
	{ id: 'title-content', name: 'Title + Content', icon: LayoutList },
	{ id: 'two-column', name: 'Two Columns', icon: Columns },
	{ id: 'image-left', name: 'Image + Text', icon: LayoutTemplate },
	{ id: 'quote', name: 'Quote', icon: Quote },
]

function handleMediaAdd(item) {
	if (item.type === 'image') {
		emit('image-upload')
	} else {
		emit('add-element', item.type)
	}
}
</script>

<style scoped>
.element-library {
	border-bottom: 1px solid var(--gray-200, #e5e7eb);
}
</style>
