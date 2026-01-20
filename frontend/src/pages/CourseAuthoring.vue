<template>
	<PreviewPlayer
		v-if="showPreview"
		:course="courseName"
		:courseTitle="courseTitle"
		:outline="outline"
		:initialSlide="selectedSlide"
		@close="showPreview = false"
	/>
	<VersionHistory
		:show="showVersionHistory"
		:course="courseName"
		@close="showVersionHistory = false"
		@published="onVersionPublished"
		@restored="onVersionRestored"
	/>
	<SlideTemplates
		:show="showTemplates"
		@close="showTemplates = false"
		@apply="applyTemplate"
	/>
	<KeyboardShortcuts
		:show="showShortcuts"
		@close="showShortcuts = false"
	/>
	<div class="h-screen flex flex-col bg-surface-gray-1 overflow-hidden">
		<header class="flex items-center justify-between bg-surface-white border-b px-4 py-2 shrink-0">
			<div class="flex items-center space-x-3">
				<router-link :to="{ name: 'Courses' }">
					<Button variant="ghost" size="sm">
						<template #icon>
							<ArrowLeft class="w-4 h-4" />
						</template>
					</Button>
				</router-link>
				<div class="flex flex-col">
					<input
						v-model="courseTitle"
						class="text-sm font-semibold text-ink-gray-9 bg-transparent border-none outline-none focus:ring-0 p-0 max-w-xs truncate"
						@blur="saveCourseTitle"
						@keydown.enter="$event.target.blur()"
					/>
					<span class="text-xs text-ink-gray-5">{{ __('Course Authoring') }}</span>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				<div v-if="saveStatus" class="text-xs text-ink-gray-5 mr-2">
					{{ saveStatus }}
				</div>
				<router-link :to="{ name: 'CourseForm', params: { courseName: courseName } }">
					<Button variant="ghost" size="sm">
						<template #icon>
							<Settings class="w-4 h-4" />
						</template>
					</Button>
				</router-link>
				<Button variant="outline" size="sm" @click="previewCourse">
					<template #prefix>
						<Play class="w-3.5 h-3.5" />
					</template>
					{{ __('Preview') }}
				</Button>
				<Button variant="solid" size="sm" @click="publishCourse">
					<template #prefix>
						<Upload class="w-3.5 h-3.5" />
					</template>
					{{ __('Publish') }}
				</Button>
			</div>
		</header>

		<div class="flex flex-1 overflow-hidden">
			<aside class="w-72 bg-surface-white border-r flex flex-col shrink-0 overflow-hidden">
				<div class="flex items-center justify-between px-4 py-3 border-b">
					<span class="text-sm font-semibold text-ink-gray-9">{{ __('Outline') }}</span>
					<Button variant="ghost" size="sm" @click="addChapter">
						<template #icon>
							<Plus class="w-4 h-4" />
						</template>
					</Button>
				</div>
				<div class="flex-1 overflow-y-auto">
					<AuthoringOutline
						v-if="outline"
						:outline="outline"
						:selectedSlide="selectedSlide"
						@select-slide="selectSlide"
						@add-lesson="addLesson"
						@add-slide="addSlide"
						@reorder="handleReorder"
					/>
				</div>
			</aside>

			<main class="flex-1 flex flex-col overflow-hidden">
				<EditorToolbar
					:disabled="!selectedSlide"
					:hasSelection="!!selectedElement"
					:hasClipboard="!!clipboard"
					:canUndo="canUndo"
					:canRedo="canRedo"
					:showGrid="showGrid"
					:snapEnabled="snapEnabled"
					:zoomLevel="zoomLevel"
					:activeTool="activeTool"
					@add-element="addElement"
					@layer-action="handleLayerAction"
					@action="handleAction"
					@undo="undo"
					@redo="redo"
					@toggle-grid="toggleGrid"
					@toggle-snap="snapEnabled = !snapEnabled"
					@zoom="handleZoom"
					@tool-change="activeTool = $event"
					@image-upload="handleImageUpload"
					@show-templates="showTemplates = true"
				/>

				<div class="flex-1 flex overflow-hidden">
					<div class="flex-1 flex items-center justify-center bg-surface-gray-2 p-6 overflow-auto">
						<div
							ref="stageContainer"
							class="bg-white rounded-lg shadow-lg overflow-hidden"
							:style="{ width: stageDisplayWidth + 'px', height: stageDisplayHeight + 'px' }"
						>
							<div ref="konvaContainer" class="w-full h-full"></div>
						</div>
					</div>

					<aside class="w-72 bg-surface-white border-l flex flex-col shrink-0 overflow-hidden">
						<div class="px-4 py-3 border-b">
							<span class="text-sm font-semibold text-ink-gray-9">{{ __('Inspector') }}</span>
						</div>
						<div class="flex-1 overflow-y-auto p-4 space-y-6">
							<ElementInspector
								v-if="selectedElement"
								:element="selectedElement"
								@update="updateElement"
								@delete="deleteElement"
							/>
							<div v-else class="text-sm text-ink-gray-5 text-center py-4">
								{{ __('Select an element to edit its properties') }}
							</div>
							<div v-if="selectedSlide" class="border-t pt-4">
								<InteractionEditor
									:slide="selectedSlide"
									:elementId="selectedElement?.id"
									:availableSlides="allSlidesFlat"
									@update="onInteractionUpdate"
								/>
							</div>
						</div>
					</aside>
				</div>

				<div class="bg-surface-white border-t px-4 py-3 shrink-0">
					<div class="flex items-center space-x-2 overflow-x-auto">
						<div
							v-for="(slide, idx) in currentLessonSlides"
							:key="slide.name"
							class="shrink-0 cursor-pointer rounded-md border-2 transition-all"
							:class="selectedSlide === slide.name ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-300'"
							@click="selectSlide(slide.name)"
						>
							<div class="w-32 h-20 bg-surface-gray-2 rounded flex items-center justify-center text-xs text-ink-gray-5 overflow-hidden">
								<img v-if="slide.thumbnail" :src="slide.thumbnail" class="w-full h-full object-cover" />
								<span v-else>{{ idx + 1 }}</span>
							</div>
						</div>
						<Button
							v-if="selectedLessonName"
							variant="ghost"
							size="sm"
							class="shrink-0"
							@click="addSlideToCurrentLesson"
						>
							<template #icon>
								<Plus class="w-4 h-4" />
							</template>
						</Button>
					</div>
				</div>
			</main>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Button, call, toast } from 'frappe-ui'
import { useRouter } from 'vue-router'
import {
	ArrowLeft,
	Play,
	Upload,
	Plus,
	Settings,
} from 'lucide-vue-next'
import AuthoringOutline from '@/components/Authoring/AuthoringOutline.vue'
import ElementInspector from '@/components/Authoring/ElementInspector.vue'
import InteractionEditor from '@/components/Authoring/InteractionEditor.vue'
import PreviewPlayer from '@/components/Authoring/PreviewPlayer.vue'
import VersionHistory from '@/components/Authoring/VersionHistory.vue'
import EditorToolbar from '@/components/Authoring/EditorToolbar.vue'
import SlideTemplates from '@/components/Authoring/SlideTemplates.vue'
import KeyboardShortcuts from '@/components/Authoring/KeyboardShortcuts.vue'

const props = defineProps({
	courseName: {
		type: String,
		required: true,
	},
})

const router = useRouter()

const courseData = ref(null)
const courseTitle = ref('')
const outline = ref(null)
const selectedSlide = ref(null)
const selectedSlideData = ref(null)
const selectedLessonName = ref(null)
const selectedElement = ref(null)
const saveStatus = ref('')
const showPreview = ref(false)
const showVersionHistory = ref(false)

const activeTool = ref('select')
const showGrid = ref(false)
const snapEnabled = ref(true)
const zoomLevel = ref(100)
const clipboard = ref(null)
const showTemplates = ref(false)
const showShortcuts = ref(false)

const stageBaseWidth = 1024
const stageBaseHeight = 576
const stageDisplayWidth = ref(800)
const stageDisplayHeight = ref(450)

const konvaContainer = ref(null)
const stageContainer = ref(null)

let stage = null
let contentLayer = null
let uiLayer = null
let transformer = null
let konvaLoaded = false

const history = ref([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const currentLessonSlides = computed(() => {
	if (!outline.value || !selectedLessonName.value) return []
	for (const ch of outline.value.chapters || []) {
		for (const le of ch.lessons || []) {
			if (le.name === selectedLessonName.value) {
				return le.slides || []
			}
		}
	}
	return []
})

const allSlidesFlat = computed(() => {
	const slides = []
	for (const ch of outline.value?.chapters || []) {
		for (const le of ch.lessons || []) {
			for (const sl of le.slides || []) {
				slides.push({ name: sl.name, title: sl.title || `Slide ${slides.length + 1}` })
			}
		}
	}
	return slides
})

function onInteractionUpdate() {
	// Interactions saved - could refresh or show status
}

onMounted(async () => {
	await loadKonva()
	await fetchCourse()
	await fetchOutline()
	window.addEventListener('resize', handleResize)
	window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	window.removeEventListener('keydown', handleKeydown)
	if (stage) {
		stage.destroy()
		stage = null
	}
})

async function loadKonva() {
	if (window.Konva) {
		konvaLoaded = true
		return
	}
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/konva@9/konva.min.js'
		script.async = true
		script.onload = () => {
			konvaLoaded = true
			resolve()
		}
		script.onerror = () => reject(new Error('Failed to load Konva'))
		document.head.appendChild(script)
	})
}

async function fetchCourse() {
	try {
		const data = await call('frappe.client.get', {
			doctype: 'LMS Course',
			name: props.courseName,
		})
		courseData.value = data
		courseTitle.value = data.title || props.courseName
	} catch (e) {
		toast.error(__('Failed to load course'))
	}
}

async function saveCourseTitle() {
	if (!courseTitle.value || courseTitle.value === courseData.value?.title) return
	try {
		await call('lms.lms.authoring_api.update_course', {
			course: props.courseName,
			data: { title: courseTitle.value },
		})
		courseData.value.title = courseTitle.value
	} catch (e) {
		toast.error(__('Failed to save title'))
		courseTitle.value = courseData.value?.title || props.courseName
	}
}

async function fetchOutline() {
	try {
		const data = await call('lms.lms.authoring_api.get_course_outline', {
			course: props.courseName,
		})
		outline.value = data
		if (!selectedSlide.value && data.chapters?.length) {
			const firstChapter = data.chapters[0]
			if (firstChapter.lessons?.length) {
				const firstLesson = firstChapter.lessons[0]
				selectedLessonName.value = firstLesson.name
				if (firstLesson.slides?.length) {
					selectSlide(firstLesson.slides[0].name)
				}
			}
		}
	} catch (e) {
		toast.error(__('Failed to load course outline'))
	}
}

async function selectSlide(slideName) {
	selectedSlide.value = slideName
	selectedElement.value = null

	for (const ch of outline.value?.chapters || []) {
		for (const le of ch.lessons || []) {
			for (const sl of le.slides || []) {
				if (sl.name === slideName) {
					selectedLessonName.value = le.name
					break
				}
			}
		}
	}

	try {
		const data = await call('lms.lms.authoring_api.get_slide', { slide: slideName })
		selectedSlideData.value = data
		await nextTick()
		renderStage(data.konva_json)
	} catch (e) {
		toast.error(__('Failed to load slide'))
	}
}

function renderStage(konvaJson) {
	if (!konvaLoaded || !konvaContainer.value) return

	if (stage) {
		stage.destroy()
		stage = null
		contentLayer = null
		uiLayer = null
		transformer = null
	}

	const container = konvaContainer.value
	container.innerHTML = ''

	const Konva = window.Konva

	if (konvaJson) {
		try {
			stage = Konva.Node.create(konvaJson, container)
		} catch (e) {
			stage = null
		}
	}

	if (!stage) {
		stage = new Konva.Stage({
			container,
			width: stageBaseWidth,
			height: stageBaseHeight,
		})
		contentLayer = new Konva.Layer()
		stage.add(contentLayer)
	} else {
		contentLayer = stage.findOne('Layer') || new Konva.Layer()
		if (!contentLayer.parent) {
			stage.add(contentLayer)
		}
	}

	uiLayer = new Konva.Layer()
	stage.add(uiLayer)

	transformer = new Konva.Transformer({
		rotateEnabled: true,
		anchorSize: 8,
		borderStroke: '#3b82f6',
		anchorStroke: '#3b82f6',
		anchorFill: '#ffffff',
	})
	uiLayer.add(transformer)

	stage.on('click tap', (e) => {
		if (e.target === stage) {
			transformer.nodes([])
			selectedElement.value = null
			uiLayer.draw()
			return
		}
		if (e.target.getLayer() === uiLayer) return
		transformer.nodes([e.target])
		selectedElement.value = e.target.getAttrs()
		selectedElement.value._node = e.target
		uiLayer.draw()
	})

	stage.on('dragend transformend', () => {
		if (transformer.nodes().length) {
			const node = transformer.nodes()[0]
			selectedElement.value = { ...node.getAttrs(), _node: node }
		}
		hideGuides()
		scheduleAutosave()
		pushHistory()
	})

	// Smart guides during drag
	stage.on('dragmove', (e) => {
		if (!snapEnabled.value) return
		const target = e.target
		if (target === stage || target.getLayer() === uiLayer) return
		showSmartGuides(target)
	})

	fitStage()
	pushHistory()
}

function fitStage() {
	if (!stage || !stageContainer.value) return
	const containerRect = stageContainer.value.getBoundingClientRect()
	const scale = Math.min(
		containerRect.width / stageBaseWidth,
		containerRect.height / stageBaseHeight,
		1
	)
	stageDisplayWidth.value = stageBaseWidth * scale
	stageDisplayHeight.value = stageBaseHeight * scale
	stage.width(stageBaseWidth)
	stage.height(stageBaseHeight)
	stage.scale({ x: scale, y: scale })
	stage.draw()
}

function handleResize() {
	fitStage()
}

function handleKeydown(e) {
	if (!stage) return
	
	// Delete element
	if (e.key === 'Delete' || e.key === 'Backspace') {
		if (selectedElement.value?._node) {
			deleteElement()
		}
	}
	
	// Undo/Redo
	if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
		e.preventDefault()
		if (e.shiftKey) {
			redo()
		} else {
			undo()
		}
	}
	if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
		e.preventDefault()
		redo()
	}
	
	// Save
	if ((e.ctrlKey || e.metaKey) && e.key === 's') {
		e.preventDefault()
		saveSlide()
	}
	
	// Copy/Paste/Duplicate
	if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
		if (selectedElement.value?._node) {
			e.preventDefault()
			copyElement()
		}
	}
	if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
		if (clipboard.value) {
			e.preventDefault()
			pasteElement()
		}
	}
	if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
		if (selectedElement.value?._node) {
			e.preventDefault()
			duplicateElement()
		}
	}
	
	// Toggle grid
	if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
		toggleGrid()
	}
	
	// Show keyboard shortcuts
	if (e.key === '?' || (e.shiftKey && e.key === '/')) {
		e.preventDefault()
		showShortcuts.value = true
	}
	
	// Escape to deselect or close modals
	if (e.key === 'Escape') {
		if (showShortcuts.value) {
			showShortcuts.value = false
		} else if (showTemplates.value) {
			showTemplates.value = false
		} else if (showVersionHistory.value) {
			showVersionHistory.value = false
		} else if (showPreview.value) {
			showPreview.value = false
		} else if (selectedElement.value) {
			transformer?.nodes([])
			selectedElement.value = null
			uiLayer?.draw()
		}
	}
}

function addElement(type) {
	if (!stage || !contentLayer) return
	const Konva = window.Konva
	const id = `${type}-${Date.now()}`
	let node

	const baseAttrs = {
		id,
		draggable: true,
		x: stageBaseWidth / 2 - 100,
		y: stageBaseHeight / 2 - 60,
	}

	switch (type) {
		case 'rect':
			node = new Konva.Rect({
				...baseAttrs,
				width: 200,
				height: 120,
				fill: '#e0e7ff',
				stroke: '#4f46e5',
				strokeWidth: 2,
				cornerRadius: 0,
			})
			break
		case 'roundedRect':
			node = new Konva.Rect({
				...baseAttrs,
				id: `rect-${Date.now()}`,
				width: 200,
				height: 120,
				fill: '#dbeafe',
				stroke: '#3b82f6',
				strokeWidth: 2,
				cornerRadius: 12,
			})
			break
		case 'circle':
			node = new Konva.Circle({
				...baseAttrs,
				x: stageBaseWidth / 2,
				y: stageBaseHeight / 2,
				radius: 60,
				fill: '#fef3c7',
				stroke: '#f59e0b',
				strokeWidth: 2,
			})
			break
		case 'triangle':
			node = new Konva.RegularPolygon({
				...baseAttrs,
				id: `triangle-${Date.now()}`,
				x: stageBaseWidth / 2,
				y: stageBaseHeight / 2,
				sides: 3,
				radius: 60,
				fill: '#d1fae5',
				stroke: '#10b981',
				strokeWidth: 2,
			})
			break
		case 'star':
			node = new Konva.Star({
				...baseAttrs,
				x: stageBaseWidth / 2,
				y: stageBaseHeight / 2,
				numPoints: 5,
				innerRadius: 30,
				outerRadius: 60,
				fill: '#fce7f3',
				stroke: '#ec4899',
				strokeWidth: 2,
			})
			break
		case 'line':
			node = new Konva.Line({
				...baseAttrs,
				id: `line-${Date.now()}`,
				points: [0, 0, 200, 0],
				stroke: '#6b7280',
				strokeWidth: 3,
				lineCap: 'round',
			})
			break
		case 'arrow':
			node = new Konva.Arrow({
				...baseAttrs,
				points: [0, 0, 200, 0],
				stroke: '#6b7280',
				strokeWidth: 3,
				fill: '#6b7280',
				pointerLength: 15,
				pointerWidth: 12,
			})
			break
		case 'text':
			node = new Konva.Text({
				...baseAttrs,
				text: 'Double-click to edit',
				fontSize: 24,
				fontFamily: 'Arial',
				fill: '#111827',
				padding: 5,
			})
			break
		case 'heading':
			node = new Konva.Text({
				...baseAttrs,
				id: `heading-${Date.now()}`,
				text: 'Heading',
				fontSize: 48,
				fontFamily: 'Arial',
				fontStyle: 'bold',
				fill: '#111827',
				padding: 5,
			})
			break
		case 'image':
			node = new Konva.Rect({
				...baseAttrs,
				id: `image-placeholder-${Date.now()}`,
				width: 200,
				height: 150,
				fill: '#f3f4f6',
				stroke: '#d1d5db',
				strokeWidth: 2,
				dash: [10, 5],
			})
			break
		default:
			return
	}

	if (node) {
		contentLayer.add(node)
		contentLayer.draw()
		transformer.nodes([node])
		selectedElement.value = { ...node.getAttrs(), _node: node }
		uiLayer.draw()
		scheduleAutosave()
		pushHistory()
	}
}

function updateElement(attrs) {
	if (!selectedElement.value?._node) return
	const node = selectedElement.value._node
	Object.keys(attrs).forEach((key) => {
		if (key !== '_node') {
			node.setAttr(key, attrs[key])
		}
	})
	node.getLayer().draw()
	selectedElement.value = { ...node.getAttrs(), _node: node }
	scheduleAutosave()
}

function deleteElement() {
	if (!selectedElement.value?._node) return
	selectedElement.value._node.destroy()
	transformer.nodes([])
	selectedElement.value = null
	stage.draw()
	scheduleAutosave()
	pushHistory()
}

let autosaveTimeout = null
function scheduleAutosave() {
	if (autosaveTimeout) clearTimeout(autosaveTimeout)
	saveStatus.value = __('Unsaved changes')
	autosaveTimeout = setTimeout(() => {
		saveSlide()
	}, 1500)
}

async function saveSlide() {
	if (!selectedSlide.value || !stage) return
	saveStatus.value = __('Saving...')
	const json = stage.toJSON()
	try {
		await call('lms.lms.authoring_api.save_konva_json', {
			slide: selectedSlide.value,
			konva_json: json,
		})
		saveStatus.value = __('Saved')
		setTimeout(() => {
			if (saveStatus.value === __('Saved')) saveStatus.value = ''
		}, 2000)
	} catch (e) {
		saveStatus.value = __('Save failed')
		toast.error(__('Failed to save slide'))
	}
}

function pushHistory() {
	if (!stage) return
	const json = stage.toJSON()
	history.value = history.value.slice(0, historyIndex.value + 1)
	history.value.push(json)
	historyIndex.value = history.value.length - 1
}

function undo() {
	if (!canUndo.value) return
	historyIndex.value--
	restoreHistory()
}

function redo() {
	if (!canRedo.value) return
	historyIndex.value++
	restoreHistory()
}

function restoreHistory() {
	const json = history.value[historyIndex.value]
	if (json) {
		renderStage(json)
		scheduleAutosave()
	}
}

async function addChapter() {
	const title = prompt(__('Chapter title'))
	if (!title) return
	try {
		await call('lms.lms.authoring_api.create_chapter', {
			course: props.courseName,
			title,
		})
		await fetchOutline()
		toast.success(__('Chapter added'))
	} catch (e) {
		toast.error(__('Failed to add chapter'))
	}
}

async function addLesson(chapterName) {
	const title = prompt(__('Lesson title'))
	if (!title) return
	try {
		await call('lms.lms.authoring_api.create_lesson', {
			chapter: chapterName,
			title,
		})
		await fetchOutline()
		toast.success(__('Lesson added'))
	} catch (e) {
		toast.error(__('Failed to add lesson'))
	}
}

async function addSlide(lessonName) {
	try {
		const data = await call('lms.lms.authoring_api.create_slide', {
			lesson: lessonName,
		})
		await fetchOutline()
		if (data?.name) {
			selectSlide(data.name)
		}
	} catch (e) {
		toast.error(__('Failed to add slide'))
	}
}

async function addSlideToCurrentLesson() {
	if (!selectedLessonName.value) return
	await addSlide(selectedLessonName.value)
}

function handleReorder(data) {
	console.log('Reorder:', data)
}

function previewCourse() {
	showPreview.value = true
}

function publishCourse() {
	showVersionHistory.value = true
}

function onVersionPublished() {
	// Could refresh course data if needed
}

async function onVersionRestored() {
	// Reload outline and current slide after restoring a version
	await fetchOutline()
	if (selectedSlide.value) {
		await selectSlide(selectedSlide.value)
	}
}

// Layer actions (z-index)
function handleLayerAction(action) {
	if (!selectedElement.value?._node) return
	const node = selectedElement.value._node
	switch (action) {
		case 'bringToFront':
			node.moveToTop()
			break
		case 'bringForward':
			node.moveUp()
			break
		case 'sendBackward':
			node.moveDown()
			break
		case 'sendToBack':
			node.moveToBottom()
			break
	}
	contentLayer.draw()
	scheduleAutosave()
	pushHistory()
}

// Clipboard actions
function handleAction(action) {
	switch (action) {
		case 'copy':
			copyElement()
			break
		case 'paste':
			pasteElement()
			break
		case 'duplicate':
			duplicateElement()
			break
		case 'delete':
			deleteElement()
			break
	}
}

function copyElement() {
	if (!selectedElement.value?._node) return
	const node = selectedElement.value._node
	clipboard.value = node.toJSON()
	toast.success(__('Copied'))
}

function pasteElement() {
	if (!clipboard.value || !contentLayer) return
	const Konva = window.Konva
	const node = Konva.Node.create(clipboard.value)
	node.setAttrs({
		id: `${node.className?.toLowerCase() || 'element'}-${Date.now()}`,
		x: (node.x() || 0) + 20,
		y: (node.y() || 0) + 20,
	})
	contentLayer.add(node)
	contentLayer.draw()
	transformer.nodes([node])
	selectedElement.value = { ...node.getAttrs(), _node: node }
	uiLayer.draw()
	scheduleAutosave()
	pushHistory()
}

function duplicateElement() {
	if (!selectedElement.value?._node) return
	copyElement()
	pasteElement()
}

// Smart guides
let guideLines = []
const SNAP_THRESHOLD = 5

function showSmartGuides(target) {
	hideGuides()
	if (!contentLayer || !uiLayer) return
	
	const Konva = window.Konva
	const targetRect = target.getClientRect()
	const targetCenter = {
		x: targetRect.x + targetRect.width / 2,
		y: targetRect.y + targetRect.height / 2,
	}
	
	// Get all other shapes
	const shapes = contentLayer.getChildren().filter(s => s !== target)
	
	// Stage center and edges
	const stageGuides = [
		{ x: stageBaseWidth / 2, type: 'vertical', label: 'center' },
		{ y: stageBaseHeight / 2, type: 'horizontal', label: 'center' },
		{ x: 0, type: 'vertical', label: 'edge' },
		{ x: stageBaseWidth, type: 'vertical', label: 'edge' },
		{ y: 0, type: 'horizontal', label: 'edge' },
		{ y: stageBaseHeight, type: 'horizontal', label: 'edge' },
	]
	
	// Check stage guides
	stageGuides.forEach(guide => {
		if (guide.type === 'vertical') {
			// Check target left, center, right
			const positions = [targetRect.x, targetCenter.x, targetRect.x + targetRect.width]
			positions.forEach(pos => {
				if (Math.abs(pos - guide.x) < SNAP_THRESHOLD) {
					drawGuideLine('vertical', guide.x)
					// Snap
					const diff = guide.x - pos
					target.x(target.x() + diff)
				}
			})
		} else {
			// Check target top, center, bottom
			const positions = [targetRect.y, targetCenter.y, targetRect.y + targetRect.height]
			positions.forEach(pos => {
				if (Math.abs(pos - guide.y) < SNAP_THRESHOLD) {
					drawGuideLine('horizontal', guide.y)
					// Snap
					const diff = guide.y - pos
					target.y(target.y() + diff)
				}
			})
		}
	})
	
	// Check alignment with other shapes
	shapes.forEach(shape => {
		const shapeRect = shape.getClientRect()
		const shapeCenter = {
			x: shapeRect.x + shapeRect.width / 2,
			y: shapeRect.y + shapeRect.height / 2,
		}
		
		// Vertical alignment (left, center, right edges)
		const vPositions = [
			{ target: targetRect.x, shape: shapeRect.x },
			{ target: targetRect.x, shape: shapeRect.x + shapeRect.width },
			{ target: targetCenter.x, shape: shapeCenter.x },
			{ target: targetRect.x + targetRect.width, shape: shapeRect.x },
			{ target: targetRect.x + targetRect.width, shape: shapeRect.x + shapeRect.width },
		]
		
		vPositions.forEach(({ target: tPos, shape: sPos }) => {
			if (Math.abs(tPos - sPos) < SNAP_THRESHOLD) {
				drawGuideLine('vertical', sPos)
				const diff = sPos - tPos
				target.x(target.x() + diff)
			}
		})
		
		// Horizontal alignment (top, center, bottom edges)
		const hPositions = [
			{ target: targetRect.y, shape: shapeRect.y },
			{ target: targetRect.y, shape: shapeRect.y + shapeRect.height },
			{ target: targetCenter.y, shape: shapeCenter.y },
			{ target: targetRect.y + targetRect.height, shape: shapeRect.y },
			{ target: targetRect.y + targetRect.height, shape: shapeRect.y + shapeRect.height },
		]
		
		hPositions.forEach(({ target: tPos, shape: sPos }) => {
			if (Math.abs(tPos - sPos) < SNAP_THRESHOLD) {
				drawGuideLine('horizontal', sPos)
				const diff = sPos - tPos
				target.y(target.y() + diff)
			}
		})
	})
	
	uiLayer.batchDraw()
}

function drawGuideLine(type, position) {
	const Konva = window.Konva
	let line
	
	if (type === 'vertical') {
		line = new Konva.Line({
			points: [position, 0, position, stageBaseHeight],
			stroke: '#3b82f6',
			strokeWidth: 1,
			dash: [4, 4],
			listening: false,
		})
	} else {
		line = new Konva.Line({
			points: [0, position, stageBaseWidth, position],
			stroke: '#3b82f6',
			strokeWidth: 1,
			dash: [4, 4],
			listening: false,
		})
	}
	
	guideLines.push(line)
	uiLayer.add(line)
	line.moveToBottom()
}

function hideGuides() {
	guideLines.forEach(line => line.destroy())
	guideLines = []
	if (uiLayer) uiLayer.batchDraw()
}

// Grid toggle
function toggleGrid() {
	showGrid.value = !showGrid.value
	drawGrid()
}

let gridLayer = null
function drawGrid() {
	if (!stage) return
	
	if (gridLayer) {
		gridLayer.destroy()
		gridLayer = null
	}
	
	if (!showGrid.value) {
		stage.draw()
		return
	}
	
	const Konva = window.Konva
	gridLayer = new Konva.Layer()
	const gridSize = 50
	
	// Draw vertical lines
	for (let x = 0; x <= stageBaseWidth; x += gridSize) {
		gridLayer.add(new Konva.Line({
			points: [x, 0, x, stageBaseHeight],
			stroke: '#e5e7eb',
			strokeWidth: 1,
			listening: false,
		}))
	}
	
	// Draw horizontal lines
	for (let y = 0; y <= stageBaseHeight; y += gridSize) {
		gridLayer.add(new Konva.Line({
			points: [0, y, stageBaseWidth, y],
			stroke: '#e5e7eb',
			strokeWidth: 1,
			listening: false,
		}))
	}
	
	stage.add(gridLayer)
	gridLayer.moveToBottom()
	stage.draw()
}

// Zoom handling
function handleZoom(action) {
	const zoomStep = 10
	const minZoom = 25
	const maxZoom = 200
	
	let newZoom = zoomLevel.value
	switch (action) {
		case 'in':
			newZoom = Math.min(maxZoom, zoomLevel.value + zoomStep)
			break
		case 'out':
			newZoom = Math.max(minZoom, zoomLevel.value - zoomStep)
			break
		case 'fit':
			newZoom = 100
			break
	}
	
	zoomLevel.value = newZoom
	const scale = newZoom / 100
	stageDisplayWidth.value = Math.round(stageBaseWidth * scale * 0.78)
	stageDisplayHeight.value = Math.round(stageBaseHeight * scale * 0.78)
	
	nextTick(() => {
		if (stage) {
			stage.width(stageDisplayWidth.value)
			stage.height(stageDisplayHeight.value)
			stage.scale({ x: scale * 0.78, y: scale * 0.78 })
			stage.draw()
		}
	})
}

// Apply slide template
function applyTemplate(template) {
	if (!stage || !contentLayer) return
	
	// Clear existing content
	contentLayer.destroyChildren()
	
	const Konva = window.Konva
	
	// Apply background color if specified
	if (template.background && template.background !== '#ffffff') {
		const bg = new Konva.Rect({
			id: 'slide-background',
			x: 0,
			y: 0,
			width: stageBaseWidth,
			height: stageBaseHeight,
			fill: template.background,
			listening: false,
		})
		contentLayer.add(bg)
	}
	
	// Add template elements
	template.elements?.forEach(el => {
		let node
		const attrs = {
			...el.attrs,
			id: `${el.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			draggable: true,
		}
		
		switch (el.type) {
			case 'Text':
				node = new Konva.Text(attrs)
				break
			case 'Rect':
				node = new Konva.Rect(attrs)
				break
			case 'Circle':
				node = new Konva.Circle(attrs)
				break
			case 'Line':
				node = new Konva.Line(attrs)
				break
		}
		
		if (node) {
			contentLayer.add(node)
		}
	})
	
	contentLayer.draw()
	transformer.nodes([])
	selectedElement.value = null
	uiLayer.draw()
	scheduleAutosave()
	pushHistory()
	toast.success(__('Template applied'))
}

// Image upload handling
function handleImageUpload(file) {
	if (!file || !contentLayer) return
	
	const reader = new FileReader()
	reader.onload = (e) => {
		const Konva = window.Konva
		const img = new Image()
		img.onload = () => {
			// Scale image to fit within reasonable bounds
			let width = img.width
			let height = img.height
			const maxSize = 400
			
			if (width > maxSize || height > maxSize) {
				const ratio = Math.min(maxSize / width, maxSize / height)
				width *= ratio
				height *= ratio
			}
			
			const node = new Konva.Image({
				id: `image-${Date.now()}`,
				x: stageBaseWidth / 2 - width / 2,
				y: stageBaseHeight / 2 - height / 2,
				width,
				height,
				image: img,
				draggable: true,
			})
			
			contentLayer.add(node)
			contentLayer.draw()
			transformer.nodes([node])
			selectedElement.value = { ...node.getAttrs(), _node: node }
			uiLayer.draw()
			scheduleAutosave()
			pushHistory()
		}
		img.src = e.target.result
	}
	reader.readAsDataURL(file)
}
</script>
