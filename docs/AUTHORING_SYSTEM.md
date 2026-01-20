# Course Authoring System Documentation

## Overview

The Course Authoring System provides a professional, isEazy-style visual editor for creating interactive courses within the Frappe LMS. It replaces the default Frappe course creation flow with a modern, canvas-based authoring experience.

## Architecture

### Frontend Components

| Component | Path | Description |
|-----------|------|-------------|
| `CourseAuthoring.vue` | `frontend/src/pages/` | Main authoring page with Konva canvas |
| `AuthoringOutline.vue` | `frontend/src/components/Authoring/` | Draggable course structure tree |
| `ElementInspector.vue` | `frontend/src/components/Authoring/` | Property editor for selected elements |
| `InteractionEditor.vue` | `frontend/src/components/Authoring/` | Add/edit element interactions |
| `PreviewPlayer.vue` | `frontend/src/components/Authoring/` | Runtime preview with interaction execution |
| `VersionHistory.vue` | `frontend/src/components/Authoring/` | Publish and version management |

### Backend APIs

All APIs are in `lms/lms/authoring_api.py`:

```python
# Course CRUD
create_course(data)           # Create new course
update_course(course, data)   # Update course metadata
delete_course(course)         # Delete course

# Chapter CRUD
create_chapter(course, data)  # Create chapter in course
update_chapter(chapter, data) # Update chapter
delete_chapter(chapter)       # Delete chapter
reorder_chapter(chapter, new_idx) # Reorder chapter

# Lesson CRUD
create_lesson(chapter, data)  # Create lesson in chapter
update_lesson(lesson, data)   # Update lesson
delete_lesson(lesson)         # Delete lesson
move_or_reorder_lesson(lesson, target_chapter, new_idx) # Move/reorder

# Slide CRUD
create_slide(lesson, data)    # Create slide in lesson
update_slide(slide, data)     # Update slide metadata
delete_slide(slide)           # Delete slide
reorder_slide(slide, new_idx) # Reorder slide
get_slide(slide)              # Get slide with konva_json
save_konva_json(slide, konva_json) # Save canvas state

# Interactions
upsert_interaction(data)      # Create/update interaction
delete_interaction(name)      # Delete interaction
list_slide_interactions(slide) # List interactions for slide

# Publishing
publish_course(course, notes) # Create new version snapshot
list_course_versions(course)  # List all versions
rollback_to_version(version)  # Restore to previous version
validate_course_for_publish(course) # Validate before publish

# Preview
get_course_outline(course)    # Get full course structure
get_lesson_preview_payload(lesson) # Get lesson for preview
get_course_preview_payload(course) # Get course for preview
```

### DocTypes

| DocType | Description |
|---------|-------------|
| `Course Slide` | Stores slide metadata and `konva_json` canvas state |
| `Course Interaction` | Event/action definitions for slide elements |
| `Course Version` | Published snapshots for versioning/rollback |

---

## Konva JSON Schema

The `konva_json` field stores the complete Konva.js stage serialization. Here's the schema:

### Stage Structure

```json
{
  "attrs": {
    "width": 1024,
    "height": 576
  },
  "className": "Stage",
  "children": [
    {
      "attrs": {},
      "className": "Layer",
      "children": [
        // ... shapes/elements
      ]
    }
  ]
}
```

### Supported Element Types

#### Rectangle
```json
{
  "attrs": {
    "id": "rect-1705123456789",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 150,
    "fill": "#3B82F6",
    "stroke": "#1E40AF",
    "strokeWidth": 2,
    "rotation": 0,
    "opacity": 1,
    "draggable": true
  },
  "className": "Rect"
}
```

#### Text
```json
{
  "attrs": {
    "id": "text-1705123456789",
    "x": 100,
    "y": 100,
    "text": "Hello World",
    "fontSize": 24,
    "fontFamily": "Arial",
    "fill": "#000000",
    "rotation": 0,
    "opacity": 1,
    "draggable": true
  },
  "className": "Text"
}
```

#### Circle
```json
{
  "attrs": {
    "id": "circle-1705123456789",
    "x": 200,
    "y": 200,
    "radius": 50,
    "fill": "#10B981",
    "stroke": "#059669",
    "strokeWidth": 2,
    "rotation": 0,
    "opacity": 1,
    "draggable": true
  },
  "className": "Circle"
}
```

#### Image
```json
{
  "attrs": {
    "id": "image-1705123456789",
    "x": 100,
    "y": 100,
    "width": 300,
    "height": 200,
    "image": "data:image/png;base64,...",
    "rotation": 0,
    "opacity": 1,
    "draggable": true
  },
  "className": "Image"
}
```

### Complete Example

```json
{
  "attrs": {
    "width": 1024,
    "height": 576
  },
  "className": "Stage",
  "children": [
    {
      "attrs": {},
      "className": "Layer",
      "children": [
        {
          "attrs": {
            "id": "title-text",
            "x": 50,
            "y": 50,
            "text": "Welcome to the Course",
            "fontSize": 36,
            "fontFamily": "Arial",
            "fill": "#1F2937",
            "draggable": true
          },
          "className": "Text"
        },
        {
          "attrs": {
            "id": "next-button",
            "x": 800,
            "y": 480,
            "width": 150,
            "height": 50,
            "fill": "#3B82F6",
            "cornerRadius": 8,
            "draggable": true
          },
          "className": "Rect"
        },
        {
          "attrs": {
            "id": "next-button-text",
            "x": 840,
            "y": 495,
            "text": "Next →",
            "fontSize": 18,
            "fill": "#FFFFFF",
            "draggable": true
          },
          "className": "Text"
        }
      ]
    }
  ]
}
```

---

## Interactions Schema

Interactions are stored in `Course Interaction` DocType with `actions_json`:

### Event Types

| Event | Description |
|-------|-------------|
| `OnClick` | Triggered when element is clicked |
| `OnEnterSlide` | Triggered when slide loads |
| `OnTimer` | Triggered after delay (seconds) |

### Action Types

| Action | Parameters | Description |
|--------|------------|-------------|
| `GoToNextSlide` | - | Navigate to next slide |
| `GoToPrevSlide` | - | Navigate to previous slide |
| `GoToSlide` | `targetSlide` | Navigate to specific slide |
| `ShowElement` | `targetElementId` | Show hidden element |
| `HideElement` | `targetElementId` | Hide element |
| `ToggleElement` | `targetElementId` | Toggle visibility |
| `NavigateLesson` | `targetLesson` | Jump to lesson |
| `OpenURL` | `targetUrl` | Open URL in new tab |

### Example Interaction

```json
{
  "name": "INTERACTION-00001",
  "slide": "SLIDE-00001",
  "element_id": "next-button",
  "event": "OnClick",
  "actions_json": "{\"type\":\"GoToNextSlide\"}"
}
```

### Timer Example

```json
{
  "name": "INTERACTION-00002",
  "slide": "SLIDE-00001",
  "element_id": "auto-advance",
  "event": "OnTimer",
  "actions_json": "{\"type\":\"GoToNextSlide\",\"delay\":5}"
}
```

---

## Save/Load Workflow

### Saving Canvas State

1. User makes changes on Konva canvas
2. Debounced autosave triggers after 1 second of inactivity
3. Frontend serializes stage: `stage.toJSON()`
4. API call: `save_konva_json(slide, konva_json)`
5. Backend stores in `Course Slide.konva_json` field

```javascript
// Frontend save logic
async function saveSlide() {
  if (!stage || !selectedSlide.value) return
  const json = stage.toJSON()
  await call('lms.lms.authoring_api.save_konva_json', {
    slide: selectedSlide.value,
    konva_json: json,
  })
}
```

### Loading Canvas State

1. User selects slide in outline
2. API call: `get_slide(slide)`
3. Backend returns slide with `konva_json`
4. Frontend recreates stage: `Konva.Node.create(json, container)`

```javascript
// Frontend load logic
async function loadSlide(slideName) {
  const data = await call('lms.lms.authoring_api.get_slide', {
    slide: slideName
  })
  
  if (data.konva_json) {
    stage = Konva.Node.create(data.konva_json, container)
  } else {
    // Create empty stage
    stage = new Konva.Stage({ container, width: 1024, height: 576 })
    stage.add(new Konva.Layer())
  }
}
```

---

## Publishing Workflow

1. User clicks **Publish** button
2. Version History modal opens
3. User optionally adds version notes
4. API call: `publish_course(course, notes)`
5. Backend:
   - Validates course structure
   - Creates `Course Version` with snapshot
   - Increments version number
6. Course is now published and visible to learners

### Rollback

1. User opens Version History
2. Clicks **Restore** on previous version
3. API call: `rollback_to_version(version)`
4. Backend restores course structure from snapshot
5. Frontend reloads outline and current slide

---

## Canvas Dimensions

- **Base Size**: 1024 × 576 pixels (16:9 aspect ratio)
- **Display**: Scaled to fit viewport while maintaining aspect ratio
- **Coordinates**: All element positions stored in base coordinates

---

## User Flow

```
Courses List → [Create] → Course Authoring
                              ↓
                    ┌─────────────────────┐
                    │  Add Chapters       │
                    │  Add Lessons        │
                    │  Add Slides         │
                    │  Design on Canvas   │
                    │  Add Interactions   │
                    └─────────────────────┘
                              ↓
                    [Preview] → Preview Player
                              ↓
                    [Publish] → Version History → Published
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected element |
| `Arrow Keys` | Move selected element (in preview) |
| `Escape` | Close preview |
| `Space` / `→` | Next slide (in preview) |
| `←` | Previous slide (in preview) |
