<template>
	<div class="p-4 space-y-4">
		<h3 class="text-sm font-semibold text-ink-gray-8 flex items-center space-x-2">
			<Zap class="w-4 h-4 text-amber-500" />
			<span>{{ __('Animations') }}</span>
		</h3>

		<!-- No element selected -->
		<div v-if="!elementId" class="text-sm text-ink-gray-5 text-center py-4">
			{{ __('Select an element to add animations') }}
		</div>

		<template v-else>
			<!-- Animation Type Tabs -->
			<div class="flex border-b">
				<button
					v-for="tab in tabs"
					:key="tab.value"
					class="flex-1 py-2 text-xs font-medium border-b-2 transition-colors"
					:class="activeTab === tab.value 
						? 'border-amber-500 text-amber-600' 
						: 'border-transparent text-ink-gray-5 hover:text-ink-gray-7'"
					@click="activeTab = tab.value"
				>
					{{ tab.label }}
				</button>
			</div>

			<!-- Animation List -->
			<div class="space-y-2">
				<div
					v-for="anim in animationOptions[activeTab]"
					:key="anim.value"
					class="flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all hover:border-amber-300"
					:class="isSelected(anim.value) ? 'border-amber-500 bg-amber-50' : 'border-gray-200'"
					@click="selectAnimation(anim.value)"
				>
					<component :is="anim.icon" class="w-4 h-4 mr-2" :class="isSelected(anim.value) ? 'text-amber-600' : 'text-ink-gray-5'" />
					<span class="text-sm" :class="isSelected(anim.value) ? 'text-amber-700 font-medium' : 'text-ink-gray-7'">
						{{ anim.label }}
					</span>
					<Check v-if="isSelected(anim.value)" class="w-4 h-4 ml-auto text-amber-600" />
				</div>
			</div>

			<!-- Duration & Delay -->
			<div v-if="hasAnimation" class="space-y-3 pt-2 border-t">
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<label class="text-xs font-medium text-ink-gray-6">{{ __('Duration') }}</label>
						<span class="text-xs text-ink-gray-5">{{ animation.duration }}s</span>
					</div>
					<input
						type="range"
						min="0.1"
						max="2"
						step="0.1"
						:value="animation.duration"
						@input="updateAnimation('duration', parseFloat($event.target.value))"
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
					/>
				</div>

				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<label class="text-xs font-medium text-ink-gray-6">{{ __('Delay') }}</label>
						<span class="text-xs text-ink-gray-5">{{ animation.delay }}s</span>
					</div>
					<input
						type="range"
						min="0"
						max="3"
						step="0.1"
						:value="animation.delay"
						@input="updateAnimation('delay', parseFloat($event.target.value))"
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
					/>
				</div>

				<!-- Trigger -->
				<div class="space-y-1">
					<label class="text-xs font-medium text-ink-gray-6">{{ __('Start') }}</label>
					<select
						:value="animation.trigger"
						@change="updateAnimation('trigger', $event.target.value)"
						class="w-full text-sm border rounded-lg px-2 py-1.5"
					>
						<option value="on-click">{{ __('On Click') }}</option>
						<option value="with-previous">{{ __('With Previous') }}</option>
						<option value="after-previous">{{ __('After Previous') }}</option>
					</select>
				</div>

				<!-- Preview -->
				<Button variant="outline" size="sm" class="w-full" @click="previewAnimation">
					<template #prefix>
						<Play class="w-3.5 h-3.5" />
					</template>
					{{ __('Preview') }}
				</Button>

				<!-- Remove Animation -->
				<Button variant="ghost" size="sm" class="w-full text-red-500" @click="removeAnimation">
					<template #prefix>
						<Trash2 class="w-3.5 h-3.5" />
					</template>
					{{ __('Remove Animation') }}
				</Button>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { Button } from 'frappe-ui'
import {
	Zap,
	Play,
	Check,
	Trash2,
	// Animation icons
	Eye,
	EyeOff,
	ArrowRightCircle,
	ArrowLeftCircle,
	ArrowUpCircle,
	ArrowDownCircle,
	ZoomIn,
	ZoomOut,
	Move,
	Sparkles,
	Vibrate,
	HighlighterIcon,
	CircleOff,
} from 'lucide-vue-next'

const props = defineProps({
	elementId: { type: String, default: null },
	modelValue: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'preview'])

const activeTab = ref('entrance')

const animation = reactive({
	entrance: null,
	emphasis: null,
	exit: null,
	duration: 0.5,
	delay: 0,
	trigger: 'on-click',
})

// Sync with modelValue
watch(() => props.modelValue, (val) => {
	if (val) {
		animation.entrance = val.entrance?.type || null
		animation.emphasis = val.emphasis?.type || null
		animation.exit = val.exit?.type || null
		animation.duration = val.duration || 0.5
		animation.delay = val.delay || 0
		animation.trigger = val.trigger || 'on-click'
	}
}, { immediate: true, deep: true })

const tabs = [
	{ value: 'entrance', label: 'Entrance' },
	{ value: 'emphasis', label: 'Emphasis' },
	{ value: 'exit', label: 'Exit' },
]

const animationOptions = {
	entrance: [
		{ value: 'none', label: 'None', icon: CircleOff },
		{ value: 'fade-in', label: 'Fade In', icon: Eye },
		{ value: 'fly-in-left', label: 'Fly In Left', icon: ArrowRightCircle },
		{ value: 'fly-in-right', label: 'Fly In Right', icon: ArrowLeftCircle },
		{ value: 'fly-in-top', label: 'Fly In Top', icon: ArrowDownCircle },
		{ value: 'fly-in-bottom', label: 'Fly In Bottom', icon: ArrowUpCircle },
		{ value: 'zoom-in', label: 'Zoom In', icon: ZoomIn },
		{ value: 'bounce-in', label: 'Bounce In', icon: Move },
	],
	emphasis: [
		{ value: 'none', label: 'None', icon: CircleOff },
		{ value: 'pulse', label: 'Pulse', icon: Sparkles },
		{ value: 'shake', label: 'Shake', icon: Vibrate },
		{ value: 'highlight', label: 'Highlight', icon: HighlighterIcon },
	],
	exit: [
		{ value: 'none', label: 'None', icon: CircleOff },
		{ value: 'fade-out', label: 'Fade Out', icon: EyeOff },
		{ value: 'fly-out-left', label: 'Fly Out Left', icon: ArrowLeftCircle },
		{ value: 'fly-out-right', label: 'Fly Out Right', icon: ArrowRightCircle },
		{ value: 'zoom-out', label: 'Zoom Out', icon: ZoomOut },
	],
}

const hasAnimation = computed(() => {
	return animation.entrance || animation.emphasis || animation.exit
})

function isSelected(value) {
	return animation[activeTab.value] === value
}

function selectAnimation(value) {
	animation[activeTab.value] = value === 'none' ? null : value
	emitUpdate()
}

function updateAnimation(key, value) {
	animation[key] = value
	emitUpdate()
}

function removeAnimation() {
	animation[activeTab.value] = null
	emitUpdate()
}

function emitUpdate() {
	const data = {
		entrance: animation.entrance ? { type: animation.entrance } : null,
		emphasis: animation.emphasis ? { type: animation.emphasis } : null,
		exit: animation.exit ? { type: animation.exit } : null,
		duration: animation.duration,
		delay: animation.delay,
		trigger: animation.trigger,
	}
	emit('update:modelValue', data)
}

function previewAnimation() {
	emit('preview', {
		type: animation[activeTab.value],
		category: activeTab.value,
		duration: animation.duration,
	})
}
</script>
