<template>
	<div class="accordion-block-wrapper">
		<div class="accordion-items">
			<div
				v-for="(item, index) in items"
				:key="index"
				class="accordion-item"
				:class="{ active: activeItems.includes(index) }"
			>
				<div class="accordion-header" @click="toggleItem(index)">
					<div class="accordion-title">{{ item.title }}</div>
					<ChevronDown
						class="accordion-icon"
						:class="{ rotated: activeItems.includes(index) }"
					/>
				</div>
				<transition name="accordion">
					<div v-show="activeItems.includes(index)" class="accordion-content">
						<div class="accordion-content-inner" v-html="formatContent(item.content)"></div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
})

const items = ref(props.data.items || [])
const expandAll = ref(props.data.expandAll || false)
const activeItems = ref([])

onMounted(() => {
	if (expandAll.value) {
		activeItems.value = items.value.map((_, index) => index)
	}
})

const toggleItem = (index) => {
	const itemIndex = activeItems.value.indexOf(index)
	if (itemIndex > -1) {
		activeItems.value.splice(itemIndex, 1)
	} else {
		activeItems.value.push(index)
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
.accordion-block-wrapper {
	margin: 1.5rem 0;
}

.accordion-items {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	overflow: hidden;
}

.accordion-item {
	border-bottom: 1px solid #e5e7eb;
}

.accordion-item:last-child {
	border-bottom: none;
}

.accordion-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 1.25rem;
	cursor: pointer;
	background-color: #f9fafb;
	transition: background-color 0.2s ease;
	user-select: none;
}

.accordion-header:hover {
	background-color: #f3f4f6;
}

.accordion-item.active .accordion-header {
	background-color: #f3f4f6;
}

.accordion-title {
	font-weight: 600;
	font-size: 1rem;
	color: #111827;
	flex: 1;
}

.accordion-icon {
	width: 20px;
	height: 20px;
	color: #6b7280;
	transition: transform 0.3s ease;
	flex-shrink: 0;
	margin-left: 1rem;
}

.accordion-icon.rotated {
	transform: rotate(180deg);
}

.accordion-content {
	overflow: hidden;
}

.accordion-content-inner {
	padding: 1rem 1.25rem;
	color: #374151;
	line-height: 1.6;
	background-color: #ffffff;
}

.accordion-enter-active,
.accordion-leave-active {
	transition: all 0.3s ease;
}

.accordion-enter-from,
.accordion-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}
</style>
