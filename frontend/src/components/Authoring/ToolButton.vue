<template>
	<button
		class="p-1.5 rounded transition-colors"
		:class="[
			active
				? 'bg-blue-100 text-blue-600'
				: disabled
					? 'text-ink-gray-4 cursor-not-allowed'
					: 'text-ink-gray-6 hover:bg-surface-gray-2 hover:text-ink-gray-8'
		]"
		:disabled="disabled"
		:title="title"
		@click="$emit('click')"
	>
		<slot />
	</button>
</template>

<script setup>
defineProps({
	active: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },
	title: { type: String, default: '' },
})

defineEmits(['click'])
</script>
