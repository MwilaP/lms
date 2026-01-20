<template>
	<div class="fixed inset-0 z-50 bg-black flex flex-col">
		<header class="flex items-center justify-between bg-gray-900 px-4 py-2 shrink-0">
			<div class="flex items-center space-x-3">
				<span class="text-white text-sm font-medium">{{ courseTitle }}</span>
				<span class="text-gray-400 text-xs">{{ currentSlideTitle }}</span>
			</div>
			<div class="flex items-center space-x-2">
				<Button variant="ghost" size="sm" @click="prevSlide" :disabled="currentSlideIndex <= 0">
					<template #icon>
						<ChevronLeft class="w-4 h-4 text-white" />
					</template>
				</Button>
				<span class="text-white text-xs">
					{{ currentSlideIndex + 1 }} / {{ allSlides.length }}
				</span>
				<Button variant="ghost" size="sm" @click="nextSlide" :disabled="currentSlideIndex >= allSlides.length - 1">
					<template #icon>
						<ChevronRight class="w-4 h-4 text-white" />
					</template>
				</Button>
				<Button variant="ghost" size="sm" @click="$emit('close')">
					<template #icon>
						<X class="w-4 h-4 text-white" />
					</template>
				</Button>
			</div>
		</header>

		<main class="flex-1 flex items-center justify-center overflow-hidden">
			<div
				ref="stageContainer"
				class="bg-white shadow-2xl"
				:style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
			></div>
		</main>

		<footer class="bg-gray-900 px-4 py-2 shrink-0">
			<div class="flex items-center justify-center space-x-1 overflow-x-auto">
				<button
					v-for="(slide, idx) in allSlides"
					:key="slide.name"
					class="w-16 h-9 border-2 rounded overflow-hidden shrink-0 transition-all"
					:class="idx === currentSlideIndex ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'"
					@click="goToSlideIndex(idx)"
				>
					<div class="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
						{{ idx + 1 }}
					</div>
				</button>
			</div>
		</footer>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Button, call } from 'frappe-ui'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const props = defineProps({
	course: { type: String, required: true },
	courseTitle: { type: String, default: '' },
	outline: { type: Object, default: null },
	initialSlide: { type: String, default: null },
})

const emit = defineEmits(['close'])

const stageContainer = ref(null)
const currentSlideIndex = ref(0)
const displayWidth = ref(960)
const displayHeight = ref(540)

const baseWidth = 1024
const baseHeight = 576

let stage = null
let contentLayer = null
let interactions = []
let timers = []

const allSlides = computed(() => {
	const slides = []
	for (const ch of props.outline?.chapters || []) {
		for (const le of ch.lessons || []) {
			for (const sl of le.slides || []) {
				slides.push({ ...sl, lessonName: le.name, chapterName: ch.name })
			}
		}
	}
	return slides
})

const currentSlide = computed(() => allSlides.value[currentSlideIndex.value])
const currentSlideTitle = computed(() => currentSlide.value?.title || `Slide ${currentSlideIndex.value + 1}`)

onMounted(async () => {
	await loadKonva()
	handleResize()
	window.addEventListener('resize', handleResize)
	window.addEventListener('keydown', handleKeydown)

	if (props.initialSlide) {
		const idx = allSlides.value.findIndex(s => s.name === props.initialSlide)
		if (idx >= 0) currentSlideIndex.value = idx
	}

	await loadSlide()
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	window.removeEventListener('keydown', handleKeydown)
	clearTimers()
	if (stage) {
		stage.destroy()
		stage = null
	}
})

watch(currentSlideIndex, async () => {
	await loadSlide()
})

function handleResize() {
	const maxW = window.innerWidth - 40
	const maxH = window.innerHeight - 120
	const scale = Math.min(maxW / baseWidth, maxH / baseHeight)
	displayWidth.value = Math.floor(baseWidth * scale)
	displayHeight.value = Math.floor(baseHeight * scale)
	if (stage) {
		stage.width(displayWidth.value)
		stage.height(displayHeight.value)
		stage.scale({ x: scale, y: scale })
	}
}

function handleKeydown(e) {
	if (e.key === 'ArrowRight' || e.key === ' ') {
		nextSlide()
	} else if (e.key === 'ArrowLeft') {
		prevSlide()
	} else if (e.key === 'Escape') {
		emit('close')
	}
}

async function loadKonva() {
	if (window.Konva) return
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/konva@9/konva.min.js'
		script.onload = resolve
		script.onerror = reject
		document.head.appendChild(script)
	})
}

async function loadSlide() {
	clearTimers()
	interactions = []

	const slide = currentSlide.value
	if (!slide) return

	try {
		const [slideData, interactionData] = await Promise.all([
			call('lms.lms.authoring_api.get_slide', { slide: slide.name }),
			call('lms.lms.authoring_api.list_slide_interactions', { slide: slide.name }),
		])

		interactions = (interactionData || []).map(parseInteraction)
		await nextTick()
		renderStage(slideData.konva_json)
		setupInteractions()
	} catch (e) {
		console.error('Failed to load slide', e)
	}
}

function parseInteraction(raw) {
	let actions = {}
	try {
		actions = JSON.parse(raw.actions_json || '{}')
	} catch (e) {}
	return {
		name: raw.name,
		elementId: raw.element_id,
		event: raw.event || 'OnClick',
		actionType: actions.type || 'GoToNextSlide',
		delay: actions.delay || 0,
		targetSlide: actions.targetSlide || '',
		targetElementId: actions.targetElementId || '',
		targetLesson: actions.targetLesson || '',
		targetUrl: actions.targetUrl || '',
	}
}

function renderStage(konvaJson) {
	if (!stageContainer.value) return

	if (stage) {
		stage.destroy()
		stage = null
		contentLayer = null
	}

	const container = stageContainer.value
	container.innerHTML = ''

	const Konva = window.Konva
	const scale = displayWidth.value / baseWidth

	if (konvaJson) {
		try {
			stage = Konva.Node.create(konvaJson, container)
			stage.width(displayWidth.value)
			stage.height(displayHeight.value)
			stage.scale({ x: scale, y: scale })
			contentLayer = stage.findOne('Layer')
		} catch (e) {
			stage = null
		}
	}

	if (!stage) {
		stage = new Konva.Stage({
			container,
			width: displayWidth.value,
			height: displayHeight.value,
			scaleX: scale,
			scaleY: scale,
		})
		contentLayer = new Konva.Layer()
		stage.add(contentLayer)
	}

	if (contentLayer) {
		contentLayer.find('Transformer').forEach(t => t.destroy())
	}
}

function setupInteractions() {
	if (!contentLayer) return

	for (const interaction of interactions) {
		if (interaction.event === 'OnClick' && interaction.elementId) {
			const node = contentLayer.findOne(`#${interaction.elementId}`)
			if (node) {
				node.on('click tap', () => executeAction(interaction))
				node.on('mouseenter', () => {
					document.body.style.cursor = 'pointer'
				})
				node.on('mouseleave', () => {
					document.body.style.cursor = 'default'
				})
			}
		} else if (interaction.event === 'OnEnterSlide') {
			executeAction(interaction)
		} else if (interaction.event === 'OnTimer') {
			const timer = setTimeout(() => {
				executeAction(interaction)
			}, (interaction.delay || 1) * 1000)
			timers.push(timer)
		}
	}
}

function executeAction(interaction) {
	switch (interaction.actionType) {
		case 'GoToNextSlide':
			nextSlide()
			break
		case 'GoToPrevSlide':
			prevSlide()
			break
		case 'GoToSlide':
			goToSlide(interaction.targetSlide)
			break
		case 'ShowElement':
			setElementVisibility(interaction.targetElementId, true)
			break
		case 'HideElement':
			setElementVisibility(interaction.targetElementId, false)
			break
		case 'ToggleElement':
			toggleElementVisibility(interaction.targetElementId)
			break
		case 'NavigateLesson':
			navigateToLesson(interaction.targetLesson)
			break
		case 'OpenURL':
			if (interaction.targetUrl) {
				window.open(interaction.targetUrl, '_blank')
			}
			break
	}
}

function nextSlide() {
	if (currentSlideIndex.value < allSlides.value.length - 1) {
		currentSlideIndex.value++
	}
}

function prevSlide() {
	if (currentSlideIndex.value > 0) {
		currentSlideIndex.value--
	}
}

function goToSlide(slideName) {
	const idx = allSlides.value.findIndex(s => s.name === slideName)
	if (idx >= 0) {
		currentSlideIndex.value = idx
	}
}

function goToSlideIndex(idx) {
	currentSlideIndex.value = idx
}

function navigateToLesson(lessonName) {
	const idx = allSlides.value.findIndex(s => s.lessonName === lessonName)
	if (idx >= 0) {
		currentSlideIndex.value = idx
	}
}

function setElementVisibility(elementId, visible) {
	if (!contentLayer) return
	const node = contentLayer.findOne(`#${elementId}`)
	if (node) {
		node.visible(visible)
		contentLayer.batchDraw()
	}
}

function toggleElementVisibility(elementId) {
	if (!contentLayer) return
	const node = contentLayer.findOne(`#${elementId}`)
	if (node) {
		node.visible(!node.visible())
		contentLayer.batchDraw()
	}
}

function clearTimers() {
	timers.forEach(t => clearTimeout(t))
	timers = []
}
</script>
