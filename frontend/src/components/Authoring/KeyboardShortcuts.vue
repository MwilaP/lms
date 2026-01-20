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
			<div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
				<div class="flex items-center justify-between px-6 py-4 border-b">
					<div class="flex items-center space-x-2">
						<Keyboard class="w-5 h-5 text-ink-gray-6" />
						<h3 class="text-lg font-semibold text-ink-gray-9">{{ __('Keyboard Shortcuts') }}</h3>
					</div>
					<Button variant="ghost" size="sm" @click="$emit('close')">
						<template #icon>
							<X class="w-4 h-4" />
						</template>
					</Button>
				</div>

				<div class="flex-1 overflow-y-auto p-6">
					<div class="grid grid-cols-2 gap-8">
						<div v-for="category in shortcuts" :key="category.name">
							<h4 class="text-sm font-semibold text-ink-gray-7 mb-3 uppercase tracking-wide">
								{{ category.name }}
							</h4>
							<div class="space-y-2">
								<div
									v-for="shortcut in category.items"
									:key="shortcut.keys"
									class="flex items-center justify-between py-1.5"
								>
									<span class="text-sm text-ink-gray-6">{{ shortcut.action }}</span>
									<div class="flex items-center space-x-1">
										<kbd
											v-for="key in shortcut.keys.split('+')"
											:key="key"
											class="px-2 py-1 text-xs font-medium bg-surface-gray-2 text-ink-gray-7 rounded border border-outline-gray-2 min-w-[24px] text-center"
										>
											{{ key }}
										</kbd>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="border-t px-6 py-4 bg-surface-gray-1 rounded-b-xl">
					<p class="text-xs text-ink-gray-5 text-center">
						{{ __('Press') }} <kbd class="px-1.5 py-0.5 text-xs bg-white border rounded">?</kbd> {{ __('anytime to show this panel') }}
					</p>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { Button } from 'frappe-ui'
import { X, Keyboard } from 'lucide-vue-next'

defineProps({
	show: { type: Boolean, default: false },
})

defineEmits(['close'])

const shortcuts = [
	{
		name: 'General',
		items: [
			{ keys: 'Ctrl+S', action: 'Save slide' },
			{ keys: 'Ctrl+Z', action: 'Undo' },
			{ keys: 'Ctrl+Y', action: 'Redo' },
			{ keys: 'Ctrl+Shift+Z', action: 'Redo' },
			{ keys: '?', action: 'Show shortcuts' },
		],
	},
	{
		name: 'Elements',
		items: [
			{ keys: 'Delete', action: 'Delete selected' },
			{ keys: 'Backspace', action: 'Delete selected' },
			{ keys: 'Ctrl+C', action: 'Copy element' },
			{ keys: 'Ctrl+V', action: 'Paste element' },
			{ keys: 'Ctrl+D', action: 'Duplicate element' },
		],
	},
	{
		name: 'Canvas',
		items: [
			{ keys: 'G', action: 'Toggle grid' },
			{ keys: 'Ctrl++', action: 'Zoom in' },
			{ keys: 'Ctrl+-', action: 'Zoom out' },
			{ keys: 'Ctrl+0', action: 'Fit to screen' },
		],
	},
	{
		name: 'Navigation',
		items: [
			{ keys: 'Esc', action: 'Deselect / Close modal' },
			{ keys: '←', action: 'Previous slide (preview)' },
			{ keys: '→', action: 'Next slide (preview)' },
			{ keys: 'Space', action: 'Next slide (preview)' },
		],
	},
]
</script>
