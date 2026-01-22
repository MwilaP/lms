<template>
	<div class="flex items-center bg-surface-white border-b px-2 py-1.5 shrink-0 space-x-1">
		<!-- Shape Tools -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				:active="activeTool === 'select'"
				@click="setTool('select')"
				title="Select (V)"
			>
				<MousePointer2 class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- Insert Shapes -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				@click="$emit('add-element', 'rect')"
				:disabled="disabled"
				title="Rectangle (R)"
			>
				<Square class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'roundedRect')"
				:disabled="disabled"
				title="Rounded Rectangle"
			>
				<RectangleHorizontal class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'circle')"
				:disabled="disabled"
				title="Circle (C)"
			>
				<Circle class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'triangle')"
				:disabled="disabled"
				title="Triangle"
			>
				<Triangle class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'star')"
				:disabled="disabled"
				title="Star"
			>
				<Star class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'line')"
				:disabled="disabled"
				title="Line (L)"
			>
				<Minus class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'arrow')"
				:disabled="disabled"
				title="Arrow (A)"
			>
				<ArrowRight class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- Text & Media -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				@click="$emit('add-element', 'text')"
				:disabled="disabled"
				title="Text (T)"
			>
				<Type class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('add-element', 'heading')"
				:disabled="disabled"
				title="Heading"
			>
				<Heading class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="triggerImageUpload"
				:disabled="disabled"
				title="Image (I)"
			>
				<ImageIcon class="w-4 h-4" />
			</ToolButton>
			<input
				ref="imageInput"
				type="file"
				accept="image/*"
				class="hidden"
				@change="handleImageUpload"
			/>
		</div>

		<!-- Font Selector (when text is selected) -->
		<div v-if="isTextSelected" class="flex items-center border-r pr-2 mr-1 space-x-2 bg-blue-50 px-2 py-1 rounded-lg">
			<div class="flex items-center space-x-1">
				<Type class="w-3.5 h-3.5 text-blue-600" />
				<select
					:value="currentFont"
					@change="$emit('font-change', $event.target.value)"
					class="text-sm border border-blue-200 rounded-md px-2 py-1.5 bg-white text-ink-gray-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32 cursor-pointer"
					title="Font Family"
				>
					<option v-for="font in fonts" :key="font" :value="font" :style="{ fontFamily: font }">{{ font }}</option>
				</select>
			</div>
			<select
				:value="currentFontSize"
				@change="$emit('font-size-change', parseInt($event.target.value))"
				class="text-sm border border-blue-200 rounded-md px-2 py-1.5 bg-white text-ink-gray-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20 cursor-pointer"
				title="Font Size"
			>
				<option v-for="size in fontSizes" :key="size" :value="size">{{ size }}px</option>
			</select>
			<div class="flex items-center border-l border-blue-200 pl-2 space-x-0.5">
				<ToolButton
					:active="isBold"
					@click="$emit('toggle-bold')"
					title="Bold (Ctrl+B)"
				>
					<Bold class="w-4 h-4" />
				</ToolButton>
				<ToolButton
					:active="isItalic"
					@click="$emit('toggle-italic')"
					title="Italic (Ctrl+I)"
				>
					<Italic class="w-4 h-4" />
				</ToolButton>
			</div>
		</div>

		<!-- Layer Controls -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				@click="$emit('layer-action', 'bringToFront')"
				:disabled="!hasSelection"
				title="Bring to Front"
			>
				<ArrowUpToLine class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('layer-action', 'bringForward')"
				:disabled="!hasSelection"
				title="Bring Forward"
			>
				<ArrowUp class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('layer-action', 'sendBackward')"
				:disabled="!hasSelection"
				title="Send Backward"
			>
				<ArrowDown class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('layer-action', 'sendToBack')"
				:disabled="!hasSelection"
				title="Send to Back"
			>
				<ArrowDownToLine class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- Edit Actions -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				@click="$emit('action', 'copy')"
				:disabled="!hasSelection"
				title="Copy (Ctrl+C)"
			>
				<Copy class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('action', 'paste')"
				:disabled="!hasClipboard"
				title="Paste (Ctrl+V)"
			>
				<Clipboard class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('action', 'duplicate')"
				:disabled="!hasSelection"
				title="Duplicate (Ctrl+D)"
			>
				<CopyPlus class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('action', 'delete')"
				:disabled="!hasSelection"
				title="Delete (Del)"
			>
				<Trash2 class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- Undo/Redo -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				@click="$emit('undo')"
				:disabled="!canUndo"
				title="Undo (Ctrl+Z)"
			>
				<Undo2 class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				@click="$emit('redo')"
				:disabled="!canRedo"
				title="Redo (Ctrl+Y)"
			>
				<Redo2 class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- View Controls -->
		<div class="flex items-center border-r pr-2 mr-1">
			<ToolButton
				:active="showGrid"
				@click="$emit('toggle-grid')"
				title="Toggle Grid (G)"
			>
				<Grid3x3 class="w-4 h-4" />
			</ToolButton>
			<ToolButton
				:active="snapEnabled"
				@click="$emit('toggle-snap')"
				title="Toggle Snap"
			>
				<Magnet class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- Templates -->
		<div class="flex items-center">
			<ToolButton
				@click="$emit('show-templates')"
				:disabled="disabled"
				title="Slide Templates"
			>
				<LayoutTemplate class="w-4 h-4" />
			</ToolButton>
		</div>

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- Zoom Controls -->
		<div class="flex items-center space-x-1">
			<ToolButton @click="$emit('zoom', 'out')" title="Zoom Out">
				<ZoomOut class="w-4 h-4" />
			</ToolButton>
			<span class="text-xs text-ink-gray-6 w-12 text-center">{{ zoomLevel }}%</span>
			<ToolButton @click="$emit('zoom', 'in')" title="Zoom In">
				<ZoomIn class="w-4 h-4" />
			</ToolButton>
			<ToolButton @click="$emit('zoom', 'fit')" title="Fit to Screen">
				<Maximize2 class="w-4 h-4" />
			</ToolButton>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import {
	MousePointer2,
	Square,
	RectangleHorizontal,
	Circle,
	Triangle,
	Star,
	Minus,
	ArrowRight,
	Type,
	Heading,
	Image as ImageIcon,
	ArrowUpToLine,
	ArrowUp,
	ArrowDown,
	LayoutTemplate,
	ArrowDownToLine,
	Copy,
	Clipboard,
	CopyPlus,
	Trash2,
	Undo2,
	Redo2,
	Grid3x3,
	Magnet,
	ZoomIn,
	ZoomOut,
	Maximize2,
	Bold,
	Italic,
} from 'lucide-vue-next'

import ToolButton from './ToolButton.vue'

const props = defineProps({
	disabled: { type: Boolean, default: false },
	hasSelection: { type: Boolean, default: false },
	hasClipboard: { type: Boolean, default: false },
	canUndo: { type: Boolean, default: false },
	canRedo: { type: Boolean, default: false },
	showGrid: { type: Boolean, default: false },
	snapEnabled: { type: Boolean, default: true },
	zoomLevel: { type: Number, default: 100 },
	activeTool: { type: String, default: 'select' },
	isTextSelected: { type: Boolean, default: false },
	currentFont: { type: String, default: 'Arial' },
	currentFontSize: { type: Number, default: 24 },
	isBold: { type: Boolean, default: false },
	isItalic: { type: Boolean, default: false },
})

const emit = defineEmits([
	'add-element',
	'layer-action',
	'action',
	'undo',
	'redo',
	'toggle-grid',
	'toggle-snap',
	'zoom',
	'tool-change',
	'image-upload',
	'show-templates',
	'font-change',
	'font-size-change',
	'toggle-bold',
	'toggle-italic',
])

const imageInput = ref(null)

const fonts = [
	'Arial',
	'Helvetica',
	'Times New Roman',
	'Georgia',
	'Verdana',
	'Trebuchet MS',
	'Comic Sans MS',
	'Impact',
	'Courier New',
	'Lucida Console',
]

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96]

function setTool(tool) {
	emit('tool-change', tool)
}

function triggerImageUpload() {
	imageInput.value?.click()
}

function handleImageUpload(e) {
	const file = e.target.files?.[0]
	if (file) {
		emit('image-upload', file)
	}
	e.target.value = ''
}
</script>
