<template>
	<div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
		<div class="bg-white rounded-lg shadow-xl w-[900px] h-[600px] flex flex-col overflow-hidden">
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
				<h3 class="text-lg font-semibold text-gray-900">{{ __('Theme Manager') }}</h3>
				<Button variant="ghost" size="sm" @click="$emit('close')">
					<template #icon>
						<X class="w-5 h-5" />
					</template>
				</Button>
			</div>

			<!-- Content -->
			<div class="flex-1 flex overflow-hidden">
				<!-- Sidebar -->
				<div class="w-64 border-r bg-gray-50 p-4 space-y-2">
					<button
						v-for="cat in categories"
						:key="cat.value"
						class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
						:class="activeCategory === cat.value ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'"
						@click="activeCategory = cat.value"
					>
						{{ cat.label }}
					</button>
				</div>

				<!-- Themes Grid -->
				<div class="flex-1 overflow-y-auto p-6">
					<div class="grid grid-cols-3 gap-6">
						<div
							v-for="theme in filteredThemes"
							:key="theme.id"
							class="group relative aspect-video bg-white border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-blue-500 hover:shadow-md"
							:class="selectedTheme?.id === theme.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'"
							@click="selectedTheme = theme"
						>
							<!-- Theme Preview -->
							<div class="absolute inset-0" :style="getThemeBackground(theme)">
								<!-- Title Placeholder -->
								<div class="absolute top-1/3 left-1/12 w-2/3 h-8 bg-black/10 rounded"></div>
								<!-- Body Placeholder -->
								<div class="absolute top-1/2 left-1/12 w-1/2 h-4 bg-black/10 rounded"></div>
								<div class="absolute top-1/2 mt-6 left-1/12 w-1/2 h-4 bg-black/10 rounded"></div>
							</div>
							
							<!-- Hover Overlay -->
							<div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
							
							<!-- Label -->
							<div class="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur px-3 py-2 border-t">
								<span class="text-xs font-semibold text-gray-800">{{ theme.name }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
				<div class="text-sm text-gray-500">
					<span v-if="selectedTheme">Selected: {{ selectedTheme.name }}</span>
				</div>
				<div class="flex items-center space-x-3">
					<Button variant="outline" @click="$emit('close')">{{ __('Cancel') }}</Button>
					<Button 
						variant="solid" 
						:disabled="!selectedTheme"
						@click="applyTheme"
					>
						{{ __('Apply to All Slides') }}
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from 'frappe-ui'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'apply'])

const activeCategory = ref('modern')
const selectedTheme = ref(null)

const categories = [
	{ value: 'modern', label: 'Modern' },
	{ value: 'corporate', label: 'Corporate' },
	{ value: 'creative', label: 'Creative' },
	{ value: 'minimal', label: 'Minimal' },
]

// Predefined themes
const themes = [
	{
		id: 'modern-1',
		name: 'Sleek Blue',
		category: 'modern',
		background: { type: 'solid', color: '#f0f9ff' },
		fonts: { title: 'Inter', body: 'Inter' },
		colors: { title: '#0f172a', body: '#334155', accent: '#3b82f6' }
	},
	{
		id: 'modern-2',
		name: 'Dark Mode',
		category: 'modern',
		background: { type: 'solid', color: '#1e293b' },
		fonts: { title: 'Roboto', body: 'Roboto' },
		colors: { title: '#f8fafc', body: '#cbd5e1', accent: '#38bdf8' }
	},
	{
		id: 'corporate-1',
		name: 'Professional',
		category: 'corporate',
		background: { type: 'solid', color: '#ffffff' },
		fonts: { title: 'Arial', body: 'Arial' },
		colors: { title: '#111827', body: '#374151', accent: '#1d4ed8' }
	},
	{
		id: 'creative-1',
		name: 'Vibrant',
		category: 'creative',
		background: { 
			type: 'gradient', 
			gradient: {
				type: 'linear',
				coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
				colorStops: [
					{ offset: 0, color: '#ffdee2' },
					{ offset: 1, color: '#e0f2fe' }
				]
			}
		},
		fonts: { title: 'Poppins', body: 'Open Sans' },
		colors: { title: '#be185d', body: '#4a044e', accent: '#d946ef' }
	},
]

const filteredThemes = computed(() => {
	return themes.filter(t => t.category === activeCategory.value)
})

function getThemeBackground(theme) {
	if (theme.background.type === 'solid') {
		return { backgroundColor: theme.background.color }
	} else if (theme.background.type === 'gradient') {
		const g = theme.background.gradient
		const stops = g.colorStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')
		return { background: `linear-gradient(135deg, ${stops})` }
	}
	return { backgroundColor: '#fff' }
}

function applyTheme() {
	if (selectedTheme.value) {
		emit('apply', selectedTheme.value)
		emit('close')
	}
}
</script>
