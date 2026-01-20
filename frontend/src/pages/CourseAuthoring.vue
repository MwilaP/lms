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
				<div class="flex items-center justify-between bg-surface-white border-b px-4 py-2 shrink-0">
					<div class="flex items-center space-x-2">
						<Button variant="ghost" size="sm" @click="addElement('rect')" :disabled="!selectedSlide">
							<template #icon>
								<Square class="w-4 h-4" />
							</template>
						</Button>
						<Button variant="ghost" size="sm" @click="addElement('text')" :disabled="!selectedSlide">
							<template #icon>
								<Type class="w-4 h-4" />
							</template>
						</Button>
						<Button variant="ghost" size="sm" @click="addElement('image')" :disabled="!selectedSlide">
							<template #icon>
								<ImageIcon class="w-4 h-4" />
							</template>
						</Button>
						<Button variant="ghost" size="sm" @click="addElement('circle')" :disabled="!selectedSlide">
							<template #icon>
								<Circle class="w-4 h-4" />
							</template>
						</Button>
						<div class="w-px h-5 bg-outline-gray-2 mx-2"></div>
						<Button variant="ghost" size="sm" @click="undo" :disabled="!canUndo">
							<template #icon>
								<Undo2 class="w-4 h-4" />
							</template>
						</Button>
						<Button variant="ghost" size="sm" @click="redo" :disabled="!canRedo">
							<template #icon>
								<Redo2 class="w-4 h-4" />
							</template>
						</Button>
					</div>
					<div class="flex items-center space-x-2">
						<span v-if="selectedSlide" class="text-sm text-ink-gray-7">
							{{ selectedSlideData?.title || selectedSlide }}
						</span>
					</div>
				</div>

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
	Square,
	Type,
	Image as ImageIcon,
	Circle,
	Undo2,
	Redo2,
	Settings,
} from 'lucide-vue-next'
import AuthoringOutline from '@/components/Authoring/AuthoringOutline.vue'
import ElementInspector from '@/components/Authoring/ElementInspector.vue'
import InteractionEditor from '@/components/Authoring/InteractionEditor.vue'
import PreviewPlayer from '@/components/Authoring/PreviewPlayer.vue'
import VersionHistory from '@/components/Authoring/VersionHistory.vue'

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
		scheduleAutosave()
		pushHistory()
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
	if (e.key === 'Delete' || e.key === 'Backspace') {
		if (selectedElement.value?._node) {
			selectedElement.value._node.destroy()
			transformer.nodes([])
			selectedElement.value = null
			stage.draw()
			scheduleAutosave()
			pushHistory()
		}
	}
	if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
		e.preventDefault()
		if (e.shiftKey) {
			redo()
		} else {
			undo()
		}
	}
	if ((e.ctrlKey || e.metaKey) && e.key === 's') {
		e.preventDefault()
		saveSlide()
	}
}

function addElement(type) {
	if (!stage || !contentLayer) return
	const Konva = window.Konva
	let node
	if (type === 'rect') {
		node = new Konva.Rect({
			x: 100,
			y: 100,
			width: 200,
			height: 120,
			fill: '#e0e7ff',
			stroke: '#4f46e5',
			strokeWidth: 1,
			draggable: true,
		})
	} else if (type === 'text') {
		node = new Konva.Text({
			x: 100,
			y: 100,
			text: 'Text',
			fontSize: 32,
			fill: '#111827',
			draggable: true,
		})
	} else if (type === 'circle') {
		node = new Konva.Circle({
			x: 200,
			y: 200,
			radius: 60,
			fill: '#fef3c7',
			stroke: '#f59e0b',
			strokeWidth: 1,
			draggable: true,
		})
	} else if (type === 'image') {
		node = new Konva.Rect({
			x: 100,
			y: 100,
			width: 200,
			height: 150,
			fill: '#f3f4f6',
			stroke: '#9ca3af',
			strokeWidth: 1,
			draggable: true,
		})
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
	const title = prompt(__('Slide title'))
	if (!title) return
	try {
		const data = await call('lms.lms.authoring_api.create_slide', {
			lesson: lessonName,
			title,
		})
		await fetchOutline()
		if (data?.name) {
			selectSlide(data.name)
		}
		toast.success(__('Slide added'))
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
</script>
