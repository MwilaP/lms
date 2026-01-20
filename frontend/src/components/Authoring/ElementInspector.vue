<template>
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<div class="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
					<component :is="elementIcon" class="w-3.5 h-3.5 text-blue-600" />
				</div>
				<span class="text-sm font-medium text-ink-gray-8">{{ elementType }}</span>
			</div>
			<Button variant="ghost" size="sm" @click="$emit('delete')">
				<template #icon>
					<Trash2 class="w-4 h-4 text-ink-red-4" />
				</template>
			</Button>
		</div>

		<!-- Element ID -->
		<div class="space-y-1">
			<label class="text-xs text-ink-gray-5">{{ __('Element ID') }}</label>
			<input
				type="text"
				:value="element.id || ''"
				@input="updateAttr('id', $event.target.value)"
				class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
				placeholder="element-id"
			/>
		</div>

		<!-- Transform Section -->
		<div class="space-y-3 p-3 bg-surface-gray-1 rounded-lg">
			<div class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide flex items-center">
				<Move class="w-3 h-3 mr-1.5" />
				{{ __('Transform') }}
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-xs text-ink-gray-5">X</label>
					<input
						type="number"
						:value="Math.round(element.x || 0)"
						@input="updateAttr('x', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label class="text-xs text-ink-gray-5">Y</label>
					<input
						type="number"
						:value="Math.round(element.y || 0)"
						@input="updateAttr('y', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div v-if="element.width !== undefined">
					<label class="text-xs text-ink-gray-5">W</label>
					<input
						type="number"
						:value="Math.round(element.width || 0)"
						@input="updateAttr('width', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div v-if="element.height !== undefined">
					<label class="text-xs text-ink-gray-5">H</label>
					<input
						type="number"
						:value="Math.round(element.height || 0)"
						@input="updateAttr('height', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div v-if="element.radius !== undefined">
					<label class="text-xs text-ink-gray-5">{{ __('Radius') }}</label>
					<input
						type="number"
						:value="Math.round(element.radius || 0)"
						@input="updateAttr('radius', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label class="text-xs text-ink-gray-5">{{ __('Rotation') }}</label>
					<div class="flex items-center space-x-1">
						<input
							type="number"
							:value="Math.round(element.rotation || 0)"
							@input="updateAttr('rotation', parseFloat($event.target.value))"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						<span class="text-xs text-ink-gray-4">°</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Text Section -->
		<div v-if="isText" class="space-y-3 p-3 bg-surface-gray-1 rounded-lg">
			<div class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide flex items-center">
				<Type class="w-3 h-3 mr-1.5" />
				{{ __('Text') }}
			</div>
			<textarea
				:value="element.text || ''"
				@input="updateAttr('text', $event.target.value)"
				rows="3"
				class="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
			></textarea>
			
			<!-- Font Family -->
			<div>
				<label class="text-xs text-ink-gray-5">{{ __('Font') }}</label>
				<select
					:value="element.fontFamily || 'Arial'"
					@change="updateAttr('fontFamily', $event.target.value)"
					class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
				>
					<option value="Arial">Arial</option>
					<option value="Helvetica">Helvetica</option>
					<option value="Times New Roman">Times New Roman</option>
					<option value="Georgia">Georgia</option>
					<option value="Verdana">Verdana</option>
					<option value="Courier New">Courier New</option>
					<option value="Impact">Impact</option>
				</select>
			</div>

			<!-- Font Size & Style -->
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-xs text-ink-gray-5">{{ __('Size') }}</label>
					<input
						type="number"
						:value="element.fontSize || 16"
						@input="updateAttr('fontSize', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						min="8"
						max="200"
					/>
				</div>
				<div>
					<label class="text-xs text-ink-gray-5">{{ __('Line Height') }}</label>
					<input
						type="number"
						:value="element.lineHeight || 1.2"
						@input="updateAttr('lineHeight', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						min="0.5"
						max="3"
						step="0.1"
					/>
				</div>
			</div>

			<!-- Text Style Buttons -->
			<div class="flex items-center space-x-1">
				<button
					class="p-1.5 rounded transition-colors"
					:class="element.fontStyle === 'bold' || element.fontStyle?.includes('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-surface-gray-2 text-ink-gray-6'"
					@click="toggleFontStyle('bold')"
					title="Bold"
				>
					<Bold class="w-4 h-4" />
				</button>
				<button
					class="p-1.5 rounded transition-colors"
					:class="element.fontStyle === 'italic' || element.fontStyle?.includes('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-surface-gray-2 text-ink-gray-6'"
					@click="toggleFontStyle('italic')"
					title="Italic"
				>
					<Italic class="w-4 h-4" />
				</button>
				<button
					class="p-1.5 rounded transition-colors"
					:class="element.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-surface-gray-2 text-ink-gray-6'"
					@click="updateAttr('textDecoration', element.textDecoration === 'underline' ? '' : 'underline')"
					title="Underline"
				>
					<Underline class="w-4 h-4" />
				</button>
				<div class="w-px h-5 bg-outline-gray-2 mx-1"></div>
				<button
					class="p-1.5 rounded transition-colors"
					:class="element.align === 'left' || !element.align ? 'bg-blue-100 text-blue-600' : 'hover:bg-surface-gray-2 text-ink-gray-6'"
					@click="updateAttr('align', 'left')"
					title="Align Left"
				>
					<AlignLeft class="w-4 h-4" />
				</button>
				<button
					class="p-1.5 rounded transition-colors"
					:class="element.align === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-surface-gray-2 text-ink-gray-6'"
					@click="updateAttr('align', 'center')"
					title="Align Center"
				>
					<AlignCenter class="w-4 h-4" />
				</button>
				<button
					class="p-1.5 rounded transition-colors"
					:class="element.align === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-surface-gray-2 text-ink-gray-6'"
					@click="updateAttr('align', 'right')"
					title="Align Right"
				>
					<AlignRight class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Appearance Section -->
		<div class="space-y-3 p-3 bg-surface-gray-1 rounded-lg">
			<div class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide flex items-center">
				<Palette class="w-3 h-3 mr-1.5" />
				{{ __('Appearance') }}
			</div>
			
			<!-- Fill Color -->
			<div>
				<label class="text-xs text-ink-gray-5">{{ __('Fill Color') }}</label>
				<div class="flex items-center space-x-2 mt-1">
					<input
						type="color"
						:value="element.fill || '#ffffff'"
						@input="updateAttr('fill', $event.target.value)"
						class="w-8 h-8 rounded border cursor-pointer"
					/>
					<input
						type="text"
						:value="element.fill || ''"
						@input="updateAttr('fill', $event.target.value)"
						class="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
						placeholder="#hex"
					/>
					<button
						class="p-1.5 rounded hover:bg-surface-gray-2"
						@click="updateAttr('fill', 'transparent')"
						title="No Fill"
					>
						<Ban class="w-4 h-4 text-ink-gray-5" />
					</button>
				</div>
			</div>

			<!-- Stroke -->
			<div v-if="hasStroke">
				<label class="text-xs text-ink-gray-5">{{ __('Stroke Color') }}</label>
				<div class="flex items-center space-x-2 mt-1">
					<input
						type="color"
						:value="element.stroke || '#000000'"
						@input="updateAttr('stroke', $event.target.value)"
						class="w-8 h-8 rounded border cursor-pointer"
					/>
					<input
						type="text"
						:value="element.stroke || ''"
						@input="updateAttr('stroke', $event.target.value)"
						class="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
						placeholder="#hex"
					/>
					<button
						class="p-1.5 rounded hover:bg-surface-gray-2"
						@click="updateAttr('stroke', '')"
						title="No Stroke"
					>
						<Ban class="w-4 h-4 text-ink-gray-5" />
					</button>
				</div>
			</div>

			<!-- Stroke Width -->
			<div v-if="hasStroke" class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-xs text-ink-gray-5">{{ __('Stroke Width') }}</label>
					<input
						type="number"
						:value="element.strokeWidth || 0"
						@input="updateAttr('strokeWidth', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						min="0"
						step="0.5"
					/>
				</div>
				<div>
					<label class="text-xs text-ink-gray-5">{{ __('Corner Radius') }}</label>
					<input
						type="number"
						:value="element.cornerRadius || 0"
						@input="updateAttr('cornerRadius', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						min="0"
					/>
				</div>
			</div>

			<!-- Opacity -->
			<div>
				<div class="flex items-center justify-between">
					<label class="text-xs text-ink-gray-5">{{ __('Opacity') }}</label>
					<span class="text-xs text-ink-gray-5">{{ Math.round((element.opacity ?? 1) * 100) }}%</span>
				</div>
				<input
					type="range"
					:value="(element.opacity ?? 1) * 100"
					@input="updateAttr('opacity', parseFloat($event.target.value) / 100)"
					class="w-full mt-1"
					min="0"
					max="100"
				/>
			</div>

			<!-- Shadow -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label class="text-xs text-ink-gray-5">{{ __('Shadow') }}</label>
					<input
						type="checkbox"
						:checked="element.shadowEnabled"
						@change="updateAttr('shadowEnabled', $event.target.checked)"
						class="rounded"
					/>
				</div>
				<div v-if="element.shadowEnabled" class="grid grid-cols-3 gap-2">
					<div>
						<label class="text-xs text-ink-gray-5">X</label>
						<input
							type="number"
							:value="element.shadowOffsetX || 0"
							@input="updateAttr('shadowOffsetX', parseFloat($event.target.value))"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label class="text-xs text-ink-gray-5">Y</label>
						<input
							type="number"
							:value="element.shadowOffsetY || 0"
							@input="updateAttr('shadowOffsetY', parseFloat($event.target.value))"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label class="text-xs text-ink-gray-5">{{ __('Blur') }}</label>
						<input
							type="number"
							:value="element.shadowBlur || 0"
							@input="updateAttr('shadowBlur', parseFloat($event.target.value))"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							min="0"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from 'frappe-ui'
import {
	Trash2,
	Square,
	Circle,
	Type,
	Image as ImageIcon,
	Minus,
	Star,
	Triangle,
	Move,
	Palette,
	Bold,
	Italic,
	Underline,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Ban,
} from 'lucide-vue-next'

const props = defineProps({
	element: {
		type: Object,
		required: true,
	},
})

const emit = defineEmits(['update', 'delete'])

const elementType = computed(() => {
	const className = props.element.className || props.element._node?.className?.() || 'Element'
	return className.replace('Konva.', '')
})

const elementIcon = computed(() => {
	const icons = {
		Rect: Square,
		Circle: Circle,
		Text: Type,
		Image: ImageIcon,
		Line: Minus,
		Arrow: Minus,
		Star: Star,
		RegularPolygon: Triangle,
	}
	return icons[elementType.value] || Square
})

const isText = computed(() => {
	return elementType.value === 'Text'
})

const hasSize = computed(() => {
	return props.element.width !== undefined || props.element.height !== undefined || props.element.radius !== undefined
})

const hasStroke = computed(() => {
	return props.element.stroke !== undefined || ['Rect', 'Circle', 'Ellipse', 'Line', 'Arrow', 'Path', 'RegularPolygon', 'Star'].includes(elementType.value)
})

function updateAttr(key, value) {
	emit('update', { [key]: value })
}

function toggleFontStyle(style) {
	const current = props.element.fontStyle || 'normal'
	let newStyle = current
	
	if (style === 'bold') {
		if (current.includes('bold')) {
			newStyle = current.replace('bold', '').trim() || 'normal'
		} else {
			newStyle = current === 'normal' ? 'bold' : `${current} bold`
		}
	} else if (style === 'italic') {
		if (current.includes('italic')) {
			newStyle = current.replace('italic', '').trim() || 'normal'
		} else {
			newStyle = current === 'normal' ? 'italic' : `${current} italic`
		}
	}
	
	emit('update', { fontStyle: newStyle })
}
</script>
