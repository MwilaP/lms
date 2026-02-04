<template>
	<button
		class="element-item flex flex-col items-center justify-center p-2 rounded-lg border border-transparent transition-all duration-150"
		:class="[
			disabled 
				? 'opacity-50 cursor-not-allowed' 
				: 'hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm cursor-pointer active:scale-95'
		]"
		:disabled="disabled"
		:title="item.label"
		@click="!disabled && $emit('add')"
	>
		<component 
			:is="item.icon" 
			class="w-5 h-5 transition-colors"
			:class="disabled ? 'text-ink-gray-4' : 'text-ink-gray-6 group-hover:text-blue-600'"
		/>
		<span class="text-[10px] text-ink-gray-5 mt-1 truncate w-full text-center">
			{{ item.label }}
		</span>
	</button>
</template>

<script setup>
defineProps({
	item: {
		type: Object,
		required: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
})

defineEmits(['add'])
</script>

<style scoped>
.element-item {
	min-width: 48px;
	min-height: 52px;
}
</style>
