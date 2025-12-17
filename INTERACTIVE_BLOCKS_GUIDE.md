# Interactive Content Blocks - Phase 1 Implementation Guide

## Overview

This guide documents the new interactive content blocks added to Frappe LMS as part of the RISE 360-inspired enhancement project. These blocks transform basic lesson creation into an engaging, interactive learning experience.

## Implemented Blocks

### 1. Accordion Block

**Purpose**: Organize content in collapsible sections for better scanability and progressive disclosure.

**Features**:
- Multiple expandable/collapsible sections
- "Expand all by default" option
- Smooth animations
- Mobile-responsive design

**Use Cases**:
- FAQs
- Step-by-step instructions
- Content organization with multiple topics
- Reference materials

**How to Use**:
1. In the lesson editor, click the "+" button
2. Select "Accordion" from the block menu
3. Add sections with titles and content
4. Toggle "Expand all by default" if needed
5. Click "+" Add Section to add more items

**Data Structure**:
```json
{
  "type": "accordion",
  "data": {
    "items": [
      {
        "title": "Section Title",
        "content": "Section content...",
        "isOpen": false
      }
    ],
    "expandAll": false
  }
}
```

---

### 2. Tabs Block

**Purpose**: Display related content in a tabbed interface for efficient space usage.

**Features**:
- Horizontal and vertical layouts
- Smooth tab transitions
- Mobile-responsive (vertical tabs become horizontal on mobile)
- Unlimited tabs

**Use Cases**:
- Compare/contrast information
- Multiple perspectives on a topic
- Language variations
- Different difficulty levels

**How to Use**:
1. Add "Tabs" block from the block menu
2. Choose layout (horizontal/vertical)
3. Add content to each tab
4. Click "+ Add Tab" for additional tabs
5. Reorder tabs by editing

**Data Structure**:
```json
{
  "type": "tabs",
  "data": {
    "tabs": [
      {
        "title": "Tab 1",
        "content": "Tab content..."
      }
    ],
    "layout": "horizontal"
  }
}
```

---

### 3. Flip Cards Block

**Purpose**: Interactive reveal content with front/back cards for active learning.

**Features**:
- Click or hover to flip
- Grid layout (2, 3, or 4 columns)
- Gradient backgrounds
- Smooth 3D flip animation

**Use Cases**:
- Flashcards
- Vocabulary learning
- Concept definitions
- Before/after scenarios
- Question/answer pairs

**How to Use**:
1. Add "Flip Cards" block
2. Set number of columns (2-4)
3. Choose flip trigger (click or hover)
4. Add front and back content for each card
5. Click "+ Add Card" for more cards

**Data Structure**:
```json
{
  "type": "flipcards",
  "data": {
    "cards": [
      {
        "front": "Front content",
        "back": "Back content"
      }
    ],
    "columns": 2,
    "flipTrigger": "click"
  }
}
```

---

### 4. Timeline Block

**Purpose**: Display chronological information visually with dates and milestones.

**Features**:
- Vertical and horizontal layouts
- Date badges
- Connected timeline with markers
- Expandable descriptions

**Use Cases**:
- Historical events
- Project milestones
- Process evolution
- Company history
- Product development stages

**How to Use**:
1. Add "Timeline" block
2. Choose layout (vertical/horizontal)
3. Add events with dates, titles, and descriptions
4. Click "+ Add Event" for more milestones

**Data Structure**:
```json
{
  "type": "timeline",
  "data": {
    "items": [
      {
        "date": "2024",
        "title": "Event Title",
        "description": "Event description..."
      }
    ],
    "layout": "vertical"
  }
}
```

---

### 5. Process Block

**Purpose**: Step-by-step process visualization with numbered steps.

**Features**:
- Horizontal and vertical layouts
- Numbered steps (optional)
- Arrow connectors between steps
- Hover effects
- Mobile-responsive

**Use Cases**:
- Workflows
- Procedures
- How-to guides
- Sequential instructions
- Decision-making processes

**How to Use**:
1. Add "Process" block
2. Choose layout and toggle step numbers
3. Add steps with titles and descriptions
4. Click "+ Add Step" for additional steps

**Data Structure**:
```json
{
  "type": "process",
  "data": {
    "steps": [
      {
        "title": "Step Title",
        "description": "Step description..."
      }
    ],
    "layout": "horizontal",
    "showNumbers": true
  }
}
```

---

### 6. Labeled Graphic Block

**Purpose**: Interactive image with clickable hotspots for detailed explanations.

**Features**:
- Upload custom images
- Add unlimited markers
- Click markers to show tooltips
- Numbered markers
- Responsive positioning

**Use Cases**:
- Anatomy diagrams
- Product features
- Architecture plans
- Equipment labeling
- Map annotations
- Interface tours

**How to Use**:
1. Add "Labeled Graphic" block
2. Upload an image
3. Click on the image to add markers
4. Edit marker labels and descriptions
5. Click markers in view mode to see tooltips

**Data Structure**:
```json
{
  "type": "labeledgraphic",
  "data": {
    "imageUrl": "data:image/...",
    "markers": [
      {
        "x": 50,
        "y": 30,
        "label": "Marker Label",
        "description": "Marker description..."
      }
    ]
  }
}
```

---

## Technical Implementation

### File Structure

```
frontend/src/
├── components/
│   └── Blocks/
│       ├── AccordionBlock.vue
│       ├── TabsBlock.vue
│       ├── FlipCardsBlock.vue
│       ├── TimelineBlock.vue
│       ├── ProcessBlock.vue
│       ├── LabeledGraphicBlock.vue
│       └── BlockRenderer.vue
├── utils/
│   └── blocks/
│       ├── accordion.js
│       ├── tabs.js
│       ├── flipcards.js
│       ├── timeline.js
│       ├── process.js
│       └── labeledgraphic.js
└── assets/
    └── interactive-blocks.css
```

### EditorJS Integration

All blocks are integrated into the EditorJS configuration in `utils/index.js`:

```javascript
import { Accordion } from '@/utils/blocks/accordion'
import { Tabs } from '@/utils/blocks/tabs'
import { FlipCards } from '@/utils/blocks/flipcards'
import { Timeline } from '@/utils/blocks/timeline'
import { Process } from '@/utils/blocks/process'
import { LabeledGraphic } from '@/utils/blocks/labeledgraphic'

export function getEditorTools() {
  return {
    // ... existing tools
    accordion: Accordion,
    tabs: Tabs,
    flipcards: FlipCards,
    timeline: Timeline,
    process: Process,
    labeledgraphic: LabeledGraphic,
    // ... other tools
  }
}
```

### Block Rendering

Blocks are rendered in lesson view using the `BlockRenderer` component:

```vue
<BlockRenderer :block="block" />
```

The renderer automatically selects the appropriate component based on block type.

---

## Styling

All interactive blocks use consistent styling:

- **Colors**: Blue primary (#2563eb), gray neutrals
- **Borders**: 1px solid with rounded corners (8px)
- **Shadows**: Subtle box-shadows for depth
- **Transitions**: Smooth 0.2-0.3s animations
- **Responsive**: Mobile-first design with breakpoints

Custom styles are in `assets/interactive-blocks.css`.

---

## Content Formatting

All blocks support basic markdown-style formatting in content fields:

- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- Line breaks are preserved

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

---

## Performance Considerations

- **Lazy Loading**: Components load only when needed
- **CSS Optimization**: Scoped styles prevent conflicts
- **Image Handling**: Labeled graphics use base64 for small images
- **Animation Performance**: CSS transforms for smooth animations

---

## Best Practices

### Accordion Block
- Keep section titles concise (3-7 words)
- Use for 3-10 sections (more becomes overwhelming)
- Consider "expand all" for reference materials

### Tabs Block
- Limit to 3-6 tabs for best UX
- Use consistent content length across tabs
- Choose vertical layout for long tab names

### Flip Cards Block
- Keep front/back content balanced
- Use 2-3 columns on desktop
- Ideal for 4-12 cards per block

### Timeline Block
- Use consistent date formats
- Keep descriptions brief (2-3 sentences)
- Vertical layout works best for detailed timelines

### Process Block
- Limit to 3-7 steps for clarity
- Use action-oriented step titles
- Include brief descriptions for each step

### Labeled Graphic Block
- Use high-quality, clear images
- Limit to 5-10 markers per image
- Place markers on distinct features
- Keep descriptions concise

---

## Future Enhancements (Upcoming Phases)

### Phase 2: Knowledge Check Blocks
- Sortable List (drag-and-drop ordering)
- Flashcards (swipeable cards)
- Matching Pairs (connect items)
- Scenario/Branching (decision-based paths)

### Phase 3: Visual Enhancement Blocks
- Enhanced Quote styles
- Statement blocks (info, warning, success)
- Divider blocks
- Button blocks
- Image galleries

### Phase 4: Lesson Templates
- Pre-built lesson structures
- Template categories
- One-click application

### Phase 5: Enhanced Quiz System
- Question banks
- Randomization
- Enhanced feedback
- Quiz settings (passing score, retries, timing)

---

## Troubleshooting

### Block Not Appearing in Editor
- Clear browser cache
- Check console for JavaScript errors
- Verify EditorJS tools configuration

### Styles Not Applied
- Ensure `interactive-blocks.css` is imported in `main.js`
- Check for CSS conflicts with existing styles
- Verify scoped styles in Vue components

### Images Not Loading (Labeled Graphic)
- Check image file size (keep under 2MB)
- Verify image format (jpg, png, gif supported)
- Check browser console for errors

### Mobile Display Issues
- Test on actual devices, not just browser resize
- Check responsive breakpoints in CSS
- Verify touch events work correctly

---

## Support

For issues or questions:
1. Check this documentation
2. Review the component source code
3. Check browser console for errors
4. Contact the development team

---

## Version History

- **v1.0.0** (December 2024) - Initial Phase 1 implementation
  - Accordion Block
  - Tabs Block
  - Flip Cards Block
  - Timeline Block
  - Process Block
  - Labeled Graphic Block

---

## License

Part of Frappe LMS - Licensed under same terms as main project.
