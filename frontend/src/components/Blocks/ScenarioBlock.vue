<template>
	<div class="scenario-block-wrapper">
		<h3 class="scenario-title">{{ title }}</h3>
		<div v-if="pathHistory.length > 0" class="scenario-path-history">
			<div
				v-for="(step, index) in pathHistory"
				:key="index"
				class="scenario-path-step"
			>
				<strong>Step {{ index + 1 }}:</strong> {{ truncate(step.text, 50) }}
			</div>
		</div>
		<div class="scenario-node-display">
			<div v-if="currentNode" class="scenario-node-content" v-html="formatContent(currentNode.content)"></div>
			<div v-if="currentNode && currentNode.type === 'scenario'" class="scenario-choices-display">
				<button
					v-for="(choice, index) in currentNode.choices"
					:key="index"
					class="scenario-choice-button"
					@click="selectChoice(choice.nextNode)"
				>
					{{ choice.text }}
				</button>
			</div>
			<div v-if="currentNode && currentNode.type === 'outcome'" class="scenario-outcome-feedback">
				{{ currentNode.feedback || 'End of scenario.' }}
			</div>
			<div v-if="!currentNode" class="scenario-error">
				Node not found. Please check the scenario configuration.
			</div>
		</div>
		<button
			v-if="showRestart"
			class="scenario-restart-button"
			@click="restartScenario"
		>
			↻ Restart Scenario
		</button>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
})

const title = ref(props.data.title || 'Interactive Scenario')
const startNode = ref(props.data.startNode || 'node-1')
const nodes = ref(props.data.nodes || {})

const currentNodeId = ref(null)
const pathHistory = ref([])

const currentNode = computed(() => {
	return currentNodeId.value ? nodes.value[currentNodeId.value] : null
})

const showRestart = computed(() => {
	return currentNode.value && currentNode.value.type === 'outcome'
})

onMounted(() => {
	showNode(startNode.value)
})

const showNode = (nodeId) => {
	const node = nodes.value[nodeId]
	if (!node) {
		currentNodeId.value = null
		return
	}

	currentNodeId.value = nodeId
	pathHistory.value.push({
		id: nodeId,
		text: node.content,
	})
}

const selectChoice = (nextNodeId) => {
	if (nextNodeId) {
		showNode(nextNodeId)
	}
}

const restartScenario = () => {
	currentNodeId.value = null
	pathHistory.value = []
	showNode(startNode.value)
}

const truncate = (text, length) => {
	if (!text) return ''
	return text.length > length ? text.substring(0, length) + '...' : text
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
.scenario-block-wrapper {
	margin: 1.5rem 0;
	padding: 1.5rem;
	background-color: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.scenario-title {
	font-size: 1.25rem;
	font-weight: 700;
	color: #111827;
	margin-bottom: 1.5rem;
	text-align: center;
}

.scenario-path-history {
	margin-bottom: 1.5rem;
	padding: 1rem;
	background-color: #eff6ff;
	border-left: 4px solid #2563eb;
	border-radius: 4px;
}

.scenario-path-step {
	font-size: 0.875rem;
	color: #1e40af;
	margin-bottom: 0.5rem;
}

.scenario-path-step:last-child {
	margin-bottom: 0;
}

.scenario-node-display {
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 1.5rem;
	margin-bottom: 1rem;
	min-height: 200px;
}

.scenario-node-content {
	font-size: 1.125rem;
	line-height: 1.6;
	color: #374151;
	margin-bottom: 1.5rem;
}

.scenario-choices-display {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.scenario-choice-button {
	padding: 1rem;
	background-color: #2563eb;
	color: white;
	border: none;
	border-radius: 8px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
}

.scenario-choice-button:hover {
	background-color: #1d4ed8;
	transform: translateX(4px);
}

.scenario-outcome-feedback {
	padding: 1rem;
	background-color: #d1fae5;
	color: #065f46;
	border: 1px solid #10b981;
	border-radius: 6px;
	font-weight: 500;
	text-align: center;
}

.scenario-error {
	padding: 1rem;
	background-color: #fee2e2;
	color: #991b1b;
	border: 1px solid #ef4444;
	border-radius: 6px;
	text-align: center;
}

.scenario-restart-button {
	width: 100%;
	padding: 0.75rem;
	background-color: #6b7280;
	color: white;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.scenario-restart-button:hover {
	background-color: #4b5563;
}

@media (max-width: 640px) {
	.scenario-node-content {
		font-size: 1rem;
	}
}
</style>
