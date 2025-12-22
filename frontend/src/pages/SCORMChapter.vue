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
						{{ loadingMessage }}
					</div>
					<div v-if="scormLoadError && retryCount < maxRetries" class="mt-4">
						<Button variant="solid" @click="retryLoad">
							{{ __('Retry') }}
						</Button>
					</div>
				</div>
			</div>
			<iframe
				:key="iframeKey"
				:src="chapter.doc.launch_file"
				class="w-full h-full"
				loading="eager"
				importance="high"
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
				allow="autoplay; fullscreen; accelerometer; gyroscope"
				@load="onScormIframeLoaded"
				@error="onScormIframeError"
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
const loadStartTime = ref(0)
const retryCount = ref(0)
const maxRetries = 3
let scormLoadTimeout = null
let pendingUpdates = {}
let commitTimeout = null

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
	loadStartTime.value = Date.now()
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
	if (saveTimeout) clearTimeout(saveTimeout)
	if (commitTimeout) clearTimeout(commitTimeout)
	flushPendingUpdates()
	delete window.API_1484_11
	delete window.API
})

const chapter = createDocumentResource({
	doctype: 'Course Chapter',
	name: props.chapterName,
	auto: true,
	cache: ['chapter', props.chapterName],
	onSuccess(data) {
		resetLoadingState()
		if (data.launch_file) {
			const link = document.createElement('link')
			link.rel = 'prefetch'
			link.href = data.launch_file
			document.head.appendChild(link)
		}
		iframeKey.value++
		scormLoadTimeout = setTimeout(() => {
			scormLoadError.value = true
			scormLoading.value = false
		}, 15000)
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

const flushPendingUpdates = () => {
	if (Object.keys(pendingUpdates).length === 0) return

	const hasStatusChange = 'cmi.core.lesson_status' in pendingUpdates
	const hasSuspendData = 'cmi.suspend_data' in pendingUpdates

	if (hasStatusChange && pendingUpdates['cmi.core.lesson_status'] === 'passed') {
		isSuccessfullyCompleted.value = true
		saveProgress({
			is_complete: true,
			scorm_content: pendingUpdates['cmi.suspend_data'] || '',
		})
	} else if (hasStatusChange && pendingUpdates['cmi.core.lesson_status'] === 'failed' && courseRestartOnFailure) {
		saveProgress({
			is_complete: isSuccessfullyCompleted.value,
			scorm_content: '',
		})
	} else if (hasSuspendData && !isSuccessfullyCompleted.value) {
		saveProgress({
			is_complete: false,
			scorm_content: pendingUpdates['cmi.suspend_data'],
		})
	}

	pendingUpdates = {}
}

const saveDataToLMS = (key, value) => {
	pendingUpdates[key] = value

	if (key === 'cmi.core.lesson_status') {
		clearTimeout(commitTimeout)
		flushPendingUpdates()
	} else {
		clearTimeout(commitTimeout)
		commitTimeout = setTimeout(flushPendingUpdates, 1000)
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
	retryCount.value = 0
	if (scormLoadTimeout) clearTimeout(scormLoadTimeout)
}

const onScormIframeError = () => {
	if (retryCount.value < maxRetries) {
		retryCount.value++
		setTimeout(() => {
			resetLoadingState()
			iframeKey.value++
		}, 2000)
	} else {
		scormLoadError.value = true
		scormLoading.value = false
	}
}

const retryLoad = () => {
	retryCount.value = 0
	resetLoadingState()
	iframeKey.value++
	scormLoadTimeout = setTimeout(() => {
		scormLoadError.value = true
		scormLoading.value = false
	}, 15000)
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

const loadingMessage = computed(() => {
	if (scormLoadError.value) {
		if (retryCount.value > 0) {
			return __('Retrying... ({0}/{1})', [retryCount.value, maxRetries])
		}
		return __('Content is taking longer than expected to load.')
	}
	const elapsed = Date.now() - loadStartTime.value
	if (elapsed < 5000) return __('Initializing content...')
	if (elapsed < 10000) return __('Loading resources...')
	return __('Almost ready...')
})

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
