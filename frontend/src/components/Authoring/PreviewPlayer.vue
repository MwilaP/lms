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
let currentTransition = null // Store current slide transition settings

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
	await loadFabric()
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
		stage.dispose()
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
		stage.setWidth(displayWidth.value)
		stage.setHeight(displayHeight.value)
		stage.setZoom(scale)
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

async function loadFabric() {
	if (window.fabric) return
	// We expect fabric to be loaded by the parent app or via index.html
	// checking if it's available, otherwise try to load it from a CDN as fallback
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js'
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
		
		// Parse transition from JSON
		let transition = null
		if (slideData.konva_json) {
			try {
				const parsed = JSON.parse(slideData.konva_json)
				transition = parsed.transition
			} catch (e) {}
		}
		
		// Apply transition effect if present
		if (transition && transition.type !== 'none') {
			await applyTransitionIn(transition)
		}
		
		currentTransition = transition
		await nextTick()
		renderStage(slideData.konva_json)
		setupInteractions()
	} catch (e) {
		console.error('Failed to load slide', e)
	}
}

/**
 * Apply incoming transition animation on slide container
 */
async function applyTransitionIn(transition) {
	if (!stageContainer.value) return
	
	const container = stageContainer.value
	const duration = transition.duration || 0.5
	
	// Set initial state based on transition type
	switch (transition.type) {
		case 'fade':
			container.style.opacity = '0'
			break
		case 'slide':
			const slideStart = {
				left: 'translateX(100%)',
				right: 'translateX(-100%)',
				up: 'translateY(100%)',
				down: 'translateY(-100%)',
			}
			container.style.transform = slideStart[transition.direction] || slideStart.left
			break
		case 'zoom-in':
			container.style.transform = 'scale(0.5)'
			container.style.opacity = '0'
			break
		case 'zoom-out':
			container.style.transform = 'scale(1.5)'
			container.style.opacity = '0'
			break
	}
	
	// Trigger reflow
	void container.offsetWidth
	
	// Apply transition and animate to final state
	container.style.transition = `all ${duration}s ease-out`
	container.style.opacity = '1'
	container.style.transform = 'translateX(0) translateY(0) scale(1)'
	
	// Wait for transition to complete
	await new Promise(resolve => setTimeout(resolve, duration * 1000))
	
	// Clean up transition styles
	container.style.transition = ''
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

function renderStage(json) {
	if (!stageContainer.value) return

	if (stage) {
		stage.dispose()
		stage = null
	}

	const container = stageContainer.value
	// Clear container
	container.innerHTML = '<canvas id="preview-canvas"></canvas>'
	
	const canvasEl = container.querySelector('canvas')
	
	// Initialize Fabric Canvas
	// Use StaticCanvas for read-only, but we might need events for interactions
	// So use Canvas but disable editing
	const fabric = window.fabric
	
	stage = new fabric.Canvas('preview-canvas', {
		width: displayWidth.value,
		height: displayHeight.value,
		selection: false,
		hoverCursor: 'default',
		backgroundColor: '#ffffff',
	})
	
	if (!json) return
	
	// Load data
	let fabricJson = json
	if (typeof json === 'string') {
		try {
			fabricJson = JSON.parse(json)
		} catch (e) {
			console.error('Invalid JSON', e)
			return
		}
	}
	
	stage.loadFromJSON(fabricJson, () => {
		// Handle background gradient/image restoration if needed
		// (Fabric.js loadFromJSON handles most of this, but complex backgrounds might need help
		// similar to loadFromJSON in CourseAuthoring)
		
		// Scale content to fit display
		const scale = displayWidth.value / baseWidth
		stage.setZoom(scale)
		stage.setWidth(displayWidth.value)
		stage.setHeight(displayHeight.value)
		
		stage.renderAll()
		
		// Play Object Animations
		playObjectAnimations()
	})
}

function playObjectAnimations() {
	if (!stage) return
	
	const objects = stage.getObjects()
	
	objects.forEach(obj => {
		const anim = obj.animation // Access custom animation property
		if (!anim || !anim.entrance) return
		
		const entrance = anim.entrance.type
		const duration = (anim.duration || 0.5) * 1000
		const delay = (anim.delay || 0) * 1000
		
		// Set initial state
		// Store original values if needed
		const original = {
			opacity: obj.opacity,
			left: obj.left,
			top: obj.top,
			scaleX: obj.scaleX,
			scaleY: obj.scaleY,
		}
		
		// Helper to reset after animation (if needed) or keep final state
		
		setTimeout(() => {
			switch (entrance) {
				case 'fade-in':
					obj.set('opacity', 0)
					obj.animate('opacity', 1, {
						duration,
						onChange: stage.renderAll.bind(stage),
					})
					break
				case 'fly-in-left':
					obj.set({ left: -100, opacity: 0 })
					obj.animate({ left: original.left, opacity: 1 }, {
						duration,
						onChange: stage.renderAll.bind(stage),
						easing: fabric.util.ease.easeOutCubic,
					})
					break
				case 'fly-in-right':
					obj.set({ left: baseWidth + 100, opacity: 0 })
					obj.animate({ left: original.left, opacity: 1 }, {
						duration,
						onChange: stage.renderAll.bind(stage),
						easing: fabric.util.ease.easeOutCubic,
					})
					break
				case 'fly-in-bottom':
					obj.set({ top: baseHeight + 100, opacity: 0 })
					obj.animate({ top: original.top, opacity: 1 }, {
						duration,
						onChange: stage.renderAll.bind(stage),
						easing: fabric.util.ease.easeOutCubic,
					})
					break
				case 'fly-in-top':
					obj.set({ top: -100, opacity: 0 })
					obj.animate({ top: original.top, opacity: 1 }, {
						duration,
						onChange: stage.renderAll.bind(stage),
						easing: fabric.util.ease.easeOutCubic,
					})
					break
				case 'zoom-in':
					obj.set({ scaleX: 0, scaleY: 0, opacity: 0 })
					obj.animate({ scaleX: original.scaleX, scaleY: original.scaleY, opacity: 1 }, {
						duration,
						onChange: stage.renderAll.bind(stage),
						easing: fabric.util.ease.easeOutBack,
					})
					break
				case 'bounce-in':
					obj.set({ top: -100, opacity: 0 })
					obj.animate({ top: original.top, opacity: 1 }, {
						duration,
						onChange: stage.renderAll.bind(stage),
						easing: fabric.util.ease.easeOutBounce,
					})
					break
			}
		}, delay)
	})
}

function setupInteractions() {
	if (!stage) return
	
	for (const interaction of interactions) {
		if (interaction.event === 'OnClick' && interaction.elementId) {
			// Find object by ID (custom property)
			// Fabric objects don't have IDs by default, we rely on our custom 'id' property
			const objects = stage.getObjects()
			const target = objects.find(o => o.id === interaction.elementId)
			
			if (target) {
				target.hoverCursor = 'pointer'
				target.on('mousedown', () => executeAction(interaction))
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
