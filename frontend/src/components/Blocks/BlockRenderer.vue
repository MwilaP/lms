<template>
	<div class="block-renderer">
		<component
			v-if="blockComponent"
			:is="blockComponent"
			:data="block.data"
		/>
		<div v-else class="unsupported-block">
			<p>Unsupported block type: {{ block.type }}</p>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import AccordionBlock from './AccordionBlock.vue'
import TabsBlock from './TabsBlock.vue'
import FlipCardsBlock from './FlipCardsBlock.vue'
import TimelineBlock from './TimelineBlock.vue'
import ProcessBlock from './ProcessBlock.vue'
import LabeledGraphicBlock from './LabeledGraphicBlock.vue'
import SortableListBlock from './SortableListBlock.vue'
import FlashcardsBlock from './FlashcardsBlock.vue'
import MatchingPairsBlock from './MatchingPairsBlock.vue'
import ScenarioBlock from './ScenarioBlock.vue'

const props = defineProps({
	block: {
		type: Object,
		required: true,
	},
})

const blockComponents = {
	accordion: AccordionBlock,
	tabs: TabsBlock,
	flipcards: FlipCardsBlock,
	timeline: TimelineBlock,
	process: ProcessBlock,
	labeledgraphic: LabeledGraphicBlock,
	sortablelist: SortableListBlock,
	flashcards: FlashcardsBlock,
	matchingpairs: MatchingPairsBlock,
	scenario: ScenarioBlock,
}

const blockComponent = computed(() => {
	return blockComponents[props.block.type] || null
})
</script>

<style scoped>
.block-renderer {
	margin: 1rem 0;
}

.unsupported-block {
	padding: 1rem;
	background-color: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 8px;
	color: #991b1b;
}
</style>
