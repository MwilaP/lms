# Tiptap Migration Guide

## Overview

This guide documents the migration from EditorJS to Tiptap for the Frappe LMS lesson editor. Tiptap provides a more modern, flexible, and themeable editing experience that aligns better with the RISE 360 aesthetic.

## Why Tiptap?

### Advantages over EditorJS:
- **Better Theming**: More control over editor appearance and styling
- **Modern Architecture**: Built on ProseMirror with excellent Vue 3 integration
- **Flexible Extensions**: Easier to create custom interactive blocks
- **Better UX**: More intuitive editing experience similar to RISE 360
- **Active Development**: Regular updates and strong community support
- **Collaborative Editing**: Built-in support for real-time collaboration
- **Better Performance**: Optimized rendering and state management

## Architecture

### Core Components

1. **Tiptap Configuration** (`frontend/src/utils/tiptap/index.js`)
   - Central configuration for all Tiptap extensions
   - Conversion utilities between EditorJS and Tiptap formats
   - Editor initialization helpers

2. **Custom Extensions** (`frontend/src/utils/tiptap/extensions/`)
   - Each interactive block is a Tiptap extension
   - Extensions define block behavior, attributes, and rendering
   - Uses Vue NodeView components for interactive editing

3. **NodeView Components** (`frontend/src/utils/tiptap/extensions/components/`)
   - Vue components that render inside the Tiptap editor
   - Handle both edit and read-only modes
   - Provide interactive editing interfaces

4. **Main Editor Component** (`frontend/src/components/TiptapEditor.vue`)
   - Reusable Tiptap editor wrapper
   - Includes toolbar with formatting options
   - Block insertion menu

## Installation

### Required Packages

```json
{
  "@tiptap/core": "^2.1.13",
  "@tiptap/vue-3": "^2.1.13",
  "@tiptap/starter-kit": "^2.1.13",
  "@tiptap/extension-image": "^2.1.13",
  "@tiptap/extension-link": "^2.1.13",
  "@tiptap/extension-table": "^2.1.13",
  "@tiptap/extension-table-row": "^2.1.13",
  "@tiptap/extension-table-cell": "^2.1.13",
  "@tiptap/extension-table-header": "^2.1.13",
  "@tiptap/extension-task-list": "^2.1.13",
  "@tiptap/extension-task-item": "^2.1.13",
  "@tiptap/extension-highlight": "^2.1.13",
  "@tiptap/extension-text-align": "^2.1.13",
  "@tiptap/extension-underline": "^2.1.13",
  "@tiptap/extension-text-style": "^2.1.13",
  "@tiptap/extension-color": "^2.1.13",
  "@tiptap/extension-youtube": "^2.1.13",
  "@tiptap/extension-placeholder": "^2.1.13",
  "@tiptap/pm": "^2.1.13"
}
```

### Installation Command

```bash
cd frontend
npm install
# or
yarn install
```

## Custom Extensions

### Interactive Content Blocks (Phase 1)

1. **Accordion** - Collapsible sections
2. **Tabs** - Tabbed content with horizontal/vertical layouts
3. **Flip Cards** - Cards that flip on click/hover
4. **Timeline** - Event timeline with dates
5. **Process** - Step-by-step process visualization
6. **Labeled Graphic** - Interactive image with markers

### Knowledge Check Blocks (Phase 2)

7. **Sortable List** - Drag-and-drop ordering quiz
8. **Flashcards** - Study cards with flip animation
9. **Matching Pairs** - Connect matching items
10. **Scenario** - Branching decision-based learning

### LMS Blocks

11. **Quiz** - Quiz integration
12. **Assignment** - Assignment integration
13. **Program** - Program integration
14. **Upload** - File upload block

## Extension Structure

Each extension follows this pattern:

```javascript
// Extension definition
import { createBlockExtension } from './base-block'
import ComponentNodeView from './components/ComponentNodeView.vue'

export const ExtensionName = createBlockExtension({
  name: 'blockname',
  component: ComponentNodeView,
  defaultAttrs: {
    // Default attributes
  },
})
```

## NodeView Component Structure

```vue
<template>
  <node-view-wrapper class="block-node-view">
    <!-- Edit mode -->
    <div v-if="editor.isEditable" class="editor-view">
      <!-- Editing interface -->
    </div>
    
    <!-- Read-only mode -->
    <div v-else class="readonly-view">
      <!-- Display interface -->
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
  editor: Object,
  node: Object,
  updateAttributes: Function,
  deleteNode: Function,
})
</script>
```

## Data Format

### Tiptap JSON Structure

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Heading" }]
    },
    {
      "type": "accordion",
      "attrs": {
        "items": [
          { "title": "Section 1", "content": "Content 1" }
        ],
        "expandAll": false
      }
    }
  ]
}
```

## Migration from EditorJS

### Conversion Functions

Two utility functions handle conversion:

1. **`convertEditorJsToTiptap(editorJsData)`**
   - Converts EditorJS JSON to Tiptap JSON
   - Preserves all block data
   - Maps block types appropriately

2. **`convertTiptapToEditorJs(tiptapData)`**
   - Converts Tiptap JSON back to EditorJS format
   - For backward compatibility
   - Maintains data integrity

### Migration Strategy

1. **Dual Format Support**
   - Keep EditorJS data in database initially
   - Convert to Tiptap on load
   - Save as Tiptap JSON going forward

2. **Gradual Migration**
   - New lessons use Tiptap by default
   - Existing lessons converted on first edit
   - Maintain EditorJS backup

3. **Data Validation**
   - Validate converted data
   - Test all block types
   - Ensure no data loss

## Usage in LessonForm

### Basic Implementation

```vue
<template>
  <TiptapEditor
    v-model="lessonContent"
    :editable="true"
    placeholder="Start writing your lesson..."
  />
</template>

<script setup>
import { ref } from 'vue'
import TiptapEditor from '@/components/TiptapEditor.vue'

const lessonContent = ref({})
</script>
```

### Saving Content

```javascript
const saveLesson = async () => {
  const content = editor.value.getJSON()
  
  // Save to backend
  await frappe.call({
    method: 'lms.api.save_lesson',
    args: {
      lesson_id: lessonId,
      content: JSON.stringify(content),
    },
  })
}
```

### Loading Content

```javascript
const loadLesson = async () => {
  const response = await frappe.call({
    method: 'lms.api.get_lesson',
    args: { lesson_id: lessonId },
  })
  
  const content = JSON.parse(response.message.content)
  
  // If EditorJS format, convert
  if (content.blocks) {
    editor.value.commands.setContent(
      convertEditorJsToTiptap(content)
    )
  } else {
    editor.value.commands.setContent(content)
  }
}
```

## Styling

### Editor Styles

Tiptap uses Tailwind's prose classes for typography:

```css
.tiptap-editor {
  @apply prose prose-sm sm:prose lg:prose-lg xl:prose-xl;
  @apply focus:outline-none;
}
```

### Custom Block Styles

Each block has its own scoped styles in the NodeView component:

```css
.accordion-node-view {
  margin: 1.5rem 0;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}
```

## Toolbar Customization

The toolbar is fully customizable in `TiptapEditor.vue`:

```javascript
// Add custom button
<button
  @click="editor.chain().focus().insertAccordion({}).run()"
  class="menu-button"
>
  📋 Accordion
</button>
```

## Best Practices

### 1. Extension Development
- Keep extensions focused and single-purpose
- Use the base extension helper for consistency
- Implement both edit and read-only modes

### 2. State Management
- Use `updateAttributes()` to modify block data
- Avoid direct state mutation
- Let Tiptap handle undo/redo

### 3. Performance
- Use `atom: true` for complex blocks
- Minimize re-renders with proper Vue reactivity
- Lazy-load heavy components

### 4. Accessibility
- Add proper ARIA labels
- Ensure keyboard navigation
- Provide screen reader support

## Testing

### Unit Tests
```javascript
import { createEditor } from '@tiptap/core'
import { AccordionExtension } from './extensions/accordion'

test('accordion extension', () => {
  const editor = createEditor({
    extensions: [AccordionExtension],
  })
  
  editor.commands.insertAccordion({
    items: [{ title: 'Test', content: 'Content' }],
  })
  
  expect(editor.getJSON().content[0].type).toBe('accordion')
})
```

### Integration Tests
- Test all block types in editor
- Verify data persistence
- Check conversion accuracy

## Troubleshooting

### Common Issues

1. **Extension not loading**
   - Check import path
   - Verify extension is added to config
   - Check for console errors

2. **NodeView not rendering**
   - Ensure component is properly imported
   - Check VueNodeViewRenderer setup
   - Verify props are passed correctly

3. **Data not saving**
   - Check JSON serialization
   - Verify backend API
   - Test conversion functions

## Next Steps

1. ✅ Install Tiptap packages
2. ✅ Create base extension structure
3. ✅ Implement all interactive blocks as extensions
4. ✅ Create TiptapEditor component
5. ⏳ Create remaining NodeView components
6. ⏳ Update LessonForm.vue to use Tiptap
7. ⏳ Update Lesson.vue viewer
8. ⏳ Test all blocks
9. ⏳ Deploy and monitor

## Resources

- [Tiptap Documentation](https://tiptap.dev/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Vue 3 Integration](https://tiptap.dev/installation/vue3)
- [Custom Extensions](https://tiptap.dev/guide/custom-extensions)

## Support

For issues or questions:
1. Check Tiptap documentation
2. Review this migration guide
3. Test with minimal reproduction
4. Check browser console for errors
