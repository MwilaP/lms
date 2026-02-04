<template>
	<div class="background-image-picker space-y-4">
		<!-- Current Background Image Preview -->
		<div v-if="currentImageUrl" class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Current Background') }}</label>
			<div class="relative rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
				<img
					:src="currentImageUrl"
					alt="Background"
					class="w-full h-32 object-cover"
				/>
				<button
					type="button"
					class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
					@click="removeBackground"
					:title="__('Remove background image')"
				>
					<Trash2 class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Upload Button -->
		<div class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">
				{{ currentImageUrl ? __('Change Background Image') : __('Upload Background Image') }}
			</label>
			<label class="flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
				<Upload class="w-4 h-4 mr-2" />
				{{ __('Choose Image') }}
				<input
					type="file"
					accept="image/*"
					class="hidden"
					@change="handleImageUpload"
					ref="fileInput"
				/>
			</label>
			<p class="text-xs text-ink-gray-5">{{ __('Recommended: 1920x1080 or 1024x576 (16:9 ratio)') }}</p>
		</div>

		<!-- Image Fit Options -->
		<div v-if="currentImageUrl" class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Image Fit') }}</label>
			<div class="grid grid-cols-2 gap-2">
				<button
					v-for="fit in fitOptions"
					:key="fit.value"
					type="button"
					class="px-3 py-2 text-xs rounded-lg border transition-all"
					:class="imageFit === fit.value 
						? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
						: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'"
					@click="updateFit(fit.value)"
				>
					<component :is="fit.icon" class="w-3.5 h-3.5 mx-auto mb-1" />
					{{ fit.label }}
				</button>
			</div>
			<div class="text-xs text-ink-gray-5 space-y-1 mt-2">
				<p v-if="imageFit === 'cover'">{{ __('Fills entire slide, may crop edges') }}</p>
				<p v-if="imageFit === 'contain'">{{ __('Fits entire image, may show borders') }}</p>
				<p v-if="imageFit === 'stretch'">{{ __('Stretches to fill slide') }}</p>
				<p v-if="imageFit === 'tile'">{{ __('Repeats image as pattern') }}</p>
			</div>
		</div>

		<!-- Opacity Control -->
		<div v-if="currentImageUrl" class="space-y-2">
			<div class="flex items-center justify-between">
				<label class="text-xs text-ink-gray-6 font-medium">{{ __('Opacity') }}</label>
				<span class="text-xs text-ink-gray-5">{{ Math.round(imageOpacity * 100) }}%</span>
			</div>
			<input
				type="range"
				min="0"
				max="100"
				:value="imageOpacity * 100"
				@input="updateOpacity(parseInt($event.target.value) / 100)"
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
			/>
		</div>

		<!-- Overlay Color -->
		<div v-if="currentImageUrl" class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Overlay Color (Optional)') }}</label>
			<ColorPicker
				:modelValue="overlayColor"
				@update:modelValue="updateOverlay"
				:allowTransparent="true"
				placeholder="No overlay"
			/>
			<p class="text-xs text-ink-gray-5">{{ __('Add a color tint over the background image') }}</p>
		</div>

		<!-- Overlay Opacity -->
		<div v-if="currentImageUrl && overlayColor" class="space-y-2">
			<div class="flex items-center justify-between">
				<label class="text-xs text-ink-gray-6 font-medium">{{ __('Overlay Opacity') }}</label>
				<span class="text-xs text-ink-gray-5">{{ Math.round(overlayOpacity * 100) }}%</span>
			</div>
			<input
				type="range"
				min="0"
				max="100"
				:value="overlayOpacity * 100"
				@input="updateOverlayOpacity(parseInt($event.target.value) / 100)"
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
			/>
		</div>

		<!-- Position Controls (for contain/tile) -->
		<div v-if="currentImageUrl && (imageFit === 'contain' || imageFit === 'tile')" class="space-y-2">
			<label class="text-xs text-ink-gray-6 font-medium">{{ __('Position') }}</label>
			<div class="grid grid-cols-3 gap-1">
				<button
					v-for="pos in positionOptions"
					:key="pos.value"
					type="button"
					class="aspect-square p-2 text-xs rounded border transition-all"
					:class="imagePosition === pos.value 
						? 'bg-blue-50 border-blue-300 text-blue-700' 
						: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'"
					@click="updatePosition(pos.value)"
					:title="pos.label"
				>
					<component :is="pos.icon" class="w-3 h-3 mx-auto" />
				</button>
			</div>
		</div>

		<!-- Apply Button -->
		<button
			v-if="hasChanges"
			type="button"
			class="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
			@click="applyChanges"
		>
			<Check class="w-4 h-4" />
			<span>{{ __('Apply Background') }}</span>
		</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
	Upload,
	Trash2,
	Check,
	Maximize,
	Minimize,
	Maximize2,
	Grid3x3,
	AlignStartVertical,
	AlignCenterVertical,
	AlignEndVertical,
	AlignStartHorizontal,
	AlignCenterHorizontal,
	AlignEndHorizontal,
	Circle,
} from 'lucide-vue-next'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
	initialImage: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['apply', 'remove'])

const fileInput = ref(null)
const currentImageUrl = ref(props.initialImage?.url || null)
const imageFit = ref(props.initialImage?.fit || 'cover')
const imageOpacity = ref(props.initialImage?.opacity ?? 1)
const overlayColor = ref(props.initialImage?.overlayColor || null)
const overlayOpacity = ref(props.initialImage?.overlayOpacity ?? 0.5)
const imagePosition = ref(props.initialImage?.position || 'center')
const hasChanges = ref(false)

const fitOptions = [
	{ value: 'cover', label: 'Cover', icon: Maximize },
	{ value: 'contain', label: 'Contain', icon: Minimize },
	{ value: 'stretch', label: 'Stretch', icon: Maximize2 },
	{ value: 'tile', label: 'Tile', icon: Grid3x3 },
]

const positionOptions = [
	{ value: 'top-left', label: 'Top Left', icon: AlignStartVertical },
	{ value: 'top', label: 'Top Center', icon: AlignCenterVertical },
	{ value: 'top-right', label: 'Top Right', icon: AlignEndVertical },
	{ value: 'left', label: 'Middle Left', icon: AlignStartHorizontal },
	{ value: 'center', label: 'Center', icon: Circle },
	{ value: 'right', label: 'Middle Right', icon: AlignEndHorizontal },
	{ value: 'bottom-left', label: 'Bottom Left', icon: AlignStartVertical },
	{ value: 'bottom', label: 'Bottom Center', icon: AlignCenterVertical },
	{ value: 'bottom-right', label: 'Bottom Right', icon: AlignEndVertical },
]

async function handleImageUpload(event) {
	const file = event.target.files?.[0]
	if (!file) return

	// Validate file type
	if (!file.type.startsWith('image/')) {
		alert('Please select a valid image file')
		return
	}

	// Validate file size (max 5MB)
	if (file.size > 5 * 1024 * 1024) {
		alert('Image size must be less than 5MB')
		return
	}

	try {
		// Convert to base64 for preview and storage
		const reader = new FileReader()
		reader.onload = (e) => {
			currentImageUrl.value = e.target.result
			hasChanges.value = true
		}
		reader.readAsDataURL(file)
	} catch (error) {
		console.error('Error uploading image:', error)
		alert('Failed to upload image')
	}

	// Reset file input
	if (fileInput.value) {
		fileInput.value.value = ''
	}
}

function updateFit(fit) {
	imageFit.value = fit
	hasChanges.value = true
}

function updateOpacity(opacity) {
	imageOpacity.value = opacity
	hasChanges.value = true
}

function updateOverlay(color) {
	overlayColor.value = color
	hasChanges.value = true
}

function updateOverlayOpacity(opacity) {
	overlayOpacity.value = opacity
	hasChanges.value = true
}

function updatePosition(position) {
	imagePosition.value = position
	hasChanges.value = true
}

function applyChanges() {
	emit('apply', {
		url: currentImageUrl.value,
		fit: imageFit.value,
		opacity: imageOpacity.value,
		overlayColor: overlayColor.value,
		overlayOpacity: overlayOpacity.value,
		position: imagePosition.value,
	})
	hasChanges.value = false
}

function removeBackground() {
	currentImageUrl.value = null
	imageFit.value = 'cover'
	imageOpacity.value = 1
	overlayColor.value = null
	overlayOpacity.value = 0.5
	imagePosition.value = 'center'
	emit('remove')
}
</script>

<style scoped>
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
