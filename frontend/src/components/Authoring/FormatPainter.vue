<template>
	<div class="relative" ref="containerRef">
		<!-- Format Painter Button -->
		<ToolButton
			:active="isActive"
			:class="{
				'ring-2 ring-yellow-400': isActive,
				'animate-pulse': isLocked
			}"
			@click="handleClick"
			@dblclick="handleDoubleClick"
			:disabled="!canCopy && !isActive"
			:title="isActive ? __('Click an element to apply formatting (ESC to cancel)') : __('Format Painter - Copy formatting from selected element')"
		>
			<Paintbrush class="w-4 h-4" :class="{ 'text-yellow-600': isActive }" />
		</ToolButton>

		<!-- Status indicator -->
		<Transition
			enter-active-class="transition-all duration-200"
			enter-from-class="opacity-0 translate-y-1"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition-all duration-150"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div 
				v-if="isActive" 
				class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-sm"
			>
				<span v-if="isLocked">{{ __('Locked - click to apply') }}</span>
				<span v-else>{{ __('Single apply mode') }}</span>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Paintbrush } from 'lucide-vue-next'
import ToolButton from './ToolButton.vue'

const props = defineProps({
	canCopy: { type: Boolean, default: false },
})

const emit = defineEmits(['copy-format', 'apply-format', 'cancel'])

const isActive = ref(false)
const isLocked = ref(false)
const containerRef = ref(null)

// Single click: copy format, activate single-apply mode
function handleClick() {
	if (isActive.value) {
		// Already active, cancel
		deactivate()
		return
	}
	
	if (!props.canCopy) return
	
	// Copy format from current selection and activate
	emit('copy-format')
	isActive.value = true
	isLocked.value = false
}

// Double click: copy format, activate locked (multi-apply) mode
function handleDoubleClick() {
	if (!props.canCopy) return
	
	emit('copy-format')
	isActive.value = true
	isLocked.value = true
}

// Called from parent when format is applied
function onFormatApplied() {
	if (isActive.value && !isLocked.value) {
		// Single apply mode - deactivate after one use
		deactivate()
	}
	// In locked mode, stay active for multiple applications
}

function deactivate() {
	isActive.value = false
	isLocked.value = false
	emit('cancel')
}

// Keyboard handler for ESC
function handleKeydown(e) {
	if (e.key === 'Escape' && isActive.value) {
		deactivate()
	}
}

onMounted(() => {
	document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
	document.removeEventListener('keydown', handleKeydown)
})

// Expose methods for parent component
defineExpose({
	isActive,
	isLocked,
	onFormatApplied,
	deactivate,
})
</script>
