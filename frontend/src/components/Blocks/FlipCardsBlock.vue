<template>
	<div class="flipcards-block-wrapper">
		<div class="flipcards-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
			<div
				v-for="(card, index) in cards"
				:key="index"
				class="flipcard-container"
				@click="flipTrigger === 'click' ? toggleFlip(index) : null"
				@mouseenter="flipTrigger === 'hover' ? setFlipped(index, true) : null"
				@mouseleave="flipTrigger === 'hover' ? setFlipped(index, false) : null"
			>
				<div class="flipcard-inner" :class="{ flipped: flippedCards.includes(index) }">
					<div class="flipcard-face flipcard-front">
						<div class="flipcard-content" v-html="formatContent(card.front)"></div>
					</div>
					<div class="flipcard-face flipcard-back">
						<div class="flipcard-content" v-html="formatContent(card.back)"></div>
					</div>
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

const cards = ref(props.data.cards || [])
const columns = ref(props.data.columns || 2)
const flipTrigger = ref(props.data.flipTrigger || 'click')
const flippedCards = ref([])

const toggleFlip = (index) => {
	const cardIndex = flippedCards.value.indexOf(index)
	if (cardIndex > -1) {
		flippedCards.value.splice(cardIndex, 1)
	} else {
		flippedCards.value.push(index)
	}
}

const setFlipped = (index, isFlipped) => {
	const cardIndex = flippedCards.value.indexOf(index)
	if (isFlipped && cardIndex === -1) {
		flippedCards.value.push(index)
	} else if (!isFlipped && cardIndex > -1) {
		flippedCards.value.splice(cardIndex, 1)
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
.flipcards-block-wrapper {
	margin: 1.5rem 0;
}

.flipcards-grid {
	display: grid;
	gap: 1.5rem;
	grid-template-columns: repeat(2, 1fr);
}

.flipcard-container {
	perspective: 1000px;
	cursor: pointer;
	min-height: 200px;
}

.flipcard-inner {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 200px;
	transition: transform 0.6s;
	transform-style: preserve-3d;
}

.flipcard-inner.flipped {
	transform: rotateY(180deg);
}

.flipcard-face {
	position: absolute;
	width: 100%;
	height: 100%;
	backface-visibility: hidden;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.5rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.flipcard-front {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
}

.flipcard-back {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	color: white;
	transform: rotateY(180deg);
}

.flipcard-content {
	text-align: center;
	line-height: 1.6;
	width: 100%;
}

@media (max-width: 1024px) {
	.flipcards-grid {
		grid-template-columns: repeat(2, 1fr) !important;
	}
}

@media (max-width: 640px) {
	.flipcards-grid {
		grid-template-columns: 1fr !important;
	}
}
</style>
