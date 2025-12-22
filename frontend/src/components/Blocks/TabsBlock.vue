<template>
	<div class="tabs-block-wrapper" :class="`tabs-${layout}`">
		<div class="tabs-headers">
			<button
				v-for="(tab, index) in tabs"
				:key="index"
				class="tab-header"
				:class="{ active: activeTab === index }"
				@click="activeTab = index"
			>
				{{ tab.title }}
			</button>
		</div>
		<div class="tabs-contents">
			<transition name="tab-fade" mode="out-in">
				<div :key="activeTab" class="tab-content active">
					<div class="tab-content-inner" v-html="formatContent(tabs[activeTab].content)"></div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
})

const tabs = ref(props.data.tabs || [])
const layout = ref(props.data.layout || 'horizontal')
const activeTab = ref(0)

const formatContent = (content) => {
	if (!content) return ''
	return content
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.tabs-block-wrapper {
	margin: 1.5rem 0;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	overflow: hidden;
}

.tabs-horizontal {
	display: flex;
	flex-direction: column;
}

.tabs-vertical {
	display: grid;
	grid-template-columns: 200px 1fr;
}

.tabs-headers {
	display: flex;
	background-color: #f9fafb;
	border-bottom: 1px solid #e5e7eb;
}

.tabs-vertical .tabs-headers {
	flex-direction: column;
	border-bottom: none;
	border-right: 1px solid #e5e7eb;
}

.tab-header {
	padding: 0.875rem 1.5rem;
	background: none;
	border: none;
	cursor: pointer;
	font-weight: 500;
	color: #6b7280;
	transition: all 0.2s ease;
	border-bottom: 2px solid transparent;
	white-space: nowrap;
}

.tabs-vertical .tab-header {
	border-bottom: none;
	border-right: 2px solid transparent;
	text-align: left;
}

.tab-header:hover {
	color: #111827;
	background-color: #f3f4f6;
}

.tab-header.active {
	color: #2563eb;
	border-bottom-color: #2563eb;
	background-color: #ffffff;
}

.tabs-vertical .tab-header.active {
	border-bottom-color: transparent;
	border-right-color: #2563eb;
}

.tabs-contents {
	position: relative;
	min-height: 150px;
}

.tab-content {
	background-color: #ffffff;
}

.tab-content-inner {
	padding: 1.5rem;
	color: #374151;
	line-height: 1.6;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
	transition: opacity 0.2s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
	opacity: 0;
}

@media (max-width: 768px) {
	.tabs-vertical {
		grid-template-columns: 1fr;
	}

	.tabs-vertical .tabs-headers {
		flex-direction: row;
		border-right: none;
		border-bottom: 1px solid #e5e7eb;
		overflow-x: auto;
	}

	.tabs-vertical .tab-header {
		border-right: none;
		border-bottom: 2px solid transparent;
	}

	.tabs-vertical .tab-header.active {
		border-right-color: transparent;
		border-bottom-color: #2563eb;
	}
}
</style>
