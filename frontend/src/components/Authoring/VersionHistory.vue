<template>
	<Transition
		enter-active-class="transition ease-out duration-200"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition ease-in duration-150"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
			<div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
				<div class="flex items-center justify-between px-4 py-3 border-b">
					<h3 class="text-lg font-semibold text-ink-gray-9">{{ __('Version History') }}</h3>
					<Button variant="ghost" size="sm" @click="$emit('close')">
						<template #icon>
							<X class="w-4 h-4" />
						</template>
					</Button>
				</div>

				<div class="flex-1 overflow-y-auto p-4">
					<div v-if="loading" class="flex items-center justify-center py-8">
						<div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
					</div>

					<div v-else-if="!versions.length" class="text-center py-8 text-ink-gray-5">
						{{ __('No published versions yet.') }}
					</div>

					<div v-else class="space-y-3">
						<div
							v-for="version in versions"
							:key="version.name"
							class="border rounded-lg p-4 hover:bg-surface-gray-1 transition-colors"
						>
							<div class="flex items-start justify-between">
								<div>
									<div class="flex items-center space-x-2">
										<span class="font-medium text-ink-gray-9">
											{{ __('Version') }} {{ version.version_number }}
										</span>
										<span
											v-if="version.is_current"
											class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full"
										>
											{{ __('Current') }}
										</span>
									</div>
									<div class="text-sm text-ink-gray-5 mt-1">
										{{ formatDate(version.creation) }}
									</div>
									<div v-if="version.notes" class="text-sm text-ink-gray-6 mt-2">
										{{ version.notes }}
									</div>
								</div>
								<Button
									v-if="!version.is_current"
									variant="outline"
									size="sm"
									@click="rollback(version)"
									:loading="rollingBack === version.name"
								>
									{{ __('Restore') }}
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div class="border-t px-4 py-3">
					<div class="flex items-center space-x-2">
						<input
							v-model="publishNotes"
							type="text"
							class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							:placeholder="__('Version notes (optional)')"
							@keydown.enter="publish"
						/>
						<Button variant="solid" @click="publish" :loading="publishing">
							{{ __('Publish New Version') }}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button, call, toast } from 'frappe-ui'
import { X } from 'lucide-vue-next'

const props = defineProps({
	show: { type: Boolean, default: false },
	course: { type: String, required: true },
})

const emit = defineEmits(['close', 'published', 'restored'])

const versions = ref([])
const loading = ref(false)
const publishing = ref(false)
const rollingBack = ref(null)
const publishNotes = ref('')

watch(() => props.show, async (val) => {
	if (val) {
		await loadVersions()
	}
})

async function loadVersions() {
	loading.value = true
	try {
		const data = await call('lms.lms.authoring_api.list_course_versions', {
			course: props.course,
		})
		versions.value = data || []
	} catch (e) {
		toast.error(__('Failed to load versions'))
		versions.value = []
	} finally {
		loading.value = false
	}
}

async function publish() {
	publishing.value = true
	try {
		await call('lms.lms.authoring_api.publish_course', {
			course: props.course,
			notes: publishNotes.value || undefined,
		})
		toast.success(__('Course published successfully'))
		publishNotes.value = ''
		await loadVersions()
		emit('published')
	} catch (e) {
		toast.error(e.message || __('Failed to publish course'))
	} finally {
		publishing.value = false
	}
}

async function rollback(version) {
	rollingBack.value = version.name
	try {
		await call('lms.lms.authoring_api.rollback_to_version', {
			version: version.name,
		})
		toast.success(__('Restored to version') + ' ' + version.version_number)
		await loadVersions()
		emit('restored', version)
	} catch (e) {
		toast.error(e.message || __('Failed to restore version'))
	} finally {
		rollingBack.value = null
	}
}

function formatDate(dateStr) {
	if (!dateStr) return ''
	const date = new Date(dateStr)
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
</script>
