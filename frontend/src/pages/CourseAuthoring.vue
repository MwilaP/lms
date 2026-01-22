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
					:isTextSelected="isTextSelected"
					:currentFont="currentFont"
					:currentFontSize="currentFontSize"
					:isBold="isBold"
					:isItalic="isItalic"
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
					@font-change="handleFontChange"
					@font-size-change="handleFontSizeChange"
					@toggle-bold="handleToggleBold"
					@toggle-italic="handleToggleItalic"
				/>

				<div class="flex-1 flex overflow-hidden">
					<div class="flex-1 flex items-center justify-center bg-surface-gray-2 p-6 overflow-auto">
						<div
							ref="canvasContainer"
							class="bg-white rounded-lg shadow-lg overflow-hidden relative"
							:style="{ width: canvasDisplayWidth + 'px', height: canvasDisplayHeight + 'px' }"
						>
							<canvas ref="fabricCanvas"></canvas>
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
								@image-upload="handleImageUpload"
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
/**
 * Course Authoring Editor - Fabric.js Implementation
 * 
 * This editor uses Fabric.js for canvas rendering because:
 * 1. Native IText support - built-in text editing with real cursor and selection
 * 2. Better serialization - standard JSON format for save/load
 * 3. Rich object controls - rotation, scaling, with customizable handles
 * 4. SVG support - import/export SVG graphics
 * 5. Image filters - blur, brightness, contrast, etc.
 * 6. Active community and excellent documentation
 */

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

// Course data
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

// Editor state
const activeTool = ref('select')
const showGrid = ref(false)
const snapEnabled = ref(true)
const zoomLevel = ref(100)
const clipboard = ref(null)
const showTemplates = ref(false)
const showShortcuts = ref(false)

// Canvas dimensions (16:9 aspect ratio)
const canvasBaseWidth = 1024
const canvasBaseHeight = 576
const canvasDisplayWidth = ref(800)
const canvasDisplayHeight = ref(450)

// DOM refs
const fabricCanvas = ref(null)
const canvasContainer = ref(null)

// Fabric.js canvas instance
let canvas = null
let fabricLoaded = false

// Editor mode: 'author' | 'preview' | 'learner'
const editorMode = ref('author')

// History for undo/redo
const history = ref([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// Computed properties
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

// Text selection computed properties for toolbar
const isTextSelected = computed(() => {
	const obj = selectedElement.value?._fabricObject
	if (!obj) return false
	// Check for layout block or direct text objects
	if (obj.role === 'layout-block') return true
	return obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox'
})

// Helper to get the textbox from a layout block or direct text object
function getTextboxFromSelection() {
	const obj = selectedElement.value?._fabricObject
	if (!obj) return null
	if (obj.role === 'layout-block' && obj._layoutTextbox) {
		return obj._layoutTextbox
	}
	if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
		return obj
	}
	return null
}

const currentFont = computed(() => {
	const textbox = getTextboxFromSelection()
	return textbox?.fontFamily || 'Arial'
})

const currentFontSize = computed(() => {
	const textbox = getTextboxFromSelection()
	return textbox?.fontSize || 24
})

const isBold = computed(() => {
	const textbox = getTextboxFromSelection()
	if (!textbox) return false
	const weight = textbox.fontWeight
	return weight === 'bold' || weight >= 700
})

const isItalic = computed(() => {
	const textbox = getTextboxFromSelection()
	return textbox?.fontStyle === 'italic'
})

// Font change handlers - work with both layout blocks and direct text objects
function handleFontChange(font) {
	const textbox = getTextboxFromSelection()
	if (!textbox) return
	textbox.set('fontFamily', font)
	canvas.renderAll()
	updateSelectedElement()
	scheduleAutosave()
}

function handleFontSizeChange(size) {
	const textbox = getTextboxFromSelection()
	if (!textbox) return
	textbox.set('fontSize', size)
	canvas.renderAll()
	updateSelectedElement()
	scheduleAutosave()
}

function handleToggleBold() {
	const textbox = getTextboxFromSelection()
	if (!textbox) return
	const currentWeight = textbox.fontWeight
	textbox.set('fontWeight', currentWeight === 'bold' || currentWeight >= 700 ? 'normal' : 'bold')
	canvas.renderAll()
	updateSelectedElement()
	scheduleAutosave()
}

function handleToggleItalic() {
	const textbox = getTextboxFromSelection()
	if (!textbox) return
	textbox.set('fontStyle', textbox.fontStyle === 'italic' ? 'normal' : 'italic')
	canvas.renderAll()
	updateSelectedElement()
	scheduleAutosave()
}

function onInteractionUpdate() {
	// Interactions saved - could refresh or show status
}

/**
 * ============================================================================
 * LAYOUT BLOCK SYSTEM - PowerPoint-style Text Containers
 * ============================================================================
 * 
 * Architecture:
 * - Layout Container (fabric.Rect): Defines visual boundaries, non-editable
 * - Text Content (fabric.Textbox): Editable text with native caret/selection
 * - Group Wrapper (fabric.Group): Atomic unit for move/resize
 * 
 * Behavior:
 * - Single click: Select the group
 * - Double click: Enter text editing mode
 * - Resize: Updates container and textbox width, reflows text naturally
 * - Vertical scaling is locked (only horizontal resize affects layout)
 */

/**
 * Register custom LayoutBlock class for proper serialization/deserialization
 */
function registerLayoutBlockClass(fabric) {
	// Custom toObject to include layout block metadata
	const originalGroupToObject = fabric.Group.prototype.toObject
	fabric.Group.prototype.toObject = function(propertiesToInclude) {
		const obj = originalGroupToObject.call(this, propertiesToInclude)
		// Include custom properties
		obj.role = this.role
		obj.slot = this.slot
		obj.layoutBlockId = this.layoutBlockId
		obj.containerPadding = this.containerPadding
		return obj
	}
}

/**
 * Create a PowerPoint-style Layout Block
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.left - X position
 * @param {number} options.top - Y position  
 * @param {number} options.width - Container width
 * @param {number} options.height - Container height (minimum)
 * @param {string} options.text - Initial text content
 * @param {number} options.padding - Internal padding (default: 12)
 * @param {string} options.slot - Template slot name (e.g., 'title', 'body', 'left-column')
 * @param {Object} options.textStyle - Text styling options
 * @returns {fabric.Group} The layout block group
 */
function createTextLayoutBlock(options = {}) {
	const fabric = window.fabric
	if (!fabric) return null

	const {
		left = 100,
		top = 100,
		width = 400,
		height = 100,
		text = 'Click to edit text',
		padding = 12,
		slot = null,
		textStyle = {}
	} = options

	const id = `layout-block-${Date.now()}`
	const textWidth = width - (padding * 2)

	// 1️⃣ Layout Container (visual boundary)
	const container = new fabric.Rect({
		width: width,
		height: height,
		fill: 'transparent',
		stroke: editorMode.value === 'author' ? '#3b82f6' : 'transparent',
		strokeWidth: 1,
		strokeDashArray: [4, 4],
		rx: 4,
		ry: 4,
		selectable: false,
		evented: false,
		originX: 'left',
		originY: 'top',
		name: 'layoutContainer',
	})

	// 2️⃣ Text Content (editable)
	const textbox = new fabric.Textbox(text, {
		width: textWidth,
		left: padding,
		top: padding,
		fontSize: textStyle.fontSize || 18,
		fontFamily: textStyle.fontFamily || 'Arial',
		fontWeight: textStyle.fontWeight || 'normal',
		fontStyle: textStyle.fontStyle || 'normal',
		fill: textStyle.fill || '#111827',
		textAlign: textStyle.textAlign || 'left',
		lineHeight: textStyle.lineHeight || 1.4,
		originX: 'left',
		originY: 'top',
		name: 'layoutTextbox',
		// Textbox-specific settings
		splitByGrapheme: false,
		editable: true,
	})

	// 3️⃣ Group Wrapper (atomic object)
	const group = new fabric.Group([container, textbox], {
		left: left,
		top: top,
		originX: 'left',
		originY: 'top',
		subTargetCheck: true, // Allow clicking on sub-objects
		// Custom metadata
		role: 'layout-block',
		slot: slot,
		layoutBlockId: id,
		containerPadding: padding,
	})

	// Store references for easy access
	group._layoutContainer = container
	group._layoutTextbox = textbox

	// Configure resize controls - disable vertical-only scaling
	group.setControlsVisibility({
		mt: false, // middle-top
		mb: false, // middle-bottom
		ml: true,  // middle-left
		mr: true,  // middle-right
		tl: true,  // top-left (corner)
		tr: true,  // top-right (corner)
		bl: true,  // bottom-left (corner)
		br: true,  // bottom-right (corner)
		mtr: true, // rotation
	})

	// Lock vertical scaling
	group.lockScalingY = false // We'll handle this in the scaling event

	return group
}

/**
 * Setup Layout Block event handlers on the canvas
 */
function setupLayoutBlockEvents() {
	if (!canvas) return

	// Handle double-click to enter text editing
	canvas.on('mouse:dblclick', (e) => {
		const target = e.target
		if (!target || target.role !== 'layout-block') return

		enterLayoutBlockEditMode(target)
	})

	// Handle scaling to maintain proper dimensions
	canvas.on('object:scaling', (e) => {
		const target = e.target
		if (!target || target.role !== 'layout-block') return

		handleLayoutBlockScaling(target)
	})

	// Handle after scaling is complete
	canvas.on('object:modified', (e) => {
		const target = e.target
		if (!target || target.role !== 'layout-block') return

		finalizeLayoutBlockResize(target)
	})
}

/**
 * Handle scaling of a layout block
 * Converts scale to actual width changes and reflows text
 */
function handleLayoutBlockScaling(group) {
	const scaleX = group.scaleX
	const scaleY = group.scaleY

	// Get original dimensions
	const container = group._layoutContainer
	const textbox = group._layoutTextbox
	const padding = group.containerPadding || 12

	if (!container || !textbox) return

	// Calculate new width based on horizontal scale
	const newWidth = container.width * scaleX
	const newTextWidth = newWidth - (padding * 2)

	// Update container width
	container.set('width', newWidth)

	// Update textbox width (this will reflow text)
	textbox.set('width', newTextWidth)

	// Keep height based on text content, not scaling
	// The container height will be adjusted after text reflows

	// Reset scale to 1 (we've applied the scale to actual dimensions)
	group.set({
		scaleX: 1,
		scaleY: 1,
	})

	// Recalculate group dimensions
	group.setCoords()
	canvas.renderAll()
}

/**
 * Finalize layout block resize after modification
 */
function finalizeLayoutBlockResize(group) {
	const container = group._layoutContainer
	const textbox = group._layoutTextbox
	const padding = group.containerPadding || 12

	if (!container || !textbox) return

	// Adjust container height to fit text content
	const textHeight = textbox.height
	const minHeight = textHeight + (padding * 2)
	
	if (container.height < minHeight) {
		container.set('height', minHeight)
	}

	// Update group bounding box
	group.addWithUpdate()
	group.setCoords()
	canvas.renderAll()
}

/**
 * Enter text editing mode for a layout block
 * 
 * ARCHITECTURE: Instead of ungrouping/regrouping (which causes position jumps),
 * we use an OVERLAY approach:
 * 1. Keep the group completely intact on canvas
 * 2. Make the group's textbox invisible
 * 3. Create a temporary editing textbox at the exact same absolute position
 * 4. After editing, sync content back and remove the overlay
 * 
 * This approach guarantees zero position changes to the group.
 */
function enterLayoutBlockEditMode(group) {
	if (!group || group.role !== 'layout-block') return
	
	// Prevent re-entry if already editing this group
	if (canvas._editingLayoutBlock?.group === group) return
	
	// Exit any existing edit mode first
	if (canvas._editingLayoutBlock) {
		exitLayoutBlockEditMode()
	}

	const textbox = group._layoutTextbox
	const container = group._layoutContainer
	if (!textbox || !container) return

	const fabric = window.fabric
	const padding = group.containerPadding || 12

	// 1️⃣ Store the group's absolute position (for reference, not modification)
	const groupLeft = group.left
	const groupTop = group.top
	const groupScaleX = group.scaleX || 1
	const groupScaleY = group.scaleY || 1
	const groupAngle = group.angle || 0

	// 2️⃣ Calculate the textbox's absolute position on canvas
	// In Fabric.js groups, items are positioned relative to the group's center
	const groupCenterX = groupLeft + (group.width * groupScaleX) / 2
	const groupCenterY = groupTop + (group.height * groupScaleY) / 2
	
	// Apply group transform to get absolute textbox position
	const textboxAbsLeft = groupCenterX + (textbox.left * groupScaleX)
	const textboxAbsTop = groupCenterY + (textbox.top * groupScaleY)
	const textboxAbsWidth = textbox.width * groupScaleX

	// 3️⃣ Hide the original textbox (but keep it in the group)
	const originalOpacity = textbox.opacity
	textbox.set('opacity', 0)

	// 4️⃣ Create a temporary editing textbox at the absolute position
	const editingTextbox = new fabric.Textbox(textbox.text, {
		left: textboxAbsLeft,
		top: textboxAbsTop,
		width: textboxAbsWidth,
		fontSize: textbox.fontSize * groupScaleY,
		fontFamily: textbox.fontFamily,
		fontWeight: textbox.fontWeight,
		fontStyle: textbox.fontStyle,
		fill: textbox.fill,
		textAlign: textbox.textAlign,
		lineHeight: textbox.lineHeight,
		angle: groupAngle,
		originX: 'left',
		originY: 'top',
		selectable: true,
		evented: true,
		editable: true,
		splitByGrapheme: false,
		// Mark as editing overlay
		_isEditingOverlay: true,
	})

	// 5️⃣ Add editing textbox to canvas
	canvas.add(editingTextbox)

	// 6️⃣ Make the group non-interactive during editing
	group.set({ selectable: false, evented: false })
	group.setCoords()

	// 7️⃣ Store editing state
	canvas._editingLayoutBlock = {
		group: group,
		originalTextbox: textbox,
		editingTextbox: editingTextbox,
		container: container,
		originalOpacity: originalOpacity,
		groupScaleX: groupScaleX,
		groupScaleY: groupScaleY,
	}

	// 8️⃣ Enter text editing mode on the overlay
	canvas.setActiveObject(editingTextbox)
	editingTextbox.enterEditing()
	editingTextbox.selectAll()
	canvas.renderAll()

	// 9️⃣ Listen for editing exit
	const exitHandler = () => {
		editingTextbox.off('editing:exited', exitHandler)
		// Small delay to ensure text is finalized
		setTimeout(() => exitLayoutBlockEditMode(), 0)
	}
	editingTextbox.on('editing:exited', exitHandler)
}

/**
 * Exit text editing mode and sync content back to the layout block
 * 
 * CRITICAL: The group was never modified, so there's nothing to restore.
 * We just sync the edited text content and remove the overlay.
 */
function exitLayoutBlockEditMode() {
	if (!canvas._editingLayoutBlock) return

	const { 
		group,
		originalTextbox,
		editingTextbox,
		container,
		originalOpacity,
		groupScaleX,
		groupScaleY,
	} = canvas._editingLayoutBlock

	if (!originalTextbox || !editingTextbox || !group) return

	const padding = group.containerPadding || 12

	// 1️⃣ Sync the edited text content back to the original textbox
	originalTextbox.set({
		text: editingTextbox.text,
		opacity: originalOpacity !== undefined ? originalOpacity : 1,
	})

	// 2️⃣ Update container height if text grew (but don't move the group!)
	const scaledTextHeight = editingTextbox.height / groupScaleY
	const minContainerHeight = scaledTextHeight + (padding * 2)
	if (container.height < minContainerHeight) {
		container.set('height', minContainerHeight)
	}

	// 3️⃣ Remove the editing overlay from canvas
	canvas.remove(editingTextbox)

	// 4️⃣ Restore group interactivity
	group.set({ selectable: true, evented: true })
	group.setCoords()

	// 5️⃣ Select the group
	canvas.setActiveObject(group)
	canvas.renderAll()

	// 6️⃣ Clear editing state
	canvas._editingLayoutBlock = null

	// 7️⃣ Trigger autosave and history
	scheduleAutosave()
	pushHistory()
}

/**
 * Update layout block container visibility based on editor mode
 */
function updateLayoutBlockVisibility() {
	if (!canvas) return

	canvas.getObjects().forEach(obj => {
		if (obj.role === 'layout-block' && obj._layoutContainer) {
			const isAuthorMode = editorMode.value === 'author'
			obj._layoutContainer.set({
				stroke: isAuthorMode ? '#3b82f6' : 'transparent',
				strokeDashArray: isAuthorMode ? [4, 4] : null,
			})
		}
	})
	canvas.renderAll()
}

// Watch for editor mode changes
watch(editorMode, () => {
	updateLayoutBlockVisibility()
})

/**
 * Restore layout block references after loading from JSON
 * This is necessary because _layoutContainer and _layoutTextbox are not serialized
 */
function restoreLayoutBlockReferences() {
	if (!canvas) return

	canvas.getObjects().forEach(obj => {
		if (obj.role === 'layout-block' && obj.type === 'group') {
			// Find container and textbox within the group
			const items = obj._objects || []
			const container = items.find(item => item.name === 'layoutContainer' || item.type === 'rect')
			const textbox = items.find(item => item.name === 'layoutTextbox' || item.type === 'textbox')

			if (container && textbox) {
				obj._layoutContainer = container
				obj._layoutTextbox = textbox

				// Ensure proper settings
				container.set({
					selectable: false,
					evented: false,
				})
				textbox.set({
					selectable: false,
					evented: false,
				})

				// Configure controls
				obj.setControlsVisibility({
					mt: false,
					mb: false,
					ml: true,
					mr: true,
					tl: true,
					tr: true,
					bl: true,
					br: true,
					mtr: true,
				})
			}
		}
	})

	// Update visibility based on current mode
	updateLayoutBlockVisibility()
}

// Lifecycle
onMounted(async () => {
	await loadFabric()
	await fetchCourse()
	await fetchOutline()
	window.addEventListener('resize', handleResize)
	window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	window.removeEventListener('keydown', handleKeydown)
	if (canvas) {
		canvas.dispose()
		canvas = null
	}
})

/**
 * Load Fabric.js from CDN
 */
async function loadFabric() {
	if (window.fabric) {
		fabricLoaded = true
		return
	}
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js'
		script.async = true
		script.onload = () => {
			fabricLoaded = true
			resolve()
		}
		script.onerror = () => reject(new Error('Failed to load Fabric.js'))
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
	// Exit any active editing mode before switching slides
	if (canvas?._editingLayoutBlock) {
		exitLayoutBlockEditMode()
	}
	
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
		initCanvas(data.konva_json)
	} catch (e) {
		toast.error(__('Failed to load slide'))
	}
}

/**
 * Initialize Fabric.js canvas
 * Supports loading from existing JSON (konva_json field - we'll migrate format)
 */
function initCanvas(existingJson) {
	if (!fabricLoaded || !fabricCanvas.value) return

	// Dispose existing canvas
	if (canvas) {
		canvas.dispose()
		canvas = null
	}

	const fabric = window.fabric

	// Create new canvas
	canvas = new fabric.Canvas(fabricCanvas.value, {
		width: canvasBaseWidth,
		height: canvasBaseHeight,
		backgroundColor: '#ffffff',
		selection: true,
		preserveObjectStacking: true,
	})

	// Configure default object controls (selection handles)
	fabric.Object.prototype.set({
		transparentCorners: false,
		cornerColor: '#3b82f6',
		cornerStrokeColor: '#3b82f6',
		cornerStyle: 'circle',
		cornerSize: 10,
		borderColor: '#3b82f6',
		borderScaleFactor: 2,
		padding: 5,
	})

	// Register custom Layout Block class for proper serialization
	registerLayoutBlockClass(fabric)

	// Load existing content if available
	if (existingJson) {
		try {
			// Try to parse as Fabric.js JSON first
			const parsed = typeof existingJson === 'string' ? JSON.parse(existingJson) : existingJson
			
			if (parsed.objects) {
				// It's Fabric.js format
				canvas.loadFromJSON(parsed, () => {
					restoreLayoutBlockReferences()
					canvas.renderAll()
					setupCanvasEvents()
					setupLayoutBlockEvents()
					fitCanvas()
					pushHistory()
				})
				return
			} else if (parsed.children || parsed.className === 'Stage') {
				// It's Konva format - convert to Fabric
				convertKonvaToFabric(parsed)
			}
		} catch (e) {
			console.warn('Failed to parse existing JSON:', e)
		}
	}

	setupCanvasEvents()
	setupLayoutBlockEvents()
	fitCanvas()
	pushHistory()
}

/**
 * Convert Konva JSON to Fabric.js objects
 */
function convertKonvaToFabric(konvaJson) {
	if (!canvas) return
	const fabric = window.fabric

	function processNode(node) {
		if (!node || !node.className) return

		const attrs = node.attrs || {}
		let fabricObj = null

		switch (node.className) {
			case 'Rect':
				fabricObj = new fabric.Rect({
					left: attrs.x || 0,
					top: attrs.y || 0,
					width: attrs.width || 100,
					height: attrs.height || 100,
					fill: attrs.fill || '#e0e7ff',
					stroke: attrs.stroke || '#4f46e5',
					strokeWidth: attrs.strokeWidth || 1,
					rx: attrs.cornerRadius || 0,
					ry: attrs.cornerRadius || 0,
					angle: attrs.rotation || 0,
				})
				break

			case 'Circle':
				fabricObj = new fabric.Circle({
					left: (attrs.x || 0) - (attrs.radius || 50),
					top: (attrs.y || 0) - (attrs.radius || 50),
					radius: attrs.radius || 50,
					fill: attrs.fill || '#fef3c7',
					stroke: attrs.stroke || '#f59e0b',
					strokeWidth: attrs.strokeWidth || 1,
					angle: attrs.rotation || 0,
				})
				break

			case 'Text':
				fabricObj = new fabric.IText(attrs.text || 'Text', {
					left: attrs.x || 0,
					top: attrs.y || 0,
					fontSize: attrs.fontSize || 24,
					fontFamily: attrs.fontFamily || 'Arial',
					fontWeight: attrs.fontStyle?.includes('bold') ? 'bold' : 'normal',
					fontStyle: attrs.fontStyle?.includes('italic') ? 'italic' : 'normal',
					fill: attrs.fill || '#111827',
					textAlign: attrs.align || 'left',
					angle: attrs.rotation || 0,
				})
				break

			case 'Line':
				const points = attrs.points || [0, 0, 100, 0]
				fabricObj = new fabric.Line(points, {
					left: attrs.x || 0,
					top: attrs.y || 0,
					stroke: attrs.stroke || '#6b7280',
					strokeWidth: attrs.strokeWidth || 2,
					angle: attrs.rotation || 0,
				})
				break

			case 'Arrow':
				// Fabric doesn't have native arrow - use line with triangle
				const arrowPoints = attrs.points || [0, 0, 100, 0]
				fabricObj = new fabric.Line(arrowPoints, {
					left: attrs.x || 0,
					top: attrs.y || 0,
					stroke: attrs.stroke || '#6b7280',
					strokeWidth: attrs.strokeWidth || 2,
					angle: attrs.rotation || 0,
				})
				break

			case 'RegularPolygon':
				// Triangle
				fabricObj = new fabric.Triangle({
					left: (attrs.x || 0) - (attrs.radius || 50),
					top: (attrs.y || 0) - (attrs.radius || 50),
					width: (attrs.radius || 50) * 2,
					height: (attrs.radius || 50) * 1.7,
					fill: attrs.fill || '#d1fae5',
					stroke: attrs.stroke || '#10b981',
					strokeWidth: attrs.strokeWidth || 1,
					angle: attrs.rotation || 0,
				})
				break

			case 'Star':
				// Use polygon for star
				const numPoints = attrs.numPoints || 5
				const outerRadius = attrs.outerRadius || 50
				const innerRadius = attrs.innerRadius || 25
				const starPoints = []
				for (let i = 0; i < numPoints * 2; i++) {
					const radius = i % 2 === 0 ? outerRadius : innerRadius
					const angle = (Math.PI / numPoints) * i - Math.PI / 2
					starPoints.push({
						x: Math.cos(angle) * radius,
						y: Math.sin(angle) * radius
					})
				}
				fabricObj = new fabric.Polygon(starPoints, {
					left: attrs.x || 0,
					top: attrs.y || 0,
					fill: attrs.fill || '#fce7f3',
					stroke: attrs.stroke || '#ec4899',
					strokeWidth: attrs.strokeWidth || 1,
					angle: attrs.rotation || 0,
				})
				break

			case 'Image':
				// Handle images separately (async)
				if (attrs.image?.src) {
					fabric.Image.fromURL(attrs.image.src, (img) => {
						img.set({
							left: attrs.x || 0,
							top: attrs.y || 0,
							scaleX: (attrs.width || img.width) / img.width,
							scaleY: (attrs.height || img.height) / img.height,
							angle: attrs.rotation || 0,
						})
						canvas.add(img)
						canvas.renderAll()
					})
				}
				break

			case 'Layer':
			case 'Stage':
				// Process children
				if (node.children) {
					node.children.forEach(child => processNode(child))
				}
				return
		}

		if (fabricObj) {
			fabricObj.set('id', attrs.id || `${node.className.toLowerCase()}-${Date.now()}`)
			canvas.add(fabricObj)
		}
	}

	// Process the Konva JSON tree
	if (konvaJson.children) {
		konvaJson.children.forEach(child => processNode(child))
	} else {
		processNode(konvaJson)
	}

	canvas.renderAll()
}

/**
 * Setup canvas event handlers
 */
function setupCanvasEvents() {
	if (!canvas) return

	// Selection events
	canvas.on('selection:created', handleSelection)
	canvas.on('selection:updated', handleSelection)
	canvas.on('selection:cleared', () => {
		selectedElement.value = null
		// Exit layout block editing when selection is cleared
		if (canvas._editingLayoutBlock) {
			exitLayoutBlockEditMode()
		}
	})

	// Object modification events
	canvas.on('object:modified', () => {
		updateSelectedElement()
		scheduleAutosave()
		pushHistory()
	})

	// Text editing events - Fabric.js handles this natively!
	canvas.on('text:editing:entered', () => {
		// Text is being edited - native cursor and selection
	})

	canvas.on('text:editing:exited', () => {
		updateSelectedElement()
		scheduleAutosave()
		pushHistory()
	})

	canvas.on('text:changed', () => {
		updateSelectedElement()
	})

	// Mouse events for snapping
	canvas.on('object:moving', (e) => {
		if (snapEnabled.value) {
			snapToGuides(e.target)
		}
	})
	
	// Handle clicking on canvas background to exit editing mode
	canvas.on('mouse:down', (e) => {
		if (!canvas._editingLayoutBlock) return
		
		// If clicking on the editing textbox, don't exit
		if (e.target === canvas._editingLayoutBlock.editingTextbox) return
		
		// If clicking on another object or background, exit editing mode
		const editingTextbox = canvas._editingLayoutBlock.editingTextbox
		if (editingTextbox && editingTextbox.isEditing) {
			editingTextbox.exitEditing()
			// exitLayoutBlockEditMode will be called by the editing:exited handler
		}
	})
}

/**
 * Handle object selection
 */
function handleSelection(e) {
	const obj = e.selected?.[0]
	if (!obj) {
		selectedElement.value = null
		return
	}

	// Handle layout blocks specially
	if (obj.role === 'layout-block') {
		const textbox = obj._layoutTextbox
		const container = obj._layoutContainer
		selectedElement.value = {
			id: obj.layoutBlockId || obj.type,
			type: 'layout-block',
			role: obj.role,
			slot: obj.slot,
			x: obj.left,
			y: obj.top,
			width: container?.width || obj.width,
			height: container?.height || obj.height,
			// Text properties from the textbox
			text: textbox?.text,
			fontSize: textbox?.fontSize,
			fontFamily: textbox?.fontFamily,
			fontWeight: textbox?.fontWeight,
			fontStyle: textbox?.fontStyle,
			textAlign: textbox?.textAlign,
			fill: textbox?.fill,
			// Container properties
			stroke: container?.stroke,
			strokeWidth: container?.strokeWidth,
			opacity: obj.opacity,
			angle: obj.angle,
			// Reference to Fabric object
			_fabricObject: obj,
		}
		return
	}

	selectedElement.value = {
		id: obj.id || obj.type,
		type: obj.type,
		x: obj.left,
		y: obj.top,
		width: obj.width * (obj.scaleX || 1),
		height: obj.height * (obj.scaleY || 1),
		fill: obj.fill,
		stroke: obj.stroke,
		strokeWidth: obj.strokeWidth,
		opacity: obj.opacity,
		angle: obj.angle,
		// Text properties
		text: obj.text,
		fontSize: obj.fontSize,
		fontFamily: obj.fontFamily,
		fontWeight: obj.fontWeight,
		fontStyle: obj.fontStyle,
		textAlign: obj.textAlign,
		// Reference to Fabric object
		_fabricObject: obj,
	}
}

/**
 * Update selected element state from Fabric object
 */
function updateSelectedElement() {
	const obj = canvas?.getActiveObject()
	if (obj) {
		handleSelection({ selected: [obj] })
	}
}

/**
 * Fit canvas to container
 */
function fitCanvas() {
	if (!canvas || !canvasContainer.value) return
	
	const containerRect = canvasContainer.value.getBoundingClientRect()
	const scale = Math.min(
		(containerRect.width - 48) / canvasBaseWidth,
		(containerRect.height - 48) / canvasBaseHeight,
		1
	)
	
	canvasDisplayWidth.value = canvasBaseWidth * scale
	canvasDisplayHeight.value = canvasBaseHeight * scale
	
	canvas.setDimensions({
		width: canvasDisplayWidth.value,
		height: canvasDisplayHeight.value
	})
	canvas.setZoom(scale)
	canvas.renderAll()
}

function handleResize() {
	fitCanvas()
}

/**
 * Handle keyboard shortcuts
 */
function handleKeydown(e) {
	if (!canvas) return
	
	// Skip shortcuts when editing text
	const activeObj = canvas.getActiveObject()
	if (activeObj && activeObj.isEditing) return
	
	// Delete element
	if (e.key === 'Delete' || e.key === 'Backspace') {
		if (canvas.getActiveObject()) {
			e.preventDefault()
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
		if (canvas.getActiveObject()) {
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
		if (canvas.getActiveObject()) {
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
		} else if (canvas.getActiveObject()) {
			canvas.discardActiveObject()
			canvas.renderAll()
			selectedElement.value = null
		}
	}
}

/**
 * Add a new element to the canvas
 */
function addElement(type) {
	if (!canvas) return
	const fabric = window.fabric
	const id = `${type}-${Date.now()}`
	let obj = null

	const centerX = canvasBaseWidth / 2
	const centerY = canvasBaseHeight / 2

	switch (type) {
		case 'rect':
			obj = new fabric.Rect({
				left: centerX - 100,
				top: centerY - 60,
				width: 200,
				height: 120,
				fill: '#e0e7ff',
				stroke: '#4f46e5',
				strokeWidth: 2,
			})
			break

		case 'roundedRect':
			obj = new fabric.Rect({
				left: centerX - 100,
				top: centerY - 60,
				width: 200,
				height: 120,
				fill: '#dbeafe',
				stroke: '#3b82f6',
				strokeWidth: 2,
				rx: 12,
				ry: 12,
			})
			break

		case 'circle':
			obj = new fabric.Circle({
				left: centerX - 60,
				top: centerY - 60,
				radius: 60,
				fill: '#fef3c7',
				stroke: '#f59e0b',
				strokeWidth: 2,
			})
			break

		case 'triangle':
			obj = new fabric.Triangle({
				left: centerX - 60,
				top: centerY - 52,
				width: 120,
				height: 104,
				fill: '#d1fae5',
				stroke: '#10b981',
				strokeWidth: 2,
			})
			break

		case 'star':
			// Create star using polygon
			const numPoints = 5
			const outerRadius = 60
			const innerRadius = 30
			const starPoints = []
			for (let i = 0; i < numPoints * 2; i++) {
				const radius = i % 2 === 0 ? outerRadius : innerRadius
				const angle = (Math.PI / numPoints) * i - Math.PI / 2
				starPoints.push({
					x: Math.cos(angle) * radius + outerRadius,
					y: Math.sin(angle) * radius + outerRadius
				})
			}
			obj = new fabric.Polygon(starPoints, {
				left: centerX - outerRadius,
				top: centerY - outerRadius,
				fill: '#fce7f3',
				stroke: '#ec4899',
				strokeWidth: 2,
			})
			break

		case 'line':
			obj = new fabric.Line([0, 0, 200, 0], {
				left: centerX - 100,
				top: centerY,
				stroke: '#6b7280',
				strokeWidth: 3,
				strokeLineCap: 'round',
			})
			break

		case 'arrow':
			// Create arrow using path
			obj = new fabric.Path('M 0 0 L 180 0 L 180 -8 L 200 0 L 180 8 L 180 0', {
				left: centerX - 100,
				top: centerY,
				fill: '#6b7280',
				stroke: '#6b7280',
				strokeWidth: 2,
			})
			break

		case 'text':
			// Use Layout Block for text - PowerPoint-style container + textbox
			obj = createTextLayoutBlock({
				left: centerX - 200,
				top: centerY - 40,
				width: 400,
				height: 80,
				text: 'Double-click to edit text',
				padding: 12,
				textStyle: {
					fontSize: 18,
					fontFamily: 'Arial',
					fill: '#111827',
				}
			})
			break

		case 'heading':
			// Use Layout Block for heading
			obj = createTextLayoutBlock({
				left: centerX - 300,
				top: centerY - 50,
				width: 600,
				height: 80,
				text: 'Heading',
				padding: 16,
				slot: 'title',
				textStyle: {
					fontSize: 36,
					fontFamily: 'Arial',
					fontWeight: 'bold',
					fill: '#111827',
					textAlign: 'center',
				}
			})
			break

		case 'image':
			// Image placeholder (dashed rect)
			obj = new fabric.Rect({
				left: centerX - 100,
				top: centerY - 75,
				width: 200,
				height: 150,
				fill: '#f3f4f6',
				stroke: '#d1d5db',
				strokeWidth: 2,
				strokeDashArray: [10, 5],
			})
			obj.set('isPlaceholder', true)
			break

		default:
			return
	}

	if (obj) {
		obj.set('id', id)
		canvas.add(obj)
		canvas.setActiveObject(obj)
		canvas.renderAll()
		handleSelection({ selected: [obj] })
		scheduleAutosave()
		pushHistory()
	}
}

/**
 * Update element properties from inspector
 */
function updateElement(attrs) {
	if (!selectedElement.value?._fabricObject) return
	const obj = selectedElement.value._fabricObject
	
	// Map common attribute names
	const fabricAttrs = {}
	Object.keys(attrs).forEach((key) => {
		if (key === '_fabricObject' || key === '_node') return
		
		// Map x/y to left/top for Fabric.js
		if (key === 'x') fabricAttrs.left = attrs[key]
		else if (key === 'y') fabricAttrs.top = attrs[key]
		else if (key === 'rotation' || key === 'angle') fabricAttrs.angle = attrs[key]
		else fabricAttrs[key] = attrs[key]
	})
	
	obj.set(fabricAttrs)
	canvas.renderAll()
	updateSelectedElement()
	scheduleAutosave()
}

/**
 * Delete selected element
 */
function deleteElement() {
	if (!canvas) return
	const obj = canvas.getActiveObject()
	if (!obj) return
	
	canvas.remove(obj)
	canvas.discardActiveObject()
	canvas.renderAll()
	selectedElement.value = null
	scheduleAutosave()
	pushHistory()
}

/**
 * NOTE: Fabric.js IText handles text editing NATIVELY!
 * No DOM overlay needed - just double-click on text to edit.
 * This is the main advantage of Fabric.js over Konva.
 */

let autosaveTimeout = null
function scheduleAutosave() {
	if (autosaveTimeout) clearTimeout(autosaveTimeout)
	saveStatus.value = __('Unsaved changes')
	autosaveTimeout = setTimeout(() => {
		saveSlide()
	}, 1500)
}

/**
 * Save slide canvas to backend
 * Uses Fabric.js JSON format (stored in konva_json field for compatibility)
 */
async function saveSlide() {
	if (!selectedSlide.value || !canvas) return
	saveStatus.value = __('Saving...')
	
	// Exit editing mode before saving to ensure clean state
	if (canvas._editingLayoutBlock) {
		exitLayoutBlockEditMode()
	}
	
	// Get Fabric.js JSON with custom properties for layout blocks
	// Exclude any editing overlay objects
	const json = JSON.stringify(canvas.toJSON([
		'id', 
		'isPlaceholder',
		'role',
		'slot',
		'layoutBlockId',
		'containerPadding',
		'name',
	]))
	
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

/**
 * Push current state to history for undo/redo
 */
function pushHistory() {
	if (!canvas) return
	
	// Don't push history while editing (overlay would be included)
	if (canvas._editingLayoutBlock) return
	
	const json = JSON.stringify(canvas.toJSON([
		'id', 
		'isPlaceholder',
		'role',
		'slot',
		'layoutBlockId',
		'containerPadding',
		'name',
	]))
	history.value = history.value.slice(0, historyIndex.value + 1)
	history.value.push(json)
	historyIndex.value = history.value.length - 1
}

function undo() {
	if (!canUndo.value) return
	// Exit editing mode before undo
	if (canvas?._editingLayoutBlock) {
		exitLayoutBlockEditMode()
	}
	historyIndex.value--
	restoreHistory()
}

function redo() {
	if (!canRedo.value) return
	// Exit editing mode before redo
	if (canvas?._editingLayoutBlock) {
		exitLayoutBlockEditMode()
	}
	historyIndex.value++
	restoreHistory()
}

function restoreHistory() {
	const json = history.value[historyIndex.value]
	if (json && canvas) {
		canvas.loadFromJSON(json, () => {
			restoreLayoutBlockReferences()
			canvas.renderAll()
			selectedElement.value = null
		})
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

// Layer actions (z-index) - Fabric.js implementation
function handleLayerAction(action) {
	if (!canvas) return
	const obj = canvas.getActiveObject()
	if (!obj) return
	
	switch (action) {
		case 'bringToFront':
			canvas.bringToFront(obj)
			break
		case 'bringForward':
			canvas.bringForward(obj)
			break
		case 'sendBackward':
			canvas.sendBackwards(obj)
			break
		case 'sendToBack':
			canvas.sendToBack(obj)
			break
	}
	canvas.renderAll()
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
	if (!canvas) return
	const obj = canvas.getActiveObject()
	if (!obj) return
	
	obj.clone((cloned) => {
		clipboard.value = cloned
		toast.success(__('Copied'))
	})
}

function pasteElement() {
	if (!clipboard.value || !canvas) return
	
	clipboard.value.clone((cloned) => {
		cloned.set({
			left: cloned.left + 20,
			top: cloned.top + 20,
			id: `${cloned.type}-${Date.now()}`,
		})
		canvas.add(cloned)
		canvas.setActiveObject(cloned)
		canvas.renderAll()
		handleSelection({ selected: [cloned] })
		scheduleAutosave()
		pushHistory()
	})
}

function duplicateElement() {
	if (!canvas) return
	const obj = canvas.getActiveObject()
	if (!obj) return
	
	obj.clone((cloned) => {
		cloned.set({
			left: cloned.left + 20,
			top: cloned.top + 20,
			id: `${cloned.type}-${Date.now()}`,
		})
		canvas.add(cloned)
		canvas.setActiveObject(cloned)
		canvas.renderAll()
		handleSelection({ selected: [cloned] })
		scheduleAutosave()
		pushHistory()
	})
}

// Smart guides / Snapping - Fabric.js implementation
const SNAP_THRESHOLD = 10

function snapToGuides(target) {
	if (!canvas) return
	
	const canvasCenterX = canvasBaseWidth / 2
	const canvasCenterY = canvasBaseHeight / 2
	
	const targetLeft = target.left
	const targetTop = target.top
	const targetCenterX = targetLeft + (target.width * target.scaleX) / 2
	const targetCenterY = targetTop + (target.height * target.scaleY) / 2
	const targetRight = targetLeft + target.width * target.scaleX
	const targetBottom = targetTop + target.height * target.scaleY
	
	// Snap to canvas center
	if (Math.abs(targetCenterX - canvasCenterX) < SNAP_THRESHOLD) {
		target.set('left', canvasCenterX - (target.width * target.scaleX) / 2)
	}
	if (Math.abs(targetCenterY - canvasCenterY) < SNAP_THRESHOLD) {
		target.set('top', canvasCenterY - (target.height * target.scaleY) / 2)
	}
	
	// Snap to canvas edges
	if (Math.abs(targetLeft) < SNAP_THRESHOLD) {
		target.set('left', 0)
	}
	if (Math.abs(targetTop) < SNAP_THRESHOLD) {
		target.set('top', 0)
	}
	if (Math.abs(targetRight - canvasBaseWidth) < SNAP_THRESHOLD) {
		target.set('left', canvasBaseWidth - target.width * target.scaleX)
	}
	if (Math.abs(targetBottom - canvasBaseHeight) < SNAP_THRESHOLD) {
		target.set('top', canvasBaseHeight - target.height * target.scaleY)
	}
	
	// Snap to other objects
	canvas.getObjects().forEach(obj => {
		if (obj === target) return
		
		const objLeft = obj.left
		const objTop = obj.top
		const objCenterX = objLeft + (obj.width * obj.scaleX) / 2
		const objCenterY = objTop + (obj.height * obj.scaleY) / 2
		const objRight = objLeft + obj.width * obj.scaleX
		const objBottom = objTop + obj.height * obj.scaleY
		
		// Horizontal alignment
		if (Math.abs(targetLeft - objLeft) < SNAP_THRESHOLD) {
			target.set('left', objLeft)
		}
		if (Math.abs(targetLeft - objRight) < SNAP_THRESHOLD) {
			target.set('left', objRight)
		}
		if (Math.abs(targetCenterX - objCenterX) < SNAP_THRESHOLD) {
			target.set('left', objCenterX - (target.width * target.scaleX) / 2)
		}
		if (Math.abs(targetRight - objLeft) < SNAP_THRESHOLD) {
			target.set('left', objLeft - target.width * target.scaleX)
		}
		if (Math.abs(targetRight - objRight) < SNAP_THRESHOLD) {
			target.set('left', objRight - target.width * target.scaleX)
		}
		
		// Vertical alignment
		if (Math.abs(targetTop - objTop) < SNAP_THRESHOLD) {
			target.set('top', objTop)
		}
		if (Math.abs(targetTop - objBottom) < SNAP_THRESHOLD) {
			target.set('top', objBottom)
		}
		if (Math.abs(targetCenterY - objCenterY) < SNAP_THRESHOLD) {
			target.set('top', objCenterY - (target.height * target.scaleY) / 2)
		}
		if (Math.abs(targetBottom - objTop) < SNAP_THRESHOLD) {
			target.set('top', objTop - target.height * target.scaleY)
		}
		if (Math.abs(targetBottom - objBottom) < SNAP_THRESHOLD) {
			target.set('top', objBottom - target.height * target.scaleY)
		}
	})
}

// Grid toggle
function toggleGrid() {
	showGrid.value = !showGrid.value
	drawGrid()
}

let gridLines = []
function drawGrid() {
	if (!canvas) return
	const fabric = window.fabric
	
	// Remove existing grid lines
	gridLines.forEach(line => canvas.remove(line))
	gridLines = []
	
	if (!showGrid.value) {
		canvas.renderAll()
		return
	}
	
	const gridSize = 50
	
	// Draw vertical lines
	for (let x = 0; x <= canvasBaseWidth; x += gridSize) {
		const line = new fabric.Line([x, 0, x, canvasBaseHeight], {
			stroke: '#e5e7eb',
			strokeWidth: 1,
			selectable: false,
			evented: false,
			excludeFromExport: true,
		})
		gridLines.push(line)
		canvas.add(line)
		canvas.sendToBack(line)
	}
	
	// Draw horizontal lines
	for (let y = 0; y <= canvasBaseHeight; y += gridSize) {
		const line = new fabric.Line([0, y, canvasBaseWidth, y], {
			stroke: '#e5e7eb',
			strokeWidth: 1,
			selectable: false,
			evented: false,
			excludeFromExport: true,
		})
		gridLines.push(line)
		canvas.add(line)
		canvas.sendToBack(line)
	}
	
	canvas.renderAll()
}

// Zoom handling - Fabric.js implementation
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
	
	canvasDisplayWidth.value = Math.round(canvasBaseWidth * scale * 0.78)
	canvasDisplayHeight.value = Math.round(canvasBaseHeight * scale * 0.78)
	
	nextTick(() => {
		if (canvas) {
			canvas.setDimensions({
				width: canvasDisplayWidth.value,
				height: canvasDisplayHeight.value
			})
			canvas.setZoom(scale * 0.78)
			canvas.renderAll()
		}
	})
}

// Apply slide template - Fabric.js implementation with Layout Blocks
function applyTemplate(template) {
	if (!canvas) return
	const fabric = window.fabric
	
	// Clear existing content (except grid)
	const objects = canvas.getObjects().filter(obj => !gridLines.includes(obj))
	objects.forEach(obj => canvas.remove(obj))
	
	// Apply background color if specified
	if (template.background) {
		canvas.backgroundColor = template.background
	}
	
	// Add template elements
	template.elements?.forEach(el => {
		let obj = null
		const id = `${el.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		
		switch (el.type) {
			case 'Text':
				// Use Layout Block for all text elements in templates
				obj = createTextLayoutBlock({
					left: el.attrs.x || 0,
					top: el.attrs.y || 0,
					width: el.attrs.width || 400,
					height: el.attrs.height || 60,
					text: el.attrs.text || 'Text',
					padding: el.attrs.padding || 12,
					slot: el.attrs.slot || null,
					textStyle: {
						fontSize: el.attrs.fontSize || 18,
						fontFamily: el.attrs.fontFamily || 'Arial',
						fontWeight: el.attrs.fontStyle?.includes('bold') ? 'bold' : 'normal',
						fontStyle: el.attrs.fontStyle?.includes('italic') ? 'italic' : 'normal',
						fill: el.attrs.fill || '#111827',
						textAlign: el.attrs.align || 'left',
					}
				})
				break
			case 'Rect':
				obj = new fabric.Rect({
					left: el.attrs.x || 0,
					top: el.attrs.y || 0,
					width: el.attrs.width || 100,
					height: el.attrs.height || 100,
					fill: el.attrs.fill || '#e0e7ff',
					stroke: el.attrs.stroke || '#4f46e5',
					strokeWidth: el.attrs.strokeWidth || 1,
					rx: el.attrs.cornerRadius || 0,
					ry: el.attrs.cornerRadius || 0,
					strokeDashArray: el.attrs.dash || null,
				})
				if (el.attrs.dash) {
					obj.set('isPlaceholder', true)
				}
				break
			case 'Circle':
				obj = new fabric.Circle({
					left: (el.attrs.x || 0) - (el.attrs.radius || 50),
					top: (el.attrs.y || 0) - (el.attrs.radius || 50),
					radius: el.attrs.radius || 50,
					fill: el.attrs.fill || '#fef3c7',
					stroke: el.attrs.stroke || '#f59e0b',
					strokeWidth: el.attrs.strokeWidth || 1,
				})
				break
			case 'Line':
				const points = el.attrs.points || [0, 0, 100, 0]
				obj = new fabric.Line(points, {
					left: el.attrs.x || 0,
					top: el.attrs.y || 0,
					stroke: el.attrs.stroke || '#6b7280',
					strokeWidth: el.attrs.strokeWidth || 2,
				})
				break
		}
		
		if (obj) {
			// Only set id for non-layout-block objects (layout blocks have their own id)
			if (obj.role !== 'layout-block') {
				obj.set('id', id)
			}
			canvas.add(obj)
		}
	})
	
	canvas.discardActiveObject()
	canvas.renderAll()
	selectedElement.value = null
	scheduleAutosave()
	pushHistory()
	toast.success(__('Template applied'))
}

// Image upload handling - Fabric.js implementation
function handleImageUpload(file) {
	if (!file || !canvas) return
	const fabric = window.fabric
	
	const reader = new FileReader()
	reader.onload = (e) => {
		fabric.Image.fromURL(e.target.result, (img) => {
			// Check if we have a selected placeholder to replace
			const selectedObj = selectedElement.value?._fabricObject
			const isPlaceholder = selectedObj && selectedObj.isPlaceholder
			
			let left, top, scaleX, scaleY
			
			if (isPlaceholder) {
				// Use placeholder's position and size
				const placeholderWidth = selectedObj.width * selectedObj.scaleX
				const placeholderHeight = selectedObj.height * selectedObj.scaleY
				
				// Maintain aspect ratio within placeholder bounds
				const imgRatio = img.width / img.height
				const placeholderRatio = placeholderWidth / placeholderHeight
				
				let newWidth, newHeight
				if (imgRatio > placeholderRatio) {
					// Image is wider - fit to width
					newWidth = placeholderWidth
					newHeight = placeholderWidth / imgRatio
				} else {
					// Image is taller - fit to height
					newHeight = placeholderHeight
					newWidth = placeholderHeight * imgRatio
				}
				
				scaleX = newWidth / img.width
				scaleY = newHeight / img.height
				
				// Center within original placeholder bounds
				left = selectedObj.left + (placeholderWidth - newWidth) / 2
				top = selectedObj.top + (placeholderHeight - newHeight) / 2
				
				// Remove the placeholder
				canvas.remove(selectedObj)
			} else {
				// New image - scale to fit within reasonable bounds
				const maxSize = 400
				let scale = 1
				
				if (img.width > maxSize || img.height > maxSize) {
					scale = Math.min(maxSize / img.width, maxSize / img.height)
				}
				
				scaleX = scale
				scaleY = scale
				left = canvasBaseWidth / 2 - (img.width * scale) / 2
				top = canvasBaseHeight / 2 - (img.height * scale) / 2
			}
			
			img.set({
				id: `image-${Date.now()}`,
				left,
				top,
				scaleX,
				scaleY,
			})
			
			canvas.add(img)
			canvas.setActiveObject(img)
			canvas.renderAll()
			handleSelection({ selected: [img] })
			scheduleAutosave()
			pushHistory()
		})
	}
	reader.readAsDataURL(file)
}
</script>
