<template>
	<header
		class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
	>
		<Breadcrumbs class="h-7" :items="breadcrumbs" />
	</header>
	<div
		v-if="
			readyToRender &&
			(enrollment.data?.length ||
				user.data?.is_moderator ||
				user.data?.is_instructor)
		"
	>
		<div class="relative w-full h-[calc(100vh-3.00rem)]">
			<div
				v-if="scormLoading || scormLoadError"
				class="absolute inset-0 z-10 flex items-center justify-center bg-surface-white/80"
			>
				<div class="flex flex-col items-center px-4 text-center">
					<div
						v-if="!scormLoadError"
						class="h-10 w-10 rounded-full border-4 border-outline-gray-2 border-t-ink-gray-7 animate-spin"
					></div>
					<div class="mt-3 text-sm text-ink-gray-7">
						{{
							scormLoadError
								? __('SCORM is taking longer than expected to load.')
								: __('Loading SCORM content...')
						}}
					</div>
				</div>
			</div>
			<iframe
				:key="iframeKey"
				:src="chapter.doc.launch_file"
				class="w-full h-full"
				@load="onScormIframeLoaded"
			/>
		</div>
	</div>
	<div v-else-if="!enrollment.data?.length">
		<div class="text-center pt-10 px-5 md:px-0 pb-10">
			<div class="text-center">
				<div class="mb-4">
					{{
						__(
							'You are not enrolled in this course. Please enroll to access this lesson.'
						)
					}}
				</div>
				<Button variant="solid" @click="enrollStudent()">
					{{ __('Start Learning') }}
				</Button>
			</div>
		</div>
	</div>
</template>
<script setup>
import {
	Breadcrumbs,
	Button,
	call,
	createDocumentResource,
	createListResource,
	createResource,
	usePageMeta,
} from 'frappe-ui'
import { computed, inject, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSidebar } from '@/stores/sidebar'
import { sessionStore } from '../stores/session'

const { brand } = sessionStore()
const sidebarStore = useSidebar()
const user = inject('$user')
const readyToRender = ref(false)
const isSuccessfullyCompleted = ref(false)
const scormLoading = ref(true)
const scormLoadError = ref(false)
const iframeKey = ref(0)
let scormLoadTimeout = null

// If courseRestartOnFailure is true, student has to restart the whole course if failed.
// Otherwise, student could retake the final quiz portion.
// Ideally, this should be configurable along with `Number of failures before course should restart`.
const courseRestartOnFailure = false

const props = defineProps({
	courseName: {
		type: String,
		required: true,
	},
	chapterName: {
		type: String,
		required: true,
	},
})

const resetLoadingState = () => {
	readyToRender.value = false
	scormLoading.value = true
	scormLoadError.value = false
	if (scormLoadTimeout) clearTimeout(scormLoadTimeout)
}

onBeforeMount(() => {
	sidebarStore.isSidebarCollapsed = true
	setupSCORMAPI()
	resetLoadingState()
})

onMounted(() => {
	// Force chapter reload on mount
	if (chapter.doc) {
		resetLoadingState()
		progress.submit()
	}
})

onBeforeUnmount(() => {
	if (scormLoadTimeout) clearTimeout(scormLoadTimeout)
})

const chapter = createDocumentResource({
	doctype: 'Course Chapter',
	name: props.chapterName,
	auto: true,
	cache: ['chapter', props.chapterName],
	onSuccess(data) {
		resetLoadingState()
		iframeKey.value++
		scormLoadTimeout = setTimeout(() => {
			scormLoadError.value = true
			scormLoading.value = false
		}, 30000)
		progress.submit()
	},
})

const enrollment = createListResource({
	doctype: 'LMS Enrollment',
	fields: ['member', 'course'],
	filters: {
		course: props.courseName,
		member: user.data?.name,
	},
	auto: true,
	cache: ['enrollments', props.courseName, user.data?.name],
})

const getDataFromLMS = (key) => {
	if (key === 'cmi.core.lesson_status') {
		return progress.data?.status === 'Complete' ? 'passed' : 'incomplete'
	} else if (key === 'cmi.launch_data') {
		return progress.data?.scorm_content || ''
	} else if (key === 'cmi.suspend_data') {
		return progress.data?.scorm_content || ''
	}
	return ''
}

let saveTimeout = null
const debouncedSaveProgress = (scormDetails) => {
	clearTimeout(saveTimeout)
	saveTimeout = setTimeout(() => {
		saveProgress(scormDetails)
	}, 300)
}

const saveDataToLMS = (key, value) => {
	if (key === 'cmi.core.lesson_status') {
		if (value === 'passed') {
			isSuccessfullyCompleted.value = true
			saveProgress({
				is_complete: isSuccessfullyCompleted.value,
				scorm_content: '',
			})
		} else if (value === 'failed' && courseRestartOnFailure) {
			saveProgress({
				is_complete: isSuccessfullyCompleted.value,
				scorm_content: '',
			})
		}
	} else if (key === 'cmi.suspend_data' && !isSuccessfullyCompleted.value) {
		debouncedSaveProgress({
			is_complete: false,
			scorm_content: value,
		})
	}
}

const saveProgress = (scormDetails = null) => {
	call('lms.lms.doctype.course_lesson.course_lesson.save_progress', {
		lesson: chapter.doc.lessons[0].lesson,
		course: props.courseName,
		scorm_details: scormDetails,
	})
}

const progress = createResource({
	url: 'frappe.client.get_value',
	makeParams(values) {
		return {
			doctype: 'LMS Course Progress',
			fieldname: ['status', 'scorm_content'],
			filters: {
				member: user.data?.name,
				lesson: chapter.doc.lessons[0].lesson,
				chapter: chapter.doc.name,
				course: chapter.doc?.course,
			},
		}
	},
	onSuccess(data) {
		readyToRender.value = true
	},
})


const onScormIframeLoaded = () => {
	scormLoading.value = false
	scormLoadError.value = false
	if (scormLoadTimeout) clearTimeout(scormLoadTimeout)
}

// Watch for chapter name changes (navigation)
watch(
	() => props.chapterName,
	(newChapter, oldChapter) => {
		if (newChapter !== oldChapter) {
			resetLoadingState()
			chapter.reload()
		}
	}
)

const enrollStudent = () => {
	enrollment.insert.submit(
		{
			course: props.courseName,
			member: user.data?.name,
		},
		{
			onSuccess(data) {
				window.location.reload()
			},
		}
	)
}

const setupSCORMAPI = () => {
	window.API_1484_11 = {
		Initialize: () => 'true',
		Terminate: () => 'true',
		GetValue: (key) => {
			console.log(`GET: ${key}`)
			return getDataFromLMS(key)
		},
		SetValue: (key, value) => {
			console.log(`SET: ${key} to value: ${value}`)

			saveDataToLMS(key, value)
			return 'true'
		},
		Commit: () => 'true',
		GetLastError: () => '0',
		GetErrorString: () => '',
		GetDiagnostic: () => '',
	}
	window.API = {
		LMSInitialize: () => 'true',
		LMSFinish: () => 'true',
		LMSGetValue: (key) => {
			console.log(`GET: ${key}`)
			return getDataFromLMS(key)
		},
		LMSSetValue: (key, value) => {
			console.log(`SET: ${key} to value: ${value}`)
			saveDataToLMS(key, value)
			return 'true'
		},
		LMSCommit: () => 'true',
		LMSGetLastError: () => '0',
		LMSGetErrorString: () => '',
		LMSGetDiagnostic: () => '',
	}
}

const breadcrumbs = computed(() => {
	return [
		{
			label: 'Courses',
			route: { name: 'Courses' },
		},
		{
			label: chapter.doc?.course_title,
			route: { name: 'CourseDetail', params: { courseName: props.courseName } },
		},
		{
			label: chapter.doc?.title,
		},
	]
})

usePageMeta(() => {
	return {
		title: chapter.doc?.title,
		icon: brand.favicon,
	}
})
</script>
