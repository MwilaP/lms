<template>
	<div class="sortable-list-block-wrapper">
		<div class="sortable-list-question">{{ question }}</div>
		<div
			ref="itemsContainer"
			class="sortable-list-items-container"
			@dragover.prevent
			@drop="onDrop"
		>
			<div
				v-for="(item, index) in currentItems"
				:key="item.id"
				:data-order="item.order"
				class="sortable-list-item"
				:class="{ correct: item.isCorrect, incorrect: item.isIncorrect }"
				draggable="true"
				@dragstart="onDragStart($event, index)"
				@dragend="onDragEnd"
				@dragenter="onDragEnter($event, index)"
			>
				<span class="sortable-list-drag-handle">⋮⋮</span>
				<span class="sortable-list-item-text">{{ item.text }}</span>
			</div>
		</div>
		<div class="sortable-list-buttons">
			<button class="sortable-list-check-button" @click="checkAnswer">
				Check Answer
			</button>
			<button class="sortable-list-reset-button" @click="resetList">
				Reset
			</button>
		</div>
		<transition name="fade">
			<div
				v-if="showFeedback && feedbackMessage"
				class="sortable-list-feedback-message"
				:class="{ correct: isCorrectAnswer, incorrect: !isCorrectAnswer }"
			>
				{{ feedbackMessage }}
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
})

const question = ref(props.data.question || '')
const items = ref(props.data.items || [])
const showFeedback = ref(props.data.showFeedback !== false)
const feedbackCorrect = ref(props.data.feedbackCorrect || 'Correct! Well done.')
const feedbackIncorrect = ref(props.data.feedbackIncorrect || 'Not quite right. Try again!')

const currentItems = ref([])
const draggedIndex = ref(null)
const feedbackMessage = ref('')
const isCorrectAnswer = ref(false)

onMounted(() => {
	resetList()
})

const resetList = () => {
	currentItems.value = items.value
		.map((item, index) => ({
			...item,
			id: `item-${index}-${Date.now()}`,
			isCorrect: false,
			isIncorrect: false,
		}))
		.sort(() => Math.random() - 0.5)
	feedbackMessage.value = ''
	isCorrectAnswer.value = false
}

const onDragStart = (event, index) => {
	draggedIndex.value = index
	event.target.classList.add('dragging')
}

const onDragEnd = (event) => {
	event.target.classList.remove('dragging')
	draggedIndex.value = null
}

const onDragEnter = (event, index) => {
	if (draggedIndex.value === null || draggedIndex.value === index) return

	const newItems = [...currentItems.value]
	const draggedItem = newItems[draggedIndex.value]
	newItems.splice(draggedIndex.value, 1)
	newItems.splice(index, 0, draggedItem)

	currentItems.value = newItems
	draggedIndex.value = index
}

const onDrop = (event) => {
	event.preventDefault()
}

const checkAnswer = () => {
	const userOrder = currentItems.value.map((item) => item.order)
	const correctOrder = items.value.map((item) => item.order)

	const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder)
	isCorrectAnswer.value = isCorrect

	currentItems.value = currentItems.value.map((item, index) => ({
		...item,
		isCorrect: item.order === correctOrder[index],
		isIncorrect: item.order !== correctOrder[index],
	}))

	if (showFeedback.value) {
		feedbackMessage.value = isCorrect ? feedbackCorrect.value : feedbackIncorrect.value
	}
}
</script>

<style scoped>
.sortable-list-block-wrapper {
	margin: 1.5rem 0;
	padding: 1.5rem;
	background-color: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.sortable-list-question {
	font-size: 1.125rem;
	font-weight: 600;
	color: #111827;
	margin-bottom: 1.5rem;
}

.sortable-list-items-container {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1.5rem;
}

.sortable-list-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem;
	background-color: white;
	border: 2px solid #e5e7eb;
	border-radius: 8px;
	cursor: move;
	transition: all 0.2s ease;
	user-select: none;
}

.sortable-list-item:hover {
	border-color: #2563eb;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sortable-list-item.dragging {
	opacity: 0.5;
	transform: scale(0.98);
}

.sortable-list-item.correct {
	border-color: #10b981;
	background-color: #f0fdf4;
}

.sortable-list-item.incorrect {
	border-color: #ef4444;
	background-color: #fef2f2;
}

.sortable-list-drag-handle {
	color: #9ca3af;
	font-size: 1.25rem;
	cursor: grab;
	user-select: none;
}

.sortable-list-drag-handle:active {
	cursor: grabbing;
}

.sortable-list-item-text {
	flex: 1;
	color: #374151;
	font-weight: 500;
}

.sortable-list-buttons {
	display: flex;
	gap: 0.75rem;
}

.sortable-list-check-button,
.sortable-list-reset-button {
	padding: 0.625rem 1.25rem;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.sortable-list-check-button {
	background-color: #2563eb;
	color: white;
}

.sortable-list-check-button:hover {
	background-color: #1d4ed8;
}

.sortable-list-reset-button {
	background-color: #6b7280;
	color: white;
}

.sortable-list-reset-button:hover {
	background-color: #4b5563;
}

.sortable-list-feedback-message {
	margin-top: 1rem;
	padding: 1rem;
	border-radius: 6px;
	font-weight: 500;
}

.sortable-list-feedback-message.correct {
	background-color: #d1fae5;
	color: #065f46;
	border: 1px solid #10b981;
}

.sortable-list-feedback-message.incorrect {
	background-color: #fee2e2;
	color: #991b1b;
	border: 1px solid #ef4444;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
