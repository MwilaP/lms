<template>
	<div class="matching-pairs-block-wrapper">
		<div class="matching-pairs-question">{{ question }}</div>
		<div ref="columnsContainer" class="matching-pairs-columns">
			<div class="matching-pairs-column left-column">
				<div
					v-for="(pair, index) in pairs"
					:key="`left-${index}`"
					:data-index="index"
					class="matching-item left-item"
					:class="{ selected: selectedLeft === index, matched: isMatched(index, 'left'), correct: isCorrect(index, 'left'), incorrect: isIncorrect(index, 'left') }"
					@click="selectLeft(index)"
				>
					{{ pair.left }}
				</div>
			</div>
			<canvas ref="canvas" class="matching-pairs-canvas"></canvas>
			<div class="matching-pairs-column right-column">
				<div
					v-for="(pair, index) in shuffledRight"
					:key="`right-${index}`"
					:data-index="pair.originalIndex"
					class="matching-item right-item"
					:class="{ matched: isMatched(pair.originalIndex, 'right'), correct: isCorrect(pair.originalIndex, 'right'), incorrect: isIncorrect(pair.originalIndex, 'right') }"
					@click="selectRight(pair.originalIndex)"
				>
					{{ pair.right }}
				</div>
			</div>
		</div>
		<div class="matching-pairs-buttons">
			<button class="matching-pairs-check-button" @click="checkAnswer">
				Check Answer
			</button>
			<button class="matching-pairs-reset-button" @click="resetMatching">
				Reset
			</button>
		</div>
		<transition name="fade">
			<div
				v-if="showFeedback && feedbackMessage"
				class="matching-pairs-feedback-message"
				:class="{ correct: isAllCorrect, incorrect: !isAllCorrect }"
			>
				{{ feedbackMessage }}
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
})

const question = ref(props.data.question || '')
const pairs = ref(props.data.pairs || [])
const showFeedback = ref(props.data.showFeedback !== false)
const feedbackCorrect = ref(props.data.feedbackCorrect || 'Perfect! All matches are correct.')
const feedbackIncorrect = ref(props.data.feedbackIncorrect || 'Some matches are incorrect. Try again!')

const shuffledRight = ref([])
const matches = ref(new Map())
const selectedLeft = ref(null)
const checkedMatches = ref(new Set())
const feedbackMessage = ref('')
const isAllCorrect = ref(false)

const canvas = ref(null)
const columnsContainer = ref(null)

onMounted(() => {
	resetMatching()
})

const resetMatching = () => {
	shuffledRight.value = pairs.value
		.map((pair, index) => ({ ...pair, originalIndex: index }))
		.sort(() => Math.random() - 0.5)
	
	matches.value = new Map()
	selectedLeft.value = null
	checkedMatches.value = new Set()
	feedbackMessage.value = ''
	isAllCorrect.value = false
	
	nextTick(() => {
		resizeCanvas()
	})
}

const selectLeft = (index) => {
	if (selectedLeft.value === index) {
		selectedLeft.value = null
	} else {
		selectedLeft.value = index
	}
}

const selectRight = (rightIndex) => {
	if (selectedLeft.value !== null) {
		matches.value.set(selectedLeft.value, rightIndex)
		selectedLeft.value = null
		nextTick(() => {
			drawLines()
		})
	}
}

const isMatched = (index, side) => {
	if (side === 'left') {
		return matches.value.has(index)
	} else {
		return Array.from(matches.value.values()).includes(index)
	}
}

const isCorrect = (index, side) => {
	if (!checkedMatches.value.size) return false
	if (side === 'left') {
		const matchedRight = matches.value.get(index)
		return matchedRight === index
	} else {
		const leftIndex = Array.from(matches.value.entries()).find(([_, right]) => right === index)?.[0]
		return leftIndex === index
	}
}

const isIncorrect = (index, side) => {
	if (!checkedMatches.value.size) return false
	if (side === 'left') {
		const matchedRight = matches.value.get(index)
		return matchedRight !== undefined && matchedRight !== index
	} else {
		const leftIndex = Array.from(matches.value.entries()).find(([_, right]) => right === index)?.[0]
		return leftIndex !== undefined && leftIndex !== index
	}
}

const resizeCanvas = () => {
	if (!canvas.value || !columnsContainer.value) return
	canvas.value.width = columnsContainer.value.offsetWidth
	canvas.value.height = columnsContainer.value.offsetHeight
	drawLines()
}

const drawLines = () => {
	if (!canvas.value) return
	
	const ctx = canvas.value.getContext('2d')
	ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
	
	const leftColumn = columnsContainer.value.querySelector('.left-column')
	const rightColumn = columnsContainer.value.querySelector('.right-column')
	const canvasRect = canvas.value.getBoundingClientRect()
	
	matches.value.forEach((rightIndex, leftIndex) => {
		const leftItem = leftColumn.querySelector(`[data-index="${leftIndex}"]`)
		const rightItem = rightColumn.querySelector(`[data-index="${rightIndex}"]`)
		
		if (leftItem && rightItem) {
			const leftRect = leftItem.getBoundingClientRect()
			const rightRect = rightItem.getBoundingClientRect()
			
			const x1 = leftRect.right - canvasRect.left
			const y1 = leftRect.top + leftRect.height / 2 - canvasRect.top
			const x2 = rightRect.left - canvasRect.left
			const y2 = rightRect.top + rightRect.height / 2 - canvasRect.top
			
			ctx.beginPath()
			ctx.moveTo(x1, y1)
			ctx.lineTo(x2, y2)
			ctx.strokeStyle = '#2563eb'
			ctx.lineWidth = 2
			ctx.stroke()
		}
	})
}

const checkAnswer = () => {
	let allCorrect = true
	checkedMatches.value = new Set(matches.value.keys())
	
	matches.value.forEach((rightIndex, leftIndex) => {
		if (leftIndex !== rightIndex) {
			allCorrect = false
		}
	})
	
	if (matches.value.size < pairs.value.length) {
		allCorrect = false
	}
	
	isAllCorrect.value = allCorrect
	
	if (showFeedback.value) {
		feedbackMessage.value = allCorrect ? feedbackCorrect.value : feedbackIncorrect.value
	}
}

watch(() => matches.value.size, () => {
	nextTick(() => {
		drawLines()
	})
})
</script>

<style scoped>
.matching-pairs-block-wrapper {
	margin: 1.5rem 0;
	padding: 1.5rem;
	background-color: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.matching-pairs-question {
	font-size: 1.125rem;
	font-weight: 600;
	color: #111827;
	margin-bottom: 1.5rem;
}

.matching-pairs-columns {
	position: relative;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 2rem;
	margin-bottom: 1.5rem;
	min-height: 300px;
}

.matching-pairs-column {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	z-index: 2;
}

.matching-item {
	padding: 1rem;
	background-color: white;
	border: 2px solid #e5e7eb;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	user-select: none;
	font-weight: 500;
	color: #374151;
}

.matching-item:hover {
	border-color: #2563eb;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.matching-item.selected {
	border-color: #2563eb;
	background-color: #eff6ff;
}

.matching-item.matched {
	border-color: #9ca3af;
	background-color: #f3f4f6;
}

.matching-item.correct {
	border-color: #10b981;
	background-color: #f0fdf4;
}

.matching-item.incorrect {
	border-color: #ef4444;
	background-color: #fef2f2;
}

.matching-pairs-canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 1;
}

.matching-pairs-buttons {
	display: flex;
	gap: 0.75rem;
}

.matching-pairs-check-button,
.matching-pairs-reset-button {
	padding: 0.625rem 1.25rem;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.matching-pairs-check-button {
	background-color: #2563eb;
	color: white;
}

.matching-pairs-check-button:hover {
	background-color: #1d4ed8;
}

.matching-pairs-reset-button {
	background-color: #6b7280;
	color: white;
}

.matching-pairs-reset-button:hover {
	background-color: #4b5563;
}

.matching-pairs-feedback-message {
	margin-top: 1rem;
	padding: 1rem;
	border-radius: 6px;
	font-weight: 500;
}

.matching-pairs-feedback-message.correct {
	background-color: #d1fae5;
	color: #065f46;
	border: 1px solid #10b981;
}

.matching-pairs-feedback-message.incorrect {
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

@media (max-width: 768px) {
	.matching-pairs-columns {
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	
	.matching-pairs-canvas {
		display: none;
	}
}
</style>
