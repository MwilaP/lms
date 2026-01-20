<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-ink-gray-8">
				{{ elementType }}
			</span>
			<Button variant="ghost" size="sm" @click="$emit('delete')">
				<template #icon>
					<Trash2 class="w-4 h-4 text-ink-red-4" />
				</template>
			</Button>
		</div>

		<div class="space-y-3">
			<div class="text-xs font-medium text-ink-gray-5 uppercase tracking-wide">
				{{ __('Position') }}
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
			</div>
		</div>

		<div v-if="hasSize" class="space-y-3">
			<div class="text-xs font-medium text-ink-gray-5 uppercase tracking-wide">
				{{ __('Size') }}
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div v-if="element.width !== undefined">
					<label class="text-xs text-ink-gray-5">{{ __('Width') }}</label>
					<input
						type="number"
						:value="Math.round(element.width || 0)"
						@input="updateAttr('width', parseFloat($event.target.value))"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div v-if="element.height !== undefined">
					<label class="text-xs text-ink-gray-5">{{ __('Height') }}</label>
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
			</div>
		</div>

		<div v-if="element.rotation !== undefined" class="space-y-3">
			<div class="text-xs font-medium text-ink-gray-5 uppercase tracking-wide">
				{{ __('Rotation') }}
			</div>
			<div>
				<input
					type="number"
					:value="Math.round(element.rotation || 0)"
					@input="updateAttr('rotation', parseFloat($event.target.value))"
					class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>
		</div>

		<div v-if="isText" class="space-y-3">
			<div class="text-xs font-medium text-ink-gray-5 uppercase tracking-wide">
				{{ __('Text') }}
			</div>
			<textarea
				:value="element.text || ''"
				@input="updateAttr('text', $event.target.value)"
				rows="3"
				class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
			></textarea>
			<div>
				<label class="text-xs text-ink-gray-5">{{ __('Font Size') }}</label>
				<input
					type="number"
					:value="element.fontSize || 16"
					@input="updateAttr('fontSize', parseFloat($event.target.value))"
					class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>
		</div>

		<div class="space-y-3">
			<div class="text-xs font-medium text-ink-gray-5 uppercase tracking-wide">
				{{ __('Appearance') }}
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-xs text-ink-gray-5">{{ __('Fill') }}</label>
					<div class="flex items-center space-x-2">
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
							class="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							placeholder="#hex"
						/>
					</div>
				</div>
				<div v-if="hasStroke">
					<label class="text-xs text-ink-gray-5">{{ __('Stroke') }}</label>
					<div class="flex items-center space-x-2">
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
							class="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							placeholder="#hex"
						/>
					</div>
				</div>
			</div>
			<div v-if="hasStroke">
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
				<label class="text-xs text-ink-gray-5">{{ __('Opacity') }}</label>
				<input
					type="range"
					:value="(element.opacity ?? 1) * 100"
					@input="updateAttr('opacity', parseFloat($event.target.value) / 100)"
					class="w-full"
					min="0"
					max="100"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from 'frappe-ui'
import { Trash2 } from 'lucide-vue-next'

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

const isText = computed(() => {
	return elementType.value === 'Text'
})

const hasSize = computed(() => {
	return props.element.width !== undefined || props.element.height !== undefined || props.element.radius !== undefined
})

const hasStroke = computed(() => {
	return props.element.stroke !== undefined || ['Rect', 'Circle', 'Ellipse', 'Line', 'Path'].includes(elementType.value)
})

function updateAttr(key, value) {
	emit('update', { [key]: value })
}
</script>
