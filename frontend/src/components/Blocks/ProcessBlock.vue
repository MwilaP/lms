<template>
	<div class="process-block-wrapper" :class="`process-${layout}`">
		<div class="process-container">
			<template v-for="(step, index) in steps" :key="index">
				<div class="process-step">
					<div v-if="showNumbers" class="process-step-number">{{ index + 1 }}</div>
					<div class="process-step-content">
						<div class="process-step-title">{{ step.title }}</div>
						<div class="process-step-description" v-html="formatContent(step.description)"></div>
					</div>
				</div>
				<div v-if="index < steps.length - 1" class="process-arrow">
					<ChevronRight v-if="layout === 'horizontal'" class="arrow-icon" />
					<ChevronDown v-else class="arrow-icon" />
				</div>
			</template>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
})

const steps = ref(props.data.steps || [])
const layout = ref(props.data.layout || 'horizontal')
const showNumbers = ref(props.data.showNumbers !== false)

const formatContent = (content) => {
	if (!content) return ''
	return content
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.process-block-wrapper {
	margin: 2rem 0;
}

.process-horizontal .process-container {
	display: flex;
	align-items: center;
	gap: 1rem;
	overflow-x: auto;
	padding: 1rem 0;
}

.process-vertical .process-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.process-step {
	background-color: #ffffff;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	padding: 1.5rem;
	min-width: 250px;
	flex: 1;
	transition: all 0.3s ease;
	position: relative;
}

.process-step:hover {
	border-color: #2563eb;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
}

.process-step-number {
	position: absolute;
	top: -12px;
	left: 1.5rem;
	width: 32px;
	height: 32px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.process-step-content {
	margin-top: 0.5rem;
}

.process-step-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: #111827;
	margin-bottom: 0.5rem;
}

.process-step-description {
	color: #6b7280;
	line-height: 1.6;
	font-size: 0.875rem;
}

.process-arrow {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #9ca3af;
	flex-shrink: 0;
}

.process-horizontal .process-arrow {
	margin: 0 0.5rem;
}

.process-vertical .process-arrow {
	margin: 0.5rem 0;
}

.arrow-icon {
	width: 24px;
	height: 24px;
}

@media (max-width: 768px) {
	.process-horizontal .process-container {
		flex-direction: column;
	}

	.process-horizontal .process-arrow .arrow-icon {
		transform: rotate(90deg);
	}

	.process-step {
		min-width: 100%;
	}
}
</style>
