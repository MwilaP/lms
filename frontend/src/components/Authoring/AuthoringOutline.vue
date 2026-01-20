<template>
	<div class="py-2">
		<div v-if="!outline?.chapters?.length" class="px-4 py-8 text-center text-sm text-ink-gray-5">
			{{ __('No chapters yet. Click + to add one.') }}
		</div>
		<Draggable
			v-else
			:list="outline.chapters"
			item-key="name"
			group="chapters"
			handle=".chapter-handle"
			@end="onChapterReorder"
		>
			<template #item="{ element: chapter }">
				<div class="chapter-item">
					<Disclosure v-slot="{ open }" :defaultOpen="true">
						<div class="flex items-center group px-3 py-2 hover:bg-surface-gray-2">
							<GripVertical class="w-3.5 h-3.5 text-ink-gray-4 chapter-handle cursor-grab mr-1 opacity-0 group-hover:opacity-100" />
							<DisclosureButton class="flex items-center flex-1 min-w-0">
								<ChevronRight
									class="w-4 h-4 text-ink-gray-5 shrink-0 transition-transform"
									:class="{ 'rotate-90': open }"
								/>
								<FolderOpen v-if="open" class="w-4 h-4 text-ink-gray-6 ml-1 shrink-0" />
								<Folder v-else class="w-4 h-4 text-ink-gray-6 ml-1 shrink-0" />
								<span class="ml-2 text-sm font-medium text-ink-gray-8 truncate">
									{{ chapter.title }}
								</span>
							</DisclosureButton>
							<Button
								variant="ghost"
								size="sm"
								class="opacity-0 group-hover:opacity-100"
								@click.stop="$emit('add-lesson', chapter.name)"
							>
								<template #icon>
									<Plus class="w-3.5 h-3.5" />
								</template>
							</Button>
						</div>
						<DisclosurePanel>
							<Draggable
								:list="chapter.lessons"
								item-key="name"
								group="lessons"
								handle=".lesson-handle"
								@end="onLessonReorder"
							>
								<template #item="{ element: lesson }">
									<div class="lesson-item">
										<Disclosure v-slot="{ open: lessonOpen }" :defaultOpen="true">
											<div class="flex items-center group pl-7 pr-3 py-1.5 hover:bg-surface-gray-2">
												<GripVertical class="w-3 h-3 text-ink-gray-4 lesson-handle cursor-grab mr-1 opacity-0 group-hover:opacity-100" />
												<DisclosureButton class="flex items-center flex-1 min-w-0">
													<ChevronRight
														class="w-3.5 h-3.5 text-ink-gray-5 shrink-0 transition-transform"
														:class="{ 'rotate-90': lessonOpen }"
													/>
													<FileText class="w-3.5 h-3.5 text-ink-gray-5 ml-1 shrink-0" />
													<span class="ml-2 text-sm text-ink-gray-7 truncate">
														{{ lesson.title }}
													</span>
												</DisclosureButton>
												<Button
													variant="ghost"
													size="sm"
													class="opacity-0 group-hover:opacity-100"
													@click.stop="$emit('add-slide', lesson.name)"
												>
													<template #icon>
														<Plus class="w-3 h-3" />
													</template>
												</Button>
											</div>
											<DisclosurePanel>
												<Draggable
													:list="lesson.slides"
													item-key="name"
													group="slides"
													handle=".slide-handle"
													@end="onSlideReorder"
												>
													<template #item="{ element: slide }">
														<div
															class="flex items-center group pl-12 pr-3 py-1.5 cursor-pointer hover:bg-surface-gray-2"
															:class="{ 'bg-blue-50': selectedSlide === slide.name }"
															@click="$emit('select-slide', slide.name)"
														>
															<GripVertical class="w-3 h-3 text-ink-gray-4 slide-handle cursor-grab mr-1 opacity-0 group-hover:opacity-100" />
															<Layers class="w-3.5 h-3.5 text-ink-gray-4 shrink-0" />
															<span
																class="ml-2 text-sm truncate"
																:class="selectedSlide === slide.name ? 'text-blue-600 font-medium' : 'text-ink-gray-6'"
															>
																{{ slide.title }}
															</span>
														</div>
													</template>
												</Draggable>
												<div v-if="!lesson.slides?.length" class="pl-12 pr-3 py-2 text-xs text-ink-gray-4">
													{{ __('No slides') }}
												</div>
											</DisclosurePanel>
										</Disclosure>
									</div>
								</template>
							</Draggable>
							<div v-if="!chapter.lessons?.length" class="pl-7 pr-3 py-2 text-xs text-ink-gray-4">
								{{ __('No lessons') }}
							</div>
						</DisclosurePanel>
					</Disclosure>
				</div>
			</template>
		</Draggable>
	</div>
</template>

<script setup>
import { Button } from 'frappe-ui'
import Draggable from 'vuedraggable'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import {
	ChevronRight,
	Folder,
	FolderOpen,
	FileText,
	Layers,
	Plus,
	GripVertical,
} from 'lucide-vue-next'

defineProps({
	outline: {
		type: Object,
		required: true,
	},
	selectedSlide: {
		type: String,
		default: null,
	},
})

const emit = defineEmits(['select-slide', 'add-lesson', 'add-slide', 'reorder'])

function onChapterReorder(e) {
	emit('reorder', { type: 'chapter', event: e })
}

function onLessonReorder(e) {
	emit('reorder', { type: 'lesson', event: e })
}

function onSlideReorder(e) {
	emit('reorder', { type: 'slide', event: e })
}
</script>
