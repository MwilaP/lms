<template>
	<div class="relative" ref="dropdownRef">
		<ToolButton
			@click="isOpen = !isOpen"
			:disabled="!hasSelection"
			:active="isOpen"
			title="Align & Distribute"
		>
			<AlignCenterHorizontal class="w-4 h-4" />
		</ToolButton>
		
		<Transition
			enter-active-class="transition ease-out duration-150"
			enter-from-class="opacity-0 scale-95 -translate-y-1"
			enter-to-class="opacity-100 scale-100 translate-y-0"
			leave-active-class="transition ease-in duration-100"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="isOpen"
				class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[280px]"
			>
				<!-- Align Section -->
				<div class="mb-3">
					<div class="text-xs font-semibold text-ink-gray-5 uppercase tracking-wide mb-2">
						{{ __('Align') }}
					</div>
					<div class="grid grid-cols-6 gap-1">
						<button
							v-for="align in alignOptions"
							:key="align.action"
							class="p-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors group relative"
							:title="align.label"
							@click="emitAlign(align.action)"
						>
							<component :is="align.icon" class="w-4 h-4" />
							<span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
								{{ align.label }}
							</span>
						</button>
					</div>
				</div>
				
				<!-- Distribute Section (shown when 3+ elements selected) -->
				<div class="mb-3 pt-3 border-t" v-if="multipleSelected">
					<div class="text-xs font-semibold text-ink-gray-5 uppercase tracking-wide mb-2">
						{{ __('Distribute') }}
					</div>
					<div class="grid grid-cols-2 gap-1">
						<button
							v-for="dist in distributeOptions"
							:key="dist.action"
							class="flex items-center p-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
							@click="emitDistribute(dist.action)"
						>
							<component :is="dist.icon" class="w-4 h-4 mr-2" />
							<span class="text-xs">{{ dist.label }}</span>
						</button>
					</div>
				</div>
				
				<!-- Match Size Section (shown when 2+ elements selected) -->
				<div class="pt-3 border-t" v-if="multipleSelected">
					<div class="text-xs font-semibold text-ink-gray-5 uppercase tracking-wide mb-2">
						{{ __('Match Size') }}
					</div>
					<div class="grid grid-cols-3 gap-1">
						<button
							v-for="match in matchSizeOptions"
							:key="match.action"
							class="flex items-center justify-center p-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
							:title="match.label"
							@click="emitMatchSize(match.action)"
						>
							<component :is="match.icon" class="w-4 h-4 mr-1" />
							<span class="text-xs">{{ match.label }}</span>
						</button>
					</div>
				</div>
				
				<!-- Single selection hint -->
				<div v-if="!multipleSelected" class="pt-3 border-t">
					<div class="text-xs text-ink-gray-4 text-center py-2">
						{{ __('Select multiple elements for distribute & match size options') }}
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
	AlignCenterHorizontal,
	AlignCenterVertical,
	AlignStartHorizontal,
	AlignStartVertical,
	AlignEndHorizontal,
	AlignEndVertical,
	AlignHorizontalDistributeCenter,
	AlignVerticalDistributeCenter,
	MoveHorizontal,
	MoveVertical,
	Maximize2,
} from 'lucide-vue-next'

import ToolButton from './ToolButton.vue'

const props = defineProps({
	hasSelection: { type: Boolean, default: false },
	multipleSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['align', 'distribute', 'match-size'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const alignOptions = [
	{ action: 'align-left', label: 'Align Left', icon: AlignStartHorizontal },
	{ action: 'align-center-h', label: 'Align Center', icon: AlignCenterHorizontal },
	{ action: 'align-right', label: 'Align Right', icon: AlignEndHorizontal },
	{ action: 'align-top', label: 'Align Top', icon: AlignStartVertical },
	{ action: 'align-center-v', label: 'Align Middle', icon: AlignCenterVertical },
	{ action: 'align-bottom', label: 'Align Bottom', icon: AlignEndVertical },
]

const distributeOptions = [
	{ action: 'distribute-h', label: 'Distribute Horizontally', icon: AlignHorizontalDistributeCenter },
	{ action: 'distribute-v', label: 'Distribute Vertically', icon: AlignVerticalDistributeCenter },
]

const matchSizeOptions = [
	{ action: 'match-width', label: 'Width', icon: MoveHorizontal },
	{ action: 'match-height', label: 'Height', icon: MoveVertical },
	{ action: 'match-both', label: 'Both', icon: Maximize2 },
]

function emitAlign(action) {
	emit('align', action)
	isOpen.value = false
}

function emitDistribute(action) {
	emit('distribute', action)
	isOpen.value = false
}

function emitMatchSize(action) {
	emit('match-size', action)
	isOpen.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
	if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
		isOpen.value = false
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>
