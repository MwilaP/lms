<template>
	<Teleport to="body">
		<Transition
			enter-active-class="transition-all duration-300 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-all duration-200 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div 
				v-if="show" 
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
				@click.self="$emit('close')"
			>
				<div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-6xl h-[85vh] flex flex-col overflow-hidden">
					<!-- Header -->
					<div class="flex items-center justify-between px-6 py-4 border-b bg-surface-gray-1">
						<div class="flex items-center space-x-3">
							<LayoutGrid class="w-5 h-5 text-blue-600" />
							<h2 class="text-lg font-semibold text-ink-gray-9">{{ __('Slide Sorter') }}</h2>
							<span class="text-sm text-ink-gray-5">
								{{ totalSlides }} {{ totalSlides === 1 ? __('slide') : __('slides') }}
							</span>
						</div>
						<div class="flex items-center space-x-2">
							<!-- Bulk Actions (when slides selected) -->
							<Transition
								enter-active-class="transition-all duration-150"
								enter-from-class="opacity-0 scale-95"
								enter-to-class="opacity-100 scale-100"
								leave-active-class="transition-all duration-100"
								leave-from-class="opacity-100"
								leave-to-class="opacity-0"
							>
								<div v-if="selectedSlides.length > 0" class="flex items-center space-x-2 mr-4 px-3 py-1.5 bg-blue-50 rounded-lg">
									<span class="text-sm font-medium text-blue-700">
										{{ selectedSlides.length }} {{ __('selected') }}
									</span>
									<Button variant="ghost" size="sm" @click="duplicateSelected" title="Duplicate">
										<template #icon><CopyPlus class="w-4 h-4" /></template>
									</Button>
									<Button variant="ghost" size="sm" class="text-red-600 hover:bg-red-50" @click="deleteSelected" title="Delete">
										<template #icon><Trash2 class="w-4 h-4" /></template>
									</Button>
									<Button variant="ghost" size="sm" @click="clearSelection">
										<X class="w-4 h-4" />
									</Button>
								</div>
							</Transition>
							<Button variant="ghost" size="sm" @click="$emit('close')">
								<X class="w-5 h-5" />
							</Button>
						</div>
					</div>

					<!-- Content -->
					<div class="flex-1 overflow-y-auto p-6">
						<div v-for="chapter in outline?.chapters" :key="chapter.name" class="mb-8">
							<!-- Chapter Header -->
							<div class="flex items-center space-x-2 mb-4 pb-2 border-b">
								<Folder class="w-4 h-4 text-amber-500" />
								<h3 class="text-sm font-semibold text-ink-gray-7">{{ chapter.title }}</h3>
							</div>

							<div v-for="lesson in chapter.lessons" :key="lesson.name" class="mb-6">
								<!-- Lesson Header -->
								<div class="flex items-center space-x-2 mb-3">
									<BookOpen class="w-4 h-4 text-blue-500" />
									<h4 class="text-sm font-medium text-ink-gray-6">{{ lesson.title }}</h4>
									<span class="text-xs text-ink-gray-4">
										({{ lesson.slides?.length || 0 }} {{ __('slides') }})
									</span>
								</div>

								<!-- Slides Grid -->
								<div 
									class="grid gap-4"
									:style="{ gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))` }"
								>
									<div
										v-for="(slide, slideIdx) in lesson.slides"
										:key="slide.name"
										class="relative group cursor-pointer"
										:class="{
											'ring-2 ring-blue-500 ring-offset-2': isSelected(slide.name),
											'ring-2 ring-blue-300': currentSlide === slide.name && !isSelected(slide.name)
										}"
										draggable="true"
										@click="handleSlideClick($event, slide, lesson)"
										@dblclick="goToSlide(slide.name)"
										@dragstart="handleDragStart($event, slide, lesson)"
										@dragover.prevent="handleDragOver($event, slide, lesson, slideIdx)"
										@dragleave="handleDragLeave"
										@drop="handleDrop($event, lesson, slideIdx)"
									>
										<!-- Thumbnail -->
										<div class="aspect-video bg-surface-gray-2 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors">
											<img 
												v-if="slide.thumbnail" 
												:src="slide.thumbnail" 
												:alt="slide.title"
												class="w-full h-full object-cover"
											/>
											<div v-else class="w-full h-full flex items-center justify-center">
												<FileSliders class="w-8 h-8 text-ink-gray-3" />
											</div>
										</div>

										<!-- Slide Number & Title -->
										<div class="mt-2 px-1">
											<div class="flex items-center space-x-1">
												<span class="text-xs font-medium text-ink-gray-5">{{ slideIdx + 1 }}</span>
												<span class="text-xs text-ink-gray-4 truncate">{{ slide.title || __('Untitled') }}</span>
											</div>
										</div>

										<!-- Selection Checkbox -->
										<div 
											class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
											:class="{ 'opacity-100': isSelected(slide.name) }"
										>
											<div 
												class="w-5 h-5 rounded border-2 flex items-center justify-center bg-white shadow-sm"
												:class="isSelected(slide.name) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
											>
												<Check v-if="isSelected(slide.name)" class="w-3 h-3 text-white" />
											</div>
										</div>

										<!-- Context Menu Button -->
										<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button 
												variant="ghost" 
												size="sm" 
												class="!p-1 bg-white/80 hover:bg-white shadow-sm"
												@click.stop="showContextMenu($event, slide, lesson)"
											>
												<MoreVertical class="w-4 h-4" />
											</Button>
										</div>

										<!-- Drop Indicator -->
										<div 
											v-if="dropTarget?.slideIdx === slideIdx && dropTarget?.lessonName === lesson.name"
											class="absolute inset-y-0 w-1 bg-blue-500 rounded-full transition-all"
											:class="dropPosition === 'before' ? '-left-2' : '-right-2'"
										/>
									</div>

									<!-- Add Slide Button -->
									<div 
										class="aspect-video bg-surface-gray-1 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center cursor-pointer transition-all group"
										@click="addSlideToLesson(lesson.name)"
									>
										<div class="text-center">
											<Plus class="w-6 h-6 text-ink-gray-4 group-hover:text-blue-500 mx-auto" />
											<span class="text-xs text-ink-gray-4 group-hover:text-blue-500 mt-1 block">{{ __('Add Slide') }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Footer -->
					<div class="px-6 py-3 border-t bg-surface-gray-1 flex items-center justify-between">
						<div class="text-xs text-ink-gray-5">
							{{ __('Tip: Ctrl+Click to multi-select, drag to reorder, double-click to edit') }}
						</div>
						<Button variant="outline" @click="$emit('close')">
							{{ __('Close') }}
						</Button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button, call, toast } from 'frappe-ui'
import {
	X,
	LayoutGrid,
	Folder,
	BookOpen,
	FileSliders,
	Plus,
	Check,
	MoreVertical,
	CopyPlus,
	Trash2,
} from 'lucide-vue-next'

const props = defineProps({
	show: { type: Boolean, default: false },
	outline: { type: Object, default: null },
	currentSlide: { type: String, default: null },
})

const emit = defineEmits(['close', 'select-slide', 'refresh-outline'])

// Selection state
const selectedSlides = ref([])

// Drag state
const draggedSlide = ref(null)
const draggedFromLesson = ref(null)
const dropTarget = ref(null)
const dropPosition = ref('after')

// Computed
const totalSlides = computed(() => {
	let count = 0
	for (const ch of props.outline?.chapters || []) {
		for (const le of ch.lessons || []) {
			count += le.slides?.length || 0
		}
	}
	return count
})

// Selection methods
function isSelected(slideName) {
	return selectedSlides.value.includes(slideName)
}

function handleSlideClick(event, slide, lesson) {
	if (event.ctrlKey || event.metaKey) {
		// Multi-select toggle
		const idx = selectedSlides.value.indexOf(slide.name)
		if (idx >= 0) {
			selectedSlides.value.splice(idx, 1)
		} else {
			selectedSlides.value.push(slide.name)
		}
	} else if (event.shiftKey && selectedSlides.value.length > 0) {
		// Range select (simplified - just add to selection)
		if (!isSelected(slide.name)) {
			selectedSlides.value.push(slide.name)
		}
	} else {
		// Single select
		selectedSlides.value = [slide.name]
	}
}

function clearSelection() {
	selectedSlides.value = []
}

function goToSlide(slideName) {
	emit('select-slide', slideName)
	emit('close')
}

// Drag and Drop
function handleDragStart(event, slide, lesson) {
	draggedSlide.value = slide
	draggedFromLesson.value = lesson
	event.dataTransfer.effectAllowed = 'move'
	event.dataTransfer.setData('text/plain', slide.name)
}

function handleDragOver(event, slide, lesson, slideIdx) {
	if (!draggedSlide.value) return
	
	const rect = event.currentTarget.getBoundingClientRect()
	const midpoint = rect.left + rect.width / 2
	dropPosition.value = event.clientX < midpoint ? 'before' : 'after'
	dropTarget.value = { slideName: slide.name, lessonName: lesson.name, slideIdx }
}

function handleDragLeave() {
	dropTarget.value = null
}

async function handleDrop(event, targetLesson, targetIdx) {
	if (!draggedSlide.value) return
	
	const slide = draggedSlide.value
	const sourceLesson = draggedFromLesson.value
	const actualIdx = dropPosition.value === 'after' ? targetIdx + 1 : targetIdx
	
	// Reset drag state
	draggedSlide.value = null
	draggedFromLesson.value = null
	dropTarget.value = null
	
	// Skip if no change
	if (sourceLesson.name === targetLesson.name) {
		const currentIdx = sourceLesson.slides.findIndex(s => s.name === slide.name)
		if (currentIdx === actualIdx || currentIdx === actualIdx - 1) return
	}
	
	try {
		await call('lms.lms.authoring_api.reorder_slide', {
			slide: slide.name,
			source_lesson: sourceLesson.name,
			target_lesson: targetLesson.name,
			idx: actualIdx,
		})
		emit('refresh-outline')
		toast.success(__('Slide moved'))
	} catch (e) {
		toast.error(__('Failed to move slide'))
	}
}

// Bulk actions
async function duplicateSelected() {
	if (selectedSlides.value.length === 0) return
	
	try {
		for (const slideName of selectedSlides.value) {
			// Find the lesson for this slide
			let lessonName = null
			for (const ch of props.outline?.chapters || []) {
				for (const le of ch.lessons || []) {
					if (le.slides?.some(s => s.name === slideName)) {
						lessonName = le.name
						break
					}
				}
				if (lessonName) break
			}
			
			if (lessonName) {
				await call('lms.lms.authoring_api.duplicate_slide', {
					slide: slideName,
					lesson: lessonName,
				})
			}
		}
		emit('refresh-outline')
		toast.success(__(`${selectedSlides.value.length} slide(s) duplicated`))
		clearSelection()
	} catch (e) {
		toast.error(__('Failed to duplicate slides'))
	}
}

async function deleteSelected() {
	if (selectedSlides.value.length === 0) return
	
	if (!confirm(__(`Delete ${selectedSlides.value.length} slide(s)? This cannot be undone.`))) {
		return
	}
	
	try {
		for (const slideName of selectedSlides.value) {
			await call('lms.lms.authoring_api.delete_slide', {
				slide: slideName,
			})
		}
		emit('refresh-outline')
		toast.success(__(`${selectedSlides.value.length} slide(s) deleted`))
		clearSelection()
	} catch (e) {
		toast.error(__('Failed to delete slides'))
	}
}

async function addSlideToLesson(lessonName) {
	try {
		const result = await call('lms.lms.authoring_api.create_slide', {
			lesson: lessonName,
		})
		emit('refresh-outline')
		toast.success(__('Slide added'))
	} catch (e) {
		toast.error(__('Failed to add slide'))
	}
}

function showContextMenu(event, slide, lesson) {
	// For now, just select the slide
	// Could implement a proper context menu later
	selectedSlides.value = [slide.name]
}
</script>
