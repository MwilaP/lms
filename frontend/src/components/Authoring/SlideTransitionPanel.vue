<template>
	<div class="p-4 space-y-4">
		<h3 class="text-sm font-semibold text-ink-gray-8 flex items-center space-x-2">
			<Sparkles class="w-4 h-4 text-purple-500" />
			<span>{{ __('Slide Transition') }}</span>
		</h3>

		<!-- Transition Type -->
		<div class="space-y-2">
			<label class="text-xs font-medium text-ink-gray-6">{{ __('Effect') }}</label>
			<div class="grid grid-cols-3 gap-2">
				<button
					v-for="t in transitionTypes"
					:key="t.value"
					class="flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:border-purple-300"
					:class="transition.type === t.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'"
					@click="updateTransition('type', t.value)"
				>
					<component :is="t.icon" class="w-5 h-5 mb-1" :class="transition.type === t.value ? 'text-purple-600' : 'text-ink-gray-5'" />
					<span class="text-xs" :class="transition.type === t.value ? 'text-purple-700 font-medium' : 'text-ink-gray-6'">{{ t.label }}</span>
				</button>
			</div>
		</div>

		<!-- Direction (for directional transitions) -->
		<Transition
			enter-active-class="transition-all duration-200"
			enter-from-class="opacity-0 -translate-y-2"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition-all duration-150"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div v-if="hasDirection" class="space-y-2">
				<label class="text-xs font-medium text-ink-gray-6">{{ __('Direction') }}</label>
				<div class="flex items-center justify-center space-x-2">
					<button
						v-for="d in directions"
						:key="d.value"
						class="p-2 rounded-lg border-2 transition-all hover:border-purple-300"
						:class="transition.direction === d.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'"
						@click="updateTransition('direction', d.value)"
						:title="d.label"
					>
						<component :is="d.icon" class="w-4 h-4" :class="transition.direction === d.value ? 'text-purple-600' : 'text-ink-gray-5'" />
					</button>
				</div>
			</div>
		</Transition>

		<!-- Duration -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label class="text-xs font-medium text-ink-gray-6">{{ __('Duration') }}</label>
				<span class="text-xs text-ink-gray-5">{{ transition.duration }}s</span>
			</div>
			<input
				type="range"
				min="0.1"
				max="3"
				step="0.1"
				:value="transition.duration"
				@input="updateTransition('duration', parseFloat($event.target.value))"
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
			/>
			<div class="flex justify-between text-xs text-ink-gray-4">
				<span>0.1s</span>
				<span>3s</span>
			</div>
		</div>

		<!-- Preview Button -->
		<Button 
			variant="outline" 
			size="sm" 
			class="w-full"
			@click="previewTransition"
			:disabled="transition.type === 'none'"
		>
			<template #prefix>
				<Play class="w-3.5 h-3.5" />
			</template>
			{{ __('Preview Transition') }}
		</Button>

		<!-- Apply to All -->
		<div class="pt-2 border-t">
			<Button 
				variant="ghost" 
				size="sm" 
				class="w-full text-ink-gray-6"
				@click="$emit('apply-to-all', transition)"
			>
				<template #prefix>
					<Layers class="w-3.5 h-3.5" />
				</template>
				{{ __('Apply to All Slides') }}
			</Button>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { Button } from 'frappe-ui'
import {
	Sparkles,
	Play,
	Layers,
	// Transition icons
	CircleOff,
	Blend,
	ArrowRight,
	ArrowLeft,
	ArrowUp,
	ArrowDown,
	SplitSquareHorizontal,
	Minimize2,
	Maximize2,
} from 'lucide-vue-next'

const props = defineProps({
	modelValue: {
		type: Object,
		default: () => ({ type: 'none', direction: 'left', duration: 0.5 })
	}
})

const emit = defineEmits(['update:modelValue', 'preview', 'apply-to-all'])

const transition = reactive({
	type: props.modelValue?.type || 'none',
	direction: props.modelValue?.direction || 'left',
	duration: props.modelValue?.duration || 0.5,
})

// Sync with modelValue
watch(() => props.modelValue, (val) => {
	if (val) {
		transition.type = val.type || 'none'
		transition.direction = val.direction || 'left'
		transition.duration = val.duration || 0.5
	}
}, { deep: true })

const transitionTypes = [
	{ value: 'none', label: 'None', icon: CircleOff },
	{ value: 'fade', label: 'Fade', icon: Blend },
	{ value: 'slide', label: 'Slide', icon: ArrowRight },
	{ value: 'wipe', label: 'Wipe', icon: SplitSquareHorizontal },
	{ value: 'zoom-in', label: 'Zoom In', icon: Maximize2 },
	{ value: 'zoom-out', label: 'Zoom Out', icon: Minimize2 },
]

const directions = [
	{ value: 'left', label: 'From Left', icon: ArrowLeft },
	{ value: 'right', label: 'From Right', icon: ArrowRight },
	{ value: 'up', label: 'From Top', icon: ArrowUp },
	{ value: 'down', label: 'From Bottom', icon: ArrowDown },
]

const hasDirection = computed(() => {
	return ['slide', 'wipe'].includes(transition.type)
})

function updateTransition(key, value) {
	transition[key] = value
	emit('update:modelValue', { ...transition })
}

function previewTransition() {
	emit('preview', { ...transition })
}
</script>
