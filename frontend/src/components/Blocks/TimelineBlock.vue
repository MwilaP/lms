<template>
	<div class="timeline-block-wrapper" :class="`timeline-${layout}`">
		<div class="timeline-container">
			<div
				v-for="(item, index) in items"
				:key="index"
				class="timeline-item"
			>
				<div class="timeline-marker"></div>
				<div v-if="index < items.length - 1" class="timeline-line"></div>
				<div class="timeline-content">
					<div class="timeline-date">{{ item.date }}</div>
					<div class="timeline-title">{{ item.title }}</div>
					<div class="timeline-description" v-html="formatContent(item.description)"></div>
				</div>
			</div>
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

const items = ref(props.data.items || [])
const layout = ref(props.data.layout || 'vertical')

const formatContent = (content) => {
	if (!content) return ''
	return content
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.timeline-block-wrapper {
	margin: 2rem 0;
}

.timeline-vertical .timeline-container {
	position: relative;
	padding-left: 2rem;
}

.timeline-horizontal .timeline-container {
	display: flex;
	overflow-x: auto;
	padding-bottom: 1rem;
}

.timeline-vertical .timeline-item {
	position: relative;
	padding-bottom: 2rem;
}

.timeline-horizontal .timeline-item {
	position: relative;
	min-width: 250px;
	padding-right: 2rem;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.timeline-marker {
	position: absolute;
	width: 16px;
	height: 16px;
	background-color: #2563eb;
	border: 3px solid #ffffff;
	border-radius: 50%;
	box-shadow: 0 0 0 3px #dbeafe;
	z-index: 2;
}

.timeline-vertical .timeline-marker {
	left: -2.5rem;
	top: 0.25rem;
}

.timeline-horizontal .timeline-marker {
	top: 0;
	left: 50%;
	transform: translateX(-50%);
}

.timeline-line {
	position: absolute;
	background-color: #e5e7eb;
	z-index: 1;
}

.timeline-vertical .timeline-line {
	left: -2rem;
	top: 1.5rem;
	bottom: -0.5rem;
	width: 2px;
}

.timeline-horizontal .timeline-line {
	left: 50%;
	top: 16px;
	right: -2rem;
	height: 2px;
	transform: translateY(-50%);
}

.timeline-content {
	background-color: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 1.25rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.timeline-horizontal .timeline-content {
	margin-top: 2.5rem;
	width: 100%;
}

.timeline-date {
	display: inline-block;
	background-color: #dbeafe;
	color: #1e40af;
	font-size: 0.75rem;
	font-weight: 600;
	padding: 0.25rem 0.75rem;
	border-radius: 9999px;
	margin-bottom: 0.5rem;
}

.timeline-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: #111827;
	margin-bottom: 0.5rem;
}

.timeline-description {
	color: #6b7280;
	line-height: 1.6;
	font-size: 0.875rem;
}

@media (max-width: 768px) {
	.timeline-horizontal .timeline-container {
		flex-direction: column;
	}

	.timeline-horizontal .timeline-item {
		min-width: 100%;
		padding-right: 0;
		padding-bottom: 2rem;
		align-items: flex-start;
		padding-left: 2rem;
	}

	.timeline-horizontal .timeline-marker {
		left: -2.5rem;
		top: 0.25rem;
		transform: none;
	}

	.timeline-horizontal .timeline-line {
		left: -2rem;
		top: 1.5rem;
		bottom: -0.5rem;
		right: auto;
		width: 2px;
		height: auto;
		transform: none;
	}

	.timeline-horizontal .timeline-content {
		margin-top: 0;
	}
}
</style>
