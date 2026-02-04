<template>
	<div class="color-picker">
		<div class="flex items-center space-x-2">
			<!-- Color preview swatch -->
			<div class="relative">
				<button
					type="button"
					class="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden"
					:style="{ backgroundColor: modelValue || '#ffffff' }"
					@click="showPicker = !showPicker"
					:title="modelValue || 'Choose color'"
				>
					<div v-if="!modelValue" class="absolute inset-0 flex items-center justify-center">
						<div class="w-8 h-0.5 bg-red-500 rotate-45"></div>
					</div>
				</button>
				
				<!-- Color picker popover -->
				<Transition
					enter-active-class="transition-all duration-150 ease-out"
					enter-from-class="opacity-0 scale-95 -translate-y-2"
					enter-to-class="opacity-100 scale-100 translate-y-0"
					leave-active-class="transition-all duration-100 ease-in"
					leave-from-class="opacity-100 scale-100"
					leave-to-class="opacity-0 scale-95"
				>
					<div
						v-if="showPicker"
						v-click-outside="() => showPicker = false"
						class="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200"
						:class="position === 'left' ? 'right-0' : 'left-0'"
					>
						<!-- Native color input -->
						<div class="mb-3">
							<input
								type="color"
								:value="modelValue || '#ffffff'"
								@input="handleColorChange($event.target.value)"
								class="w-full h-32 rounded cursor-pointer border border-gray-300"
							/>
						</div>
						
						<!-- Hex input -->
						<div class="mb-3">
							<label class="text-xs text-gray-600 mb-1 block">Hex Color</label>
							<div class="flex items-center space-x-1">
								<span class="text-sm text-gray-500">#</span>
								<input
									type="text"
									:value="(modelValue || '#ffffff').replace('#', '')"
									@input="handleHexInput($event.target.value)"
									maxlength="6"
									class="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
									placeholder="FFFFFF"
								/>
							</div>
						</div>
						
						<!-- Recent colors -->
						<div v-if="recentColors.length > 0" class="mb-3">
							<label class="text-xs text-gray-600 mb-1 block">Recent</label>
							<div class="grid grid-cols-6 gap-1">
								<button
									v-for="(color, idx) in recentColors"
									:key="idx"
									type="button"
									class="w-7 h-7 rounded border border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
									:style="{ backgroundColor: color }"
									@click="handleColorChange(color)"
									:title="color"
								></button>
							</div>
						</div>
						
						<!-- Preset colors -->
						<div>
							<label class="text-xs text-gray-600 mb-1 block">Presets</label>
							<div class="grid grid-cols-6 gap-1">
								<button
									v-for="color in presetColors"
									:key="color"
									type="button"
									class="w-7 h-7 rounded border border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
									:style="{ backgroundColor: color }"
									@click="handleColorChange(color)"
									:title="color"
								></button>
							</div>
						</div>
						
						<!-- Transparent option -->
						<div v-if="allowTransparent" class="mt-3 pt-3 border-t">
							<button
								type="button"
								class="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center space-x-2"
								@click="handleColorChange(null)"
							>
								<X class="w-4 h-4" />
								<span>Transparent</span>
							</button>
						</div>
					</div>
				</Transition>
			</div>
			
			<!-- Hex display -->
			<div class="flex-1">
				<input
					type="text"
					:value="modelValue || ''"
					@input="handleHexInput($event.target.value.replace('#', ''))"
					class="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
					:placeholder="placeholder"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
	modelValue: {
		type: String,
		default: null,
	},
	allowTransparent: {
		type: Boolean,
		default: false,
	},
	position: {
		type: String,
		default: 'left', // 'left' or 'right'
	},
	placeholder: {
		type: String,
		default: '#FFFFFF',
	},
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const recentColors = ref([])

const presetColors = [
	'#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280',
	'#374151', '#1F2937', '#111827', '#000000', '#EF4444', '#F59E0B',
	'#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
	'#FEF3C7', '#DBEAFE', '#D1FAE5', '#E0E7FF', '#FCE7F3', '#FEE2E2',
]

function handleColorChange(color) {
	emit('update:modelValue', color)
	showPicker.value = false
	
	// Add to recent colors
	if (color && !recentColors.value.includes(color)) {
		recentColors.value.unshift(color)
		if (recentColors.value.length > 12) {
			recentColors.value.pop()
		}
		// Save to localStorage
		try {
			localStorage.setItem('lms-recent-colors', JSON.stringify(recentColors.value))
		} catch (e) {
			// Ignore localStorage errors
		}
	}
}

function handleHexInput(value) {
	let hex = value.replace(/[^0-9A-Fa-f]/g, '')
	if (hex.length === 6) {
		handleColorChange('#' + hex.toUpperCase())
	} else if (hex.length === 3) {
		// Expand shorthand hex (e.g., "F00" -> "FF0000")
		hex = hex.split('').map(c => c + c).join('')
		handleColorChange('#' + hex.toUpperCase())
	}
}

// Load recent colors from localStorage
try {
	const saved = localStorage.getItem('lms-recent-colors')
	if (saved) {
		recentColors.value = JSON.parse(saved)
	}
} catch (e) {
	// Ignore localStorage errors
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
</style>
