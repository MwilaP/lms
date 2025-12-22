<template>
	<div class="labeled-graphic-block-wrapper">
		<div v-if="imageUrl" class="labeled-graphic-container">
			<div class="labeled-graphic-image-wrapper">
				<img :src="imageUrl" alt="Labeled Graphic" class="labeled-graphic-image" />
				<div
					v-for="(marker, index) in markers"
					:key="index"
					class="labeled-graphic-marker"
					:style="{ left: `${marker.x}%`, top: `${marker.y}%` }"
					@click="toggleTooltip(index)"
				>
					<span class="marker-number">{{ index + 1 }}</span>
					<transition name="tooltip">
						<div v-if="activeTooltip === index" class="labeled-graphic-tooltip">
							<div class="tooltip-title">{{ marker.label }}</div>
							<div class="tooltip-description" v-html="formatContent(marker.description)"></div>
						</div>
					</transition>
				</div>
			</div>
		</div>
		<div v-else class="labeled-graphic-placeholder">
			<p>No image available</p>
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

const imageUrl = ref(props.data.imageUrl || '')
const markers = ref(props.data.markers || [])
const activeTooltip = ref(null)

const toggleTooltip = (index) => {
	if (activeTooltip.value === index) {
		activeTooltip.value = null
	} else {
		activeTooltip.value = index
	}
}

const formatContent = (content) => {
	if (!content) return ''
	return content
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.labeled-graphic-block-wrapper {
	margin: 1.5rem 0;
}

.labeled-graphic-container {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	overflow: hidden;
	background-color: #f9fafb;
}

.labeled-graphic-image-wrapper {
	position: relative;
	display: inline-block;
	width: 100%;
}

.labeled-graphic-image {
	display: block;
	width: 100%;
	height: auto;
}

.labeled-graphic-marker {
	position: absolute;
	transform: translate(-50%, -50%);
	cursor: pointer;
	z-index: 10;
}

.marker-number {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background-color: #2563eb;
	color: white;
	border-radius: 50%;
	font-weight: 700;
	font-size: 0.875rem;
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
	transition: all 0.2s ease;
	border: 3px solid white;
}

.labeled-graphic-marker:hover .marker-number {
	background-color: #1d4ed8;
	transform: scale(1.1);
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
}

.labeled-graphic-tooltip {
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin-top: 0.5rem;
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 1rem;
	min-width: 200px;
	max-width: 300px;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	z-index: 20;
}

.labeled-graphic-tooltip::before {
	content: '';
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	border: 8px solid transparent;
	border-bottom-color: white;
}

.tooltip-title {
	font-weight: 600;
	color: #111827;
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
}

.tooltip-description {
	color: #6b7280;
	font-size: 0.8125rem;
	line-height: 1.5;
}

.tooltip-enter-active,
.tooltip-leave-active {
	transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(-10px);
}

.labeled-graphic-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	background-color: #f9fafb;
	border: 2px dashed #d1d5db;
	border-radius: 8px;
	color: #9ca3af;
}

@media (max-width: 768px) {
	.labeled-graphic-tooltip {
		min-width: 150px;
		max-width: 200px;
		padding: 0.75rem;
	}

	.marker-number {
		width: 28px;
		height: 28px;
		font-size: 0.75rem;
	}
}
</style>
