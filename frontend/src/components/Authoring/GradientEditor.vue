<template>
	<div class="gradient-editor space-y-4">
		<!-- Gradient Type Selector -->
		<div class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Gradient Type') }}</label>
			<div class="flex items-center space-x-2">
				<button
					v-for="type in gradientTypes"
					:key="type.value"
					type="button"
					class="flex-1 px-3 py-2 text-xs rounded-lg border transition-all flex items-center justify-center space-x-1.5"
					:class="gradientType === type.value 
						? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
						: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'"
					@click="gradientType = type.value"
				>
					<component :is="type.icon" class="w-3.5 h-3.5" />
					<span>{{ type.label }}</span>
				</button>
			</div>
		</div>

		<!-- Gradient Preview -->
		<div class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Preview') }}</label>
			<div
				class="w-full h-24 rounded-lg border-2 border-gray-300 shadow-inner"
				:style="{ background: gradientPreview }"
			></div>
		</div>

		<!-- Color Stops -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label class="text-xs text-ink-gray-6 font-medium">{{ __('Color Stops') }}</label>
				<button
					type="button"
					class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
					@click="addColorStop"
					:disabled="colorStops.length >= 5"
				>
					<Plus class="w-3 h-3" />
					<span>{{ __('Add') }}</span>
				</button>
			</div>
			
			<div class="space-y-2">
				<div
					v-for="(stop, index) in colorStops"
					:key="index"
					class="flex items-center space-x-2 p-2 bg-surface-gray-1 rounded-lg"
				>
					<!-- Color picker button -->
					<div class="relative">
						<button
							type="button"
							class="w-8 h-8 rounded border-2 border-gray-300 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
							:style="{ backgroundColor: stop.color }"
							@click="activeStopIndex = activeStopIndex === index ? null : index"
						></button>
						
						<!-- Mini color picker popover -->
						<Transition
							enter-active-class="transition-all duration-150 ease-out"
							enter-from-class="opacity-0 scale-95"
							enter-to-class="opacity-100 scale-100"
							leave-active-class="transition-all duration-100 ease-in"
							leave-from-class="opacity-100 scale-100"
							leave-to-class="opacity-0 scale-95"
						>
							<div
								v-if="activeStopIndex === index"
								v-click-outside="() => activeStopIndex = null"
								class="absolute z-50 mt-1 left-0 p-2 bg-white rounded-lg shadow-xl border border-gray-200"
							>
								<input
									type="color"
									:value="stop.color"
									@input="updateStopColor(index, $event.target.value)"
									class="w-32 h-24 rounded cursor-pointer border border-gray-300"
								/>
								<input
									type="text"
									:value="stop.color"
									@input="updateStopColor(index, $event.target.value)"
									class="w-full mt-2 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
								/>
							</div>
						</Transition>
					</div>
					
					<!-- Position slider -->
					<div class="flex-1">
						<input
							type="range"
							min="0"
							max="100"
							:value="stop.position"
							@input="updateStopPosition(index, parseInt($event.target.value))"
							class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
						/>
						<div class="text-xs text-ink-gray-5 text-center mt-0.5">{{ stop.position }}%</div>
					</div>
					
					<!-- Remove button -->
					<button
						type="button"
						class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
						@click="removeColorStop(index)"
						:disabled="colorStops.length <= 2"
						:title="__('Remove color stop')"
					>
						<Trash2 class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>

		<!-- Linear Gradient Angle -->
		<div v-if="gradientType === 'linear'" class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Angle') }}</label>
			<div class="flex items-center space-x-3">
				<input
					type="range"
					min="0"
					max="360"
					v-model.number="angle"
					class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
				/>
				<div class="flex items-center space-x-1">
					<input
						type="number"
						min="0"
						max="360"
						v-model.number="angle"
						class="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
					/>
					<span class="text-xs text-ink-gray-5">°</span>
				</div>
			</div>
			<!-- Visual angle indicator -->
			<div class="flex justify-center">
				<div class="relative w-16 h-16 rounded-full border-2 border-gray-300 bg-white">
					<div
						class="absolute top-1/2 left-1/2 w-0.5 h-6 bg-blue-600 origin-bottom"
						:style="{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }"
					></div>
					<div class="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
				</div>
			</div>
		</div>

		<!-- Radial Gradient Center (future enhancement) -->
		<div v-if="gradientType === 'radial'" class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Center Position') }}</label>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-xs text-ink-gray-5">X</label>
					<input
						type="number"
						min="0"
						max="100"
						v-model.number="centerX"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label class="text-xs text-ink-gray-5">Y</label>
					<input
						type="number"
						min="0"
						max="100"
						v-model.number="centerY"
						class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
			</div>
		</div>

		<!-- Gradient Presets -->
		<div class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Gradient Presets') }}</label>
			<div class="grid grid-cols-3 gap-2">
				<button
					v-for="preset in gradientPresets"
					:key="preset.name"
					type="button"
					class="h-12 rounded-lg border-2 hover:border-blue-400 transition-all hover:scale-105 shadow-sm"
					:style="{ background: preset.gradient }"
					@click="applyPreset(preset)"
					:title="preset.name"
				></button>
			</div>
		</div>

		<!-- Apply Button -->
		<button
			type="button"
			class="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
			@click="applyGradient"
		>
			<Check class="w-4 h-4" />
			<span>{{ __('Apply Gradient') }}</span>
		</button>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Trash2, Check, MoveVertical, Circle } from 'lucide-vue-next'

const props = defineProps({
	initialGradient: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['apply'])

const gradientType = ref('linear')
const angle = ref(90)
const centerX = ref(50)
const centerY = ref(50)
const activeStopIndex = ref(null)

const colorStops = ref([
	{ color: '#3B82F6', position: 0 },
	{ color: '#8B5CF6', position: 100 },
])

const gradientTypes = [
	{ value: 'linear', label: 'Linear', icon: MoveVertical },
	{ value: 'radial', label: 'Radial', icon: Circle },
]

const gradientPresets = [
	{
		name: 'Blue to Purple',
		gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#3B82F6', position: 0 },
			{ color: '#8B5CF6', position: 100 },
		],
	},
	{
		name: 'Sunset',
		gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#F59E0B', position: 0 },
			{ color: '#EF4444', position: 100 },
		],
	},
	{
		name: 'Ocean',
		gradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#06B6D4', position: 0 },
			{ color: '#3B82F6', position: 100 },
		],
	},
	{
		name: 'Forest',
		gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#10B981', position: 0 },
			{ color: '#059669', position: 100 },
		],
	},
	{
		name: 'Rose',
		gradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#EC4899', position: 0 },
			{ color: '#F43F5E', position: 100 },
		],
	},
	{
		name: 'Midnight',
		gradient: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#1F2937', position: 0 },
			{ color: '#111827', position: 100 },
		],
	},
	{
		name: 'Peach',
		gradient: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#FED7AA', position: 0 },
			{ color: '#FDBA74', position: 100 },
		],
	},
	{
		name: 'Lavender',
		gradient: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#DDD6FE', position: 0 },
			{ color: '#C4B5FD', position: 100 },
		],
	},
	{
		name: 'Mint',
		gradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
		type: 'linear',
		angle: 135,
		stops: [
			{ color: '#D1FAE5', position: 0 },
			{ color: '#A7F3D0', position: 100 },
		],
	},
]

const gradientPreview = computed(() => {
	const sortedStops = [...colorStops.value].sort((a, b) => a.position - b.position)
	const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')
	
	if (gradientType.value === 'linear') {
		return `linear-gradient(${angle.value}deg, ${stopsString})`
	} else {
		return `radial-gradient(circle at ${centerX.value}% ${centerY.value}%, ${stopsString})`
	}
})

function addColorStop() {
	if (colorStops.value.length >= 5) return
	
	// Add a new stop in the middle
	const newPosition = 50
	colorStops.value.push({
		color: '#6B7280',
		position: newPosition,
	})
	
	// Sort by position
	colorStops.value.sort((a, b) => a.position - b.position)
}

function removeColorStop(index) {
	if (colorStops.value.length <= 2) return
	colorStops.value.splice(index, 1)
}

function updateStopColor(index, color) {
	colorStops.value[index].color = color
}

function updateStopPosition(index, position) {
	colorStops.value[index].position = position
}

function applyPreset(preset) {
	gradientType.value = preset.type
	angle.value = preset.angle || 90
	colorStops.value = JSON.parse(JSON.stringify(preset.stops))
}

function applyGradient() {
	emit('apply', {
		type: gradientType.value,
		angle: angle.value,
		centerX: centerX.value,
		centerY: centerY.value,
		stops: colorStops.value,
		css: gradientPreview.value,
	})
}

// Initialize from prop if provided
if (props.initialGradient) {
	gradientType.value = props.initialGradient.type || 'linear'
	angle.value = props.initialGradient.angle || 90
	centerX.value = props.initialGradient.centerX || 50
	centerY.value = props.initialGradient.centerY || 50
	if (props.initialGradient.stops) {
		colorStops.value = JSON.parse(JSON.stringify(props.initialGradient.stops))
	}
}

// Click outside directive
const vClickOutside = {
	mounted(el, binding) {
		el.clickOutsideEvent = (event) => {
			if (!(el === event.target || el.contains(event.target))) {
				binding.value()
			}
		}
		document.addEventListener('click', el.clickOutsideEvent)
	},
	unmounted(el) {
		document.removeEventListener('click', el.clickOutsideEvent)
	},
}
</script>

<style scoped>
input[type="color"] {
	-webkit-appearance: none;
	border: none;
	cursor: pointer;
}
input[type="color"]::-webkit-color-swatch-wrapper {
	padding: 0;
}
input[type="color"]::-webkit-color-swatch {
	border: none;
	border-radius: 0.375rem;
}

.slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #3B82F6;
	cursor: pointer;
	border: 2px solid white;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #3B82F6;
	cursor: pointer;
	border: 2px solid white;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
