<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-ink-gray-8">{{ __('Interactions') }}</span>
			<Button variant="ghost" size="sm" @click="addInteraction" :disabled="!elementId">
				<template #icon>
					<Plus class="w-4 h-4" />
				</template>
			</Button>
		</div>

		<div v-if="!elementId" class="text-xs text-ink-gray-5 text-center py-4">
			{{ __('Select an element to add interactions') }}
		</div>

		<div v-else-if="!interactions.length" class="text-xs text-ink-gray-5 text-center py-4">
			{{ __('No interactions. Click + to add one.') }}
		</div>

		<div v-else class="space-y-3">
			<div
				v-for="(interaction, idx) in interactions"
				:key="interaction.name || idx"
				class="border rounded-lg p-3 bg-surface-gray-1"
			>
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-medium text-ink-gray-7">
						{{ getEventLabel(interaction.event) }}
					</span>
					<Button variant="ghost" size="sm" @click="removeInteraction(idx)">
						<template #icon>
							<Trash2 class="w-3 h-3 text-ink-red-4" />
						</template>
					</Button>
				</div>

				<div class="space-y-2">
					<div>
						<label class="text-xs text-ink-gray-5">{{ __('Event') }}</label>
						<select
							v-model="interaction.event"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						>
							<option value="OnClick">{{ __('On Click') }}</option>
							<option value="OnEnterSlide">{{ __('On Enter Slide') }}</option>
							<option value="OnTimer">{{ __('On Timer') }}</option>
						</select>
					</div>

					<div v-if="interaction.event === 'OnTimer'">
						<label class="text-xs text-ink-gray-5">{{ __('Delay (seconds)') }}</label>
						<input
							type="number"
							v-model.number="interaction.delay"
							min="0"
							step="0.5"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						/>
					</div>

					<div>
						<label class="text-xs text-ink-gray-5">{{ __('Action') }}</label>
						<select
							v-model="interaction.actionType"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						>
							<option value="GoToSlide">{{ __('Go to Slide') }}</option>
							<option value="GoToNextSlide">{{ __('Go to Next Slide') }}</option>
							<option value="GoToPrevSlide">{{ __('Go to Previous Slide') }}</option>
							<option value="ShowElement">{{ __('Show Element') }}</option>
							<option value="HideElement">{{ __('Hide Element') }}</option>
							<option value="ToggleElement">{{ __('Toggle Element') }}</option>
							<option value="NavigateLesson">{{ __('Navigate to Lesson') }}</option>
							<option value="OpenURL">{{ __('Open URL') }}</option>
						</select>
					</div>

					<div v-if="interaction.actionType === 'GoToSlide'">
						<label class="text-xs text-ink-gray-5">{{ __('Target Slide') }}</label>
						<select
							v-model="interaction.targetSlide"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						>
							<option v-for="slide in availableSlides" :key="slide.name" :value="slide.name">
								{{ slide.title }}
							</option>
						</select>
					</div>

					<div v-if="['ShowElement', 'HideElement', 'ToggleElement'].includes(interaction.actionType)">
						<label class="text-xs text-ink-gray-5">{{ __('Target Element ID') }}</label>
						<input
							type="text"
							v-model="interaction.targetElementId"
							placeholder="element-id"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						/>
					</div>

					<div v-if="interaction.actionType === 'NavigateLesson'">
						<label class="text-xs text-ink-gray-5">{{ __('Target Lesson') }}</label>
						<input
							type="text"
							v-model="interaction.targetLesson"
							placeholder="lesson-name"
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						/>
					</div>

					<div v-if="interaction.actionType === 'OpenURL'">
						<label class="text-xs text-ink-gray-5">{{ __('URL') }}</label>
						<input
							type="url"
							v-model="interaction.targetUrl"
							placeholder="https://..."
							class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
							@change="saveInteraction(interaction)"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Button, call, toast } from 'frappe-ui'
import { Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
	slide: { type: String, default: null },
	elementId: { type: String, default: null },
	availableSlides: { type: Array, default: () => [] },
})

const emit = defineEmits(['update'])

const interactions = ref([])

watch(() => [props.slide, props.elementId], async () => {
	if (props.slide && props.elementId) {
		await loadInteractions()
	} else {
		interactions.value = []
	}
}, { immediate: true })

async function loadInteractions() {
	try {
		const data = await call('lms.lms.authoring_api.list_slide_interactions', {
			slide: props.slide,
		})
		interactions.value = (data || [])
			.filter(i => i.element_id === props.elementId)
			.map(parseInteraction)
	} catch (e) {
		interactions.value = []
	}
}

function parseInteraction(raw) {
	let actions = {}
	try {
		actions = JSON.parse(raw.actions_json || '{}')
	} catch (e) {}
	return {
		name: raw.name,
		event: raw.event || 'OnClick',
		delay: actions.delay || 0,
		actionType: actions.type || 'GoToNextSlide',
		targetSlide: actions.targetSlide || '',
		targetElementId: actions.targetElementId || '',
		targetLesson: actions.targetLesson || '',
		targetUrl: actions.targetUrl || '',
	}
}

function serializeInteraction(interaction) {
	return {
		name: interaction.name,
		slide: props.slide,
		element_id: props.elementId,
		event: interaction.event,
		actions_json: JSON.stringify({
			type: interaction.actionType,
			delay: interaction.delay,
			targetSlide: interaction.targetSlide,
			targetElementId: interaction.targetElementId,
			targetLesson: interaction.targetLesson,
			targetUrl: interaction.targetUrl,
		}),
	}
}

async function addInteraction() {
	const newInteraction = {
		name: null,
		event: 'OnClick',
		delay: 0,
		actionType: 'GoToNextSlide',
		targetSlide: '',
		targetElementId: '',
		targetLesson: '',
		targetUrl: '',
	}
	interactions.value.push(newInteraction)
	await saveInteraction(newInteraction)
}

async function saveInteraction(interaction) {
	try {
		const payload = serializeInteraction(interaction)
		const result = await call('lms.lms.authoring_api.upsert_interaction', {
			data: JSON.stringify(payload),
		})
		if (result?.name && !interaction.name) {
			interaction.name = result.name
		}
		emit('update')
	} catch (e) {
		toast.error(__('Failed to save interaction'))
	}
}

async function removeInteraction(idx) {
	const interaction = interactions.value[idx]
	if (interaction.name) {
		try {
			await call('lms.lms.authoring_api.delete_interaction', {
				name: interaction.name,
			})
		} catch (e) {
			toast.error(__('Failed to delete interaction'))
			return
		}
	}
	interactions.value.splice(idx, 1)
	emit('update')
}

function getEventLabel(event) {
	const labels = {
		OnClick: __('On Click'),
		OnEnterSlide: __('On Enter Slide'),
		OnTimer: __('On Timer'),
	}
	return labels[event] || event
}
</script>
