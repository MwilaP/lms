<template>
	<div class="slide-design-panel space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<div class="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
					<Palette class="w-3.5 h-3.5 text-purple-600" />
				</div>
				<span class="text-sm font-medium text-ink-gray-8">{{ __('Slide Design') }}</span>
			</div>
		</div>

		<!-- Background Type Selector -->
		<div class="space-y-3 p-3 bg-surface-gray-1 rounded-lg">
			<div class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide flex items-center">
				<Paintbrush class="w-3 h-3 mr-1.5" />
				{{ __('Background') }}
			</div>
			
			<div class="flex items-center space-x-2">
				<button
					v-for="type in backgroundTypes"
					:key="type.value"
					type="button"
					class="flex-1 px-3 py-2 text-xs rounded-lg border transition-all"
					:class="backgroundType === type.value 
						? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
						: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'"
					@click="backgroundType = type.value"
				>
					<component :is="type.icon" class="w-3.5 h-3.5 mx-auto mb-1" />
					{{ type.label }}
				</button>
			</div>
		</div>

		<!-- Solid Color Background -->
		<div v-if="backgroundType === 'solid'" class="space-y-3">
			<div class="space-y-2">
				<label class="text-xs text-ink-gray-6 font-medium">{{ __('Background Color') }}</label>
				<ColorPicker
					:modelValue="backgroundColor"
					@update:modelValue="handleBackgroundColorChange"
					:allowTransparent="true"
					placeholder="Transparent"
				/>
			</div>
		</div>

		<!-- Gradient Background -->
		<div v-if="backgroundType === 'gradient'" class="space-y-3">
			<GradientEditor
				:initialGradient="currentGradient"
				@apply="handleGradientApply"
			/>
		</div>

		<!-- Image Background -->
		<div v-if="backgroundType === 'image'" class="space-y-3">
			<BackgroundImagePicker
				:initialImage="currentBackgroundImage"
				@apply="handleImageApply"
				@remove="handleImageRemove"
			/>
		</div>

		<!-- Color Presets -->
		<div class="space-y-3 p-3 bg-surface-gray-1 rounded-lg">
			<div class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide flex items-center">
				<Sparkles class="w-3 h-3 mr-1.5" />
				{{ __('Quick Presets') }}
			</div>
			
			<div class="grid grid-cols-5 gap-2">
				<button
					v-for="preset in colorPresets"
					:key="preset.color"
					type="button"
					class="aspect-square rounded-lg border-2 hover:border-blue-400 transition-all hover:scale-105 shadow-sm"
					:class="backgroundColor === preset.color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'"
					:style="{ backgroundColor: preset.color }"
					@click="handleBackgroundColorChange(preset.color)"
					:title="preset.name"
				>
					<span v-if="!preset.color" class="flex items-center justify-center h-full">
						<div class="w-6 h-0.5 bg-red-500 rotate-45"></div>
					</span>
				</button>
			</div>
		</div>

		<!-- Theme Presets -->
		<div class="space-y-3 p-3 bg-surface-gray-1 rounded-lg">
			<div class="text-xs font-semibold text-ink-gray-7 uppercase tracking-wide flex items-center">
				<Palette class="w-3 h-3 mr-1.5" />
				{{ __('Color Themes') }}
			</div>
			
			<div class="space-y-2">
				<button
					v-for="theme in colorThemes"
					:key="theme.id"
					type="button"
					class="w-full px-3 py-2 rounded-lg border text-left transition-all hover:border-blue-400 hover:bg-blue-50"
					:class="selectedTheme === theme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'"
					@click="applyTheme(theme)"
				>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm font-medium text-ink-gray-8">{{ theme.name }}</div>
							<div class="text-xs text-ink-gray-5">{{ theme.description }}</div>
						</div>
						<div class="flex space-x-1">
							<div
								v-for="(color, idx) in theme.colors"
								:key="idx"
								class="w-5 h-5 rounded border border-gray-300"
								:style="{ backgroundColor: color }"
							></div>
						</div>
					</div>
				</button>
			</div>
		</div>

		<!-- Apply to Options -->
		<div class="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
			<div class="text-xs font-semibold text-amber-800 flex items-center">
				<Info class="w-3 h-3 mr-1.5" />
				{{ __('Apply Changes') }}
			</div>
			<div class="space-y-1.5">
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="radio"
						value="current"
						v-model="applyTo"
						class="w-4 h-4 text-blue-600 focus:ring-blue-500"
					/>
					<span class="text-sm text-ink-gray-7">{{ __('This slide only') }}</span>
				</label>
				<label class="flex items-center space-x-2 cursor-pointer">
					<input
						type="radio"
						value="all"
						v-model="applyTo"
						class="w-4 h-4 text-blue-600 focus:ring-blue-500"
					/>
					<span class="text-sm text-ink-gray-7">{{ __('All slides in lesson') }}</span>
				</label>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
	Palette,
	Paintbrush,
	Sparkles,
	Image as ImageIcon,
	Square,
	Layers,
	Info,
} from 'lucide-vue-next'
import ColorPicker from './ColorPicker.vue'
import GradientEditor from './GradientEditor.vue'
import BackgroundImagePicker from './BackgroundImagePicker.vue'

const props = defineProps({
	currentBackground: {
		type: String,
		default: null,
	},
})

const emit = defineEmits(['update-background', 'apply-theme'])

const backgroundType = ref('solid')
const backgroundColor = ref(props.currentBackground || '#FFFFFF')
const applyTo = ref('current')
const selectedTheme = ref(null)
const currentGradient = ref(null)
const currentBackgroundImage = ref(null)

const backgroundTypes = [
	{ value: 'solid', label: 'Solid', icon: Square },
	{ value: 'gradient', label: 'Gradient', icon: Layers },
	{ value: 'image', label: 'Image', icon: ImageIcon },
]

const colorPresets = [
	{ name: 'Transparent', color: null },
	{ name: 'White', color: '#FFFFFF' },
	{ name: 'Light Gray', color: '#F3F4F6' },
	{ name: 'Gray', color: '#E5E7EB' },
	{ name: 'Dark Gray', color: '#6B7280' },
	{ name: 'Black', color: '#111827' },
	{ name: 'Blue', color: '#3B82F6' },
	{ name: 'Light Blue', color: '#DBEAFE' },
	{ name: 'Green', color: '#10B981' },
	{ name: 'Light Green', color: '#D1FAE5' },
	{ name: 'Red', color: '#EF4444' },
	{ name: 'Light Red', color: '#FEE2E2' },
	{ name: 'Yellow', color: '#F59E0B' },
	{ name: 'Light Yellow', color: '#FEF3C7' },
	{ name: 'Purple', color: '#8B5CF6' },
	{ name: 'Light Purple', color: '#E0E7FF' },
	{ name: 'Pink', color: '#EC4899' },
	{ name: 'Light Pink', color: '#FCE7F3' },
	{ name: 'Orange', color: '#F97316' },
	{ name: 'Teal', color: '#14B8A6' },
]

const colorThemes = [
	{
		id: 'professional',
		name: 'Professional',
		description: 'Clean blues and grays',
		colors: ['#FFFFFF', '#DBEAFE', '#3B82F6', '#1E40AF'],
		background: '#FFFFFF',
	},
	{
		id: 'dark',
		name: 'Dark Mode',
		description: 'Dark backgrounds',
		colors: ['#111827', '#1F2937', '#374151', '#6B7280'],
		background: '#111827',
	},
	{
		id: 'vibrant',
		name: 'Vibrant',
		description: 'Bold and bright',
		colors: ['#FEF3C7', '#F59E0B', '#EF4444', '#8B5CF6'],
		background: '#FEF3C7',
	},
	{
		id: 'pastel',
		name: 'Pastel',
		description: 'Soft and gentle',
		colors: ['#FCE7F3', '#DBEAFE', '#D1FAE5', '#FEF3C7'],
		background: '#FCE7F3',
	},
	{
		id: 'nature',
		name: 'Nature',
		description: 'Earthy greens',
		colors: ['#F0FDF4', '#D1FAE5', '#10B981', '#065F46'],
		background: '#F0FDF4',
	},
]

watch(() => props.currentBackground, (newVal) => {
	backgroundColor.value = newVal || '#FFFFFF'
})

function handleBackgroundColorChange(color) {
	backgroundColor.value = color
	emit('update-background', {
		type: 'solid',
		color: color,
		applyTo: applyTo.value,
	})
}

function applyTheme(theme) {
	selectedTheme.value = theme.id
	backgroundColor.value = theme.background
	emit('apply-theme', {
		theme: theme,
		applyTo: applyTo.value,
	})
	emit('update-background', {
		type: 'solid',
		color: theme.background,
		applyTo: applyTo.value,
	})
}

function handleGradientApply(gradientData) {
	currentGradient.value = gradientData
	emit('update-background', {
		type: 'gradient',
		gradient: gradientData,
		applyTo: applyTo.value,
	})
}

function handleImageApply(imageData) {
	currentBackgroundImage.value = imageData
	emit('update-background', {
		type: 'image',
		image: imageData,
		applyTo: applyTo.value,
	})
}

function handleImageRemove() {
	currentBackgroundImage.value = null
	emit('update-background', {
		type: 'solid',
		color: '#FFFFFF',
		applyTo: applyTo.value,
	})
}
</script>

<style scoped>
.slide-design-panel {
	animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
