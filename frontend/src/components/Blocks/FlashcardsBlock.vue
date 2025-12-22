<template>
	<div class="flashcards-block-wrapper">
		<h3 class="flashcards-title">{{ title }}</h3>
		<div v-if="showProgress" class="flashcards-progress">
			<span class="current">{{ currentIndex + 1 }}</span> / <span class="total">{{ cards.length }}</span>
		</div>
		<div class="flashcard-display" @click="flipCard">
			<div class="flashcard-inner" :class="{ flipped: isFlipped }">
				<div class="flashcard-face flashcard-front">
					<div class="flashcard-content" v-html="formatContent(currentCard.front)"></div>
				</div>
				<div class="flashcard-face flashcard-back">
					<div class="flashcard-content" v-html="formatContent(currentCard.back)"></div>
				</div>
			</div>
		</div>
		<div class="flashcard-flip-hint">Click to flip</div>
		<div class="flashcards-navigation">
			<button
				class="flashcard-nav-button prev"
				:disabled="currentIndex === 0"
				@click="prevCard"
			>
				←
			</button>
			<button class="flashcard-shuffle-button" @click="shuffleCards">
				Shuffle
			</button>
			<button
				class="flashcard-nav-button next"
				:disabled="currentIndex === cards.length - 1"
				@click="nextCard"
			>
				→
			</button>
		</div>
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

const title = ref(props.data.title || 'Flashcard Set')
const originalCards = ref(props.data.cards || [])
const cards = ref([...originalCards.value])
const showProgress = ref(props.data.showProgress !== false)
const currentIndex = ref(0)
const isFlipped = ref(false)

const currentCard = computed(() => cards.value[currentIndex.value] || { front: '', back: '' })

const flipCard = () => {
	isFlipped.value = !isFlipped.value
}

const prevCard = () => {
	if (currentIndex.value > 0) {
		currentIndex.value--
		isFlipped.value = false
	}
}

const nextCard = () => {
	if (currentIndex.value < cards.value.length - 1) {
		currentIndex.value++
		isFlipped.value = false
	}
}

const shuffleCards = () => {
	cards.value = [...cards.value].sort(() => Math.random() - 0.5)
	currentIndex.value = 0
	isFlipped.value = false
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
.flashcards-block-wrapper {
	margin: 1.5rem 0;
	padding: 1.5rem;
	background-color: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.flashcards-title {
	font-size: 1.25rem;
	font-weight: 700;
	color: #111827;
	margin-bottom: 1rem;
	text-align: center;
}

.flashcards-progress {
	text-align: center;
	font-size: 0.875rem;
	color: #6b7280;
	margin-bottom: 1rem;
}

.flashcards-progress .current {
	font-weight: 700;
	color: #2563eb;
}

.flashcard-display {
	perspective: 1000px;
	cursor: pointer;
	margin-bottom: 0.5rem;
}

.flashcard-inner {
	position: relative;
	width: 100%;
	min-height: 300px;
	transition: transform 0.6s;
	transform-style: preserve-3d;
}

.flashcard-inner.flipped {
	transform: rotateY(180deg);
}

.flashcard-face {
	position: absolute;
	width: 100%;
	min-height: 300px;
	backface-visibility: hidden;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.flashcard-front {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
}

.flashcard-back {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	color: white;
	transform: rotateY(180deg);
}

.flashcard-content {
	text-align: center;
	font-size: 1.25rem;
	line-height: 1.6;
	width: 100%;
}

.flashcard-flip-hint {
	text-align: center;
	font-size: 0.875rem;
	color: #9ca3af;
	margin-bottom: 1rem;
}

.flashcards-navigation {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
}

.flashcard-nav-button {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	border: 2px solid #2563eb;
	background-color: white;
	color: #2563eb;
	font-size: 1.25rem;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.flashcard-nav-button:hover:not(:disabled) {
	background-color: #2563eb;
	color: white;
}

.flashcard-nav-button:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.flashcard-shuffle-button {
	padding: 0.5rem 1rem;
	background-color: #6b7280;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s ease;
}

.flashcard-shuffle-button:hover {
	background-color: #4b5563;
}

@media (max-width: 640px) {
	.flashcard-face {
		min-height: 250px;
		padding: 1.5rem;
	}

	.flashcard-content {
		font-size: 1rem;
	}
}
</style>
