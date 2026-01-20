import json

import frappe
from frappe import _
from frappe.utils import now_datetime, today

from lms.lms.utils import get_chapters


def _require_course_author():
	frappe.only_for(["Course Creator", "Moderator", "System Manager"])


def _parse_json(value):
	if value is None:
		return None
	if isinstance(value, (dict, list)):
		return value
	return frappe.parse_json(value)


def _get_next_reference_idx(doctype, parent):
	current_max = frappe.db.sql(
		f"select max(idx) from `tab{doctype}` where parent=%s",
		(parent,),
	)
	current_max = (current_max and current_max[0] and current_max[0][0]) or 0
	return int(current_max) + 1


def _get_course_for_lesson(lesson):
	return frappe.db.get_value("Course Lesson", lesson, "course")


def _get_course_for_chapter(chapter):
	return frappe.db.get_value("Course Chapter", chapter, "course")


def _get_lesson_slides(lesson):
	return frappe.get_all("Course Slide", {"lesson": lesson}, pluck="name")


def _delete_slides_and_interactions_for_lessons(lessons):
	if not lessons:
		return

	slides = frappe.get_all("Course Slide", filters={"lesson": ["in", lessons]}, pluck="name")
	if slides:
		frappe.db.delete("Course Interaction", {"slide": ["in", slides]})
		frappe.db.delete("Course Slide", {"name": ["in", slides]})


@frappe.whitelist()
def create_course(data):
	_require_course_author()
	data = _parse_json(data) or {}

	allowed = {
		"title",
		"short_introduction",
		"description",
		"image",
		"language",
		"format_type",
		"default_slide_settings",
	}

	doc = frappe.new_doc("LMS Course")
	for k, v in data.items():
		if k in allowed:
			setattr(doc, k, v)

	if not getattr(doc, "published", None):
		doc.published = 0

	if not doc.instructors:
		doc.append("instructors", {"instructor": frappe.session.user})

	doc.insert()
	return doc.as_dict()


@frappe.whitelist()
def update_course(course, data):
	_require_course_author()
	data = _parse_json(data) or {}
	doc = frappe.get_doc("LMS Course", course)

	allowed = {
		"title",
		"short_introduction",
		"description",
		"image",
		"language",
		"format_type",
		"default_slide_settings",
	}
	for k, v in data.items():
		if k in allowed:
			setattr(doc, k, v)

	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def delete_course(course):
	_require_course_author()

	lessons = frappe.get_all("Course Lesson", {"course": course}, pluck="name")
	_delete_slides_and_interactions_for_lessons(lessons)
	frappe.db.delete("Course Version", {"course": course})
	from lms.lms.api import delete_course as _delete_course

	_delete_course(course)
	return {"ok": True}


@frappe.whitelist()
def create_chapter(course, title, description=None, thumbnail=None, idx=None):
	_require_course_author()
	idx = int(idx) if idx is not None else _get_next_reference_idx("Chapter Reference", course)

	chapter = frappe.new_doc("Course Chapter")
	chapter.course = course
	chapter.title = title
	chapter.description = description
	chapter.thumbnail = thumbnail
	chapter.insert()

	ref = frappe.new_doc("Chapter Reference")
	ref.parent = course
	ref.parenttype = "LMS Course"
	ref.parentfield = "chapters"
	ref.idx = idx
	ref.chapter = chapter.name
	ref.insert()

	return {"chapter": chapter.as_dict(), "idx": idx}


@frappe.whitelist()
def update_chapter(chapter, data):
	_require_course_author()
	data = _parse_json(data) or {}
	doc = frappe.get_doc("Course Chapter", chapter)

	allowed = {"title", "description", "thumbnail"}
	for k, v in data.items():
		if k in allowed:
			setattr(doc, k, v)

	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def reorder_chapter(chapter, course, idx):
	_require_course_author()
	from lms.lms.api import update_chapter_index

	update_chapter_index(chapter, course, int(idx))
	return {"ok": True}


@frappe.whitelist()
def delete_chapter(chapter):
	_require_course_author()

	lessons = frappe.get_all("Course Lesson", {"chapter": chapter}, pluck="name")
	_delete_slides_and_interactions_for_lessons(lessons)

	from lms.lms.api import delete_chapter as _delete_chapter

	_delete_chapter(chapter)
	return {"ok": True}


@frappe.whitelist()
def create_lesson(chapter, title, description=None, idx=None):
	_require_course_author()

	course = _get_course_for_chapter(chapter)
	if not course:
		frappe.throw(_("Invalid chapter"))

	idx = int(idx) if idx is not None else _get_next_reference_idx("Lesson Reference", chapter)

	lesson = frappe.new_doc("Course Lesson")
	lesson.title = title
	lesson.description = description
	lesson.chapter = chapter
	lesson.course = course
	lesson.insert()

	ref = frappe.new_doc("Lesson Reference")
	ref.parent = chapter
	ref.parenttype = "Course Chapter"
	ref.parentfield = "lessons"
	ref.idx = idx
	ref.lesson = lesson.name
	ref.insert()

	return {"lesson": lesson.as_dict(), "idx": idx}


@frappe.whitelist()
def update_lesson(lesson, data):
	_require_course_author()
	data = _parse_json(data) or {}
	doc = frappe.get_doc("Course Lesson", lesson)

	allowed = {"title", "description", "include_in_preview"}
	for k, v in data.items():
		if k in allowed:
			setattr(doc, k, v)

	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def move_or_reorder_lesson(lesson, source_chapter, target_chapter, idx):
	_require_course_author()
	from lms.lms.api import update_lesson_index

	update_lesson_index(lesson, source_chapter, target_chapter, int(idx))
	return {"ok": True}


@frappe.whitelist()
def delete_lesson(lesson, chapter):
	_require_course_author()

	slides = _get_lesson_slides(lesson)
	if slides:
		frappe.db.delete("Course Interaction", {"slide": ["in", slides]})
		frappe.db.delete("Course Slide", {"name": ["in", slides]})

	from lms.lms.api import delete_lesson as _delete_lesson

	_delete_lesson(lesson, chapter)
	return {"ok": True}


@frappe.whitelist()
def get_slide(slide):
	_require_course_author()
	return frappe.db.get_value(
		"Course Slide",
		slide,
		["name", "title", "idx", "lesson", "course", "thumbnail", "konva_json"],
		as_dict=True,
	)


@frappe.whitelist()
def list_slide_interactions(slide):
	_require_course_author()
	return frappe.get_all(
		"Course Interaction",
		filters={"slide": slide},
		fields=[
			"name",
			"title",
			"slide",
			"target_type",
			"element_id",
			"event",
			"actions_json",
		],
		order_by="modified",
	)


@frappe.whitelist()
def get_lesson_preview_payload(lesson):
	_require_course_author()

	lesson_doc = frappe.get_doc("Course Lesson", lesson)
	slides = frappe.get_all(
		"Course Slide",
		filters={"lesson": lesson_doc.name},
		fields=["name", "title", "idx", "thumbnail", "konva_json"],
		order_by="idx, creation",
	)

	slide_names = [s.name for s in slides]
	interactions = []
	if slide_names:
		interactions = frappe.get_all(
			"Course Interaction",
			filters={"slide": ["in", slide_names]},
			fields=[
				"name",
				"title",
				"slide",
				"target_type",
				"element_id",
				"event",
				"actions_json",
			],
			order_by="modified",
		)

	return {
		"lesson": {
			"name": lesson_doc.name,
			"title": lesson_doc.title,
			"description": getattr(lesson_doc, "description", None),
			"course": lesson_doc.course,
			"chapter": lesson_doc.chapter,
		},
		"slides": slides,
		"interactions": interactions,
	}


@frappe.whitelist()
def get_course_preview_payload(course):
	_require_course_author()

	course_doc = frappe.get_doc("LMS Course", course)
	chapters = get_chapters(course_doc.name)
	chapter_names = [c.chapter for c in chapters]
	lessons = []
	if chapter_names:
		lessons = frappe.get_all(
			"Course Lesson",
			filters={"chapter": ["in", chapter_names]},
			fields=["name", "title", "description", "course", "chapter"],
		)

	lesson_names = [l.name for l in lessons]
	slides = []
	if lesson_names:
		slides = frappe.get_all(
			"Course Slide",
			filters={"lesson": ["in", lesson_names]},
			fields=["name", "title", "idx", "lesson", "thumbnail", "konva_json"],
			order_by="lesson, idx, creation",
		)

	slide_names = [s.name for s in slides]
	interactions = []
	if slide_names:
		interactions = frappe.get_all(
			"Course Interaction",
			filters={"slide": ["in", slide_names]},
			fields=[
				"name",
				"title",
				"slide",
				"target_type",
				"element_id",
				"event",
				"actions_json",
			],
			order_by="modified",
		)

	return {
		"course": {
			"name": course_doc.name,
			"title": course_doc.title,
			"description": course_doc.description,
			"image": course_doc.image,
			"language": getattr(course_doc, "language", None),
			"format_type": getattr(course_doc, "format_type", None),
			"default_slide_settings": getattr(course_doc, "default_slide_settings", None),
		},
		"outline": get_course_outline(course_doc.name),
		"lessons": lessons,
		"slides": slides,
		"interactions": interactions,
	}


@frappe.whitelist()
def get_course_outline(course):
	_require_course_author()

	course_doc = frappe.get_doc("LMS Course", course)
	outline = {
		"course": {
			"name": course_doc.name,
			"title": course_doc.title,
			"description": course_doc.description,
			"image": course_doc.image,
			"language": getattr(course_doc, "language", None),
			"format_type": getattr(course_doc, "format_type", None),
			"published": course_doc.published,
			"published_on": course_doc.published_on,
			"current_version": getattr(course_doc, "current_version", 0),
			"default_slide_settings": getattr(course_doc, "default_slide_settings", None),
		},
		"chapters": [],
	}

	for chapter_ref in get_chapters(course_doc.name):
		chapter = frappe.db.get_value(
			"Course Chapter",
			chapter_ref.chapter,
			["name", "title", "description", "thumbnail", "is_scorm_package"],
			as_dict=True,
		)
		if not chapter:
			continue

		chapter_out = {
			"idx": chapter_ref.idx,
			"name": chapter.name,
			"title": chapter.title,
			"description": chapter.get("description"),
			"thumbnail": chapter.get("thumbnail"),
			"is_scorm_package": chapter.get("is_scorm_package"),
			"lessons": [],
		}

		lesson_refs = frappe.get_all(
			"Lesson Reference",
			filters={"parent": chapter.name},
			fields=["idx", "lesson"],
			order_by="idx",
		)
		for lr in lesson_refs:
			lesson = frappe.db.get_value(
				"Course Lesson",
				lr.lesson,
				["name", "title", "description", "include_in_preview"],
				as_dict=True,
			)
			if not lesson:
				continue

			slides = frappe.get_all(
				"Course Slide",
				filters={"lesson": lesson.name},
				fields=["name", "title", "idx", "thumbnail"],
				order_by="idx, creation",
			)
			chapter_out["lessons"].append(
				{
					"idx": lr.idx,
					"name": lesson.name,
					"title": lesson.title,
					"description": lesson.get("description"),
					"include_in_preview": lesson.include_in_preview,
					"slides": slides,
				}
			)

		outline["chapters"].append(chapter_out)

	return outline


def _get_next_slide_idx(lesson):
	current_max = frappe.db.sql(
		"select max(idx) from `tabCourse Slide` where lesson=%s",
		(lesson,),
	)
	current_max = (current_max and current_max[0] and current_max[0][0]) or 0
	return int(current_max) + 1


@frappe.whitelist()
def create_slide(lesson, title=None, idx=None):
	_require_course_author()
	idx = int(idx) if idx is not None else _get_next_slide_idx(lesson)
	if not title:
		title = _(f"Slide {idx}")

	doc = frappe.new_doc("Course Slide")
	doc.lesson = lesson
	doc.course = _get_course_for_lesson(lesson)
	doc.title = title
	doc.idx = idx
	doc.insert()
	return doc.as_dict()


@frappe.whitelist()
def update_slide(slide, data):
	_require_course_author()
	data = _parse_json(data) or {}
	doc = frappe.get_doc("Course Slide", slide)

	allowed = {"title", "idx", "lesson", "thumbnail"}
	for k, v in data.items():
		if k in allowed:
			setattr(doc, k, v)

	if doc.lesson:
		doc.course = _get_course_for_lesson(doc.lesson)

	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def delete_slide(slide):
	_require_course_author()
	frappe.db.delete("Course Interaction", {"slide": slide})
	frappe.delete_doc("Course Slide", slide)
	return {"ok": True}


@frappe.whitelist()
def save_konva_json(slide, konva_json):
	_require_course_author()
	frappe.db.set_value("Course Slide", slide, "konva_json", konva_json)
	return {"ok": True}


def _reindex_slides_for_lesson(lesson, ordered_slide_names):
	course = _get_course_for_lesson(lesson)
	for i, slide_name in enumerate(ordered_slide_names, start=1):
		frappe.db.set_value("Course Slide", slide_name, {"lesson": lesson, "idx": i, "course": course})


@frappe.whitelist()
def reorder_slide(slide, source_lesson, target_lesson, idx):
	_require_course_author()
	idx = int(idx)

	source_slides = frappe.get_all(
		"Course Slide",
		filters={"lesson": source_lesson},
		pluck="name",
		order_by="idx, creation",
	)
	if slide in source_slides:
		source_slides.remove(slide)

	if source_lesson == target_lesson:
		source_slides.insert(idx, slide)
		_reindex_slides_for_lesson(source_lesson, source_slides)
		return {"ok": True}

	_reindex_slides_for_lesson(source_lesson, source_slides)

	target_slides = frappe.get_all(
		"Course Slide",
		filters={"lesson": target_lesson},
		pluck="name",
		order_by="idx, creation",
	)
	target_slides.insert(idx, slide)
	_reindex_slides_for_lesson(target_lesson, target_slides)

	return {"ok": True}


@frappe.whitelist()
def upsert_interaction(data):
	_require_course_author()
	data = _parse_json(data) or {}

	name = data.get("name")
	if name and frappe.db.exists("Course Interaction", name):
		doc = frappe.get_doc("Course Interaction", name)
	else:
		doc = frappe.new_doc("Course Interaction")

	allowed = {
		"title",
		"course",
		"chapter",
		"lesson",
		"slide",
		"target_type",
		"element_id",
		"event",
		"actions_json",
	}
	for k, v in data.items():
		if k in allowed:
			setattr(doc, k, v)

	if not doc.course and doc.slide:
		slide_course = frappe.db.get_value("Course Slide", doc.slide, "course")
		doc.course = slide_course

	if not doc.lesson and doc.slide:
		doc.lesson = frappe.db.get_value("Course Slide", doc.slide, "lesson")

	if not doc.chapter and doc.lesson:
		doc.chapter = frappe.db.get_value("Course Lesson", doc.lesson, "chapter")

	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def delete_interaction(name):
	_require_course_author()
	frappe.delete_doc("Course Interaction", name)
	return {"ok": True}


@frappe.whitelist()
def validate_course_for_publish(course):
	_require_course_author()

	chapters = get_chapters(course)
	if not chapters:
		return {"ok": False, "errors": [_("Course has no chapters.")]}

	errors = []
	for chapter_ref in chapters:
		lesson_refs = frappe.get_all(
			"Lesson Reference",
			filters={"parent": chapter_ref.chapter},
			fields=["idx", "lesson"],
			order_by="idx",
		)
		if not lesson_refs:
			errors.append(_("Chapter {0} has no lessons.").format(chapter_ref.chapter))
			continue

		for lr in lesson_refs:
			slide_count = frappe.db.count("Course Slide", {"lesson": lr.lesson})
			if slide_count == 0:
				errors.append(_("Lesson {0} has no slides.").format(lr.lesson))

	return {"ok": len(errors) == 0, "errors": errors}


def _build_publish_snapshot(course):
	course_doc = frappe.get_doc("LMS Course", course)
	snapshot = {
		"generated_at": now_datetime().isoformat(),
		"course": {
			"name": course_doc.name,
			"title": course_doc.title,
			"description": course_doc.description,
			"image": course_doc.image,
			"language": getattr(course_doc, "language", None),
			"format_type": getattr(course_doc, "format_type", None),
			"default_slide_settings": getattr(course_doc, "default_slide_settings", None),
		},
		"chapters": [],
		"interactions": [],
	}

	for chapter_ref in get_chapters(course_doc.name):
		chapter_doc = frappe.get_doc("Course Chapter", chapter_ref.chapter)
		chapter_out = {
			"idx": chapter_ref.idx,
			"name": chapter_doc.name,
			"title": chapter_doc.title,
			"description": getattr(chapter_doc, "description", None),
			"thumbnail": getattr(chapter_doc, "thumbnail", None),
			"lessons": [],
		}

		lesson_refs = frappe.get_all(
			"Lesson Reference",
			filters={"parent": chapter_doc.name},
			fields=["idx", "lesson"],
			order_by="idx",
		)
		for lr in lesson_refs:
			lesson_doc = frappe.get_doc("Course Lesson", lr.lesson)
			lesson_out = {
				"idx": lr.idx,
				"name": lesson_doc.name,
				"title": lesson_doc.title,
				"description": getattr(lesson_doc, "description", None),
				"slides": [],
			}

			slides = frappe.get_all(
				"Course Slide",
				filters={"lesson": lesson_doc.name},
				fields=["name", "title", "idx", "thumbnail", "konva_json"],
				order_by="idx, creation",
			)
			for s in slides:
				lesson_out["slides"].append(s)

			chapter_out["lessons"].append(lesson_out)

		snapshot["chapters"].append(chapter_out)

	snapshot_slide_names = [
		s["name"]
		for ch in snapshot["chapters"]
		for le in ch["lessons"]
		for s in le["slides"]
	]

	if snapshot_slide_names:
		interactions = frappe.get_all(
			"Course Interaction",
			filters={"slide": ["in", snapshot_slide_names]},
			fields=[
				"name",
				"title",
				"course",
				"chapter",
				"lesson",
				"slide",
				"target_type",
				"element_id",
				"event",
				"actions_json",
			],
			order_by="modified",
		)
		snapshot["interactions"] = interactions

	return snapshot


@frappe.whitelist()
def publish_course(course):
	return publish_course_version(course)


@frappe.whitelist()
def publish_course_version(course):
	_require_course_author()

	result = validate_course_for_publish(course)
	if not result.get("ok"):
		errors = result.get("errors") or []
		msg = "<br>".join(errors) if errors else _("Cannot publish course.")
		frappe.throw(msg, title=_("Validation Error"))

	course_doc = frappe.get_doc("LMS Course", course)
	current = int(getattr(course_doc, "current_version", 0) or 0)
	version = current + 1

	snapshot = _build_publish_snapshot(course)
	snapshot_json = json.dumps(snapshot)

	ver = frappe.new_doc("Course Version")
	ver.course = course
	ver.version = version
	ver.status = "Published"
	ver.published_on = now_datetime()
	ver.published_by = frappe.session.user
	ver.snapshot_json = snapshot_json
	ver.insert()

	course_doc.current_version = version
	course_doc.published = 1
	if not course_doc.published_on:
		course_doc.published_on = today()
	course_doc.save()

	return {"ok": True, "version": version, "course": course_doc.name, "course_version": ver.name}


@frappe.whitelist()
def list_course_versions(course):
	_require_course_author()
	return frappe.get_all(
		"Course Version",
		filters={"course": course},
		fields=["name", "version", "status", "published_on", "published_by"],
		order_by="version desc",
	)


def _restore_slide_order_for_lesson(lesson, snapshot_slides):
	snapshot_names = [s["name"] for s in snapshot_slides]
	course = _get_course_for_lesson(lesson)

	for i, slide in enumerate(snapshot_slides, start=1):
		values = {
			"lesson": lesson,
			"course": course,
			"idx": i,
			"title": slide.get("title"),
			"thumbnail": slide.get("thumbnail"),
			"konva_json": slide.get("konva_json"),
		}
		if frappe.db.exists("Course Slide", slide["name"]):
			frappe.db.set_value("Course Slide", slide["name"], values)
		else:
			doc = frappe.new_doc("Course Slide")
			doc.name = slide["name"]
			doc.update(values)
			doc.insert(ignore_permissions=True)

	extra = frappe.get_all(
		"Course Slide",
		filters={"lesson": lesson, "name": ["not in", snapshot_names]},
		fields=["name"],
		order_by="idx, creation",
	)
	idx = len(snapshot_slides) + 1
	for s in extra:
		frappe.db.set_value("Course Slide", s.name, "idx", idx)
		idx += 1


@frappe.whitelist()
def rollback_to_version(course, version):
	_require_course_author()

	ver_name = frappe.db.get_value("Course Version", {"course": course, "version": int(version)}, "name")
	if not ver_name:
		frappe.throw(_("Course Version not found"))

	ver = frappe.get_doc("Course Version", ver_name)
	snapshot = json.loads(ver.snapshot_json or "{}")

	course_doc = frappe.get_doc("LMS Course", course)
	course_data = snapshot.get("course") or {}
	for field in ["title", "description", "image", "language", "format_type", "default_slide_settings"]:
		if field in course_data:
			setattr(course_doc, field, course_data.get(field))
	course_doc.current_version = int(version)
	course_doc.save()

	frappe.db.delete("Chapter Reference", {"parent": course_doc.name})
	for ch in snapshot.get("chapters") or []:
		if frappe.db.exists("Course Chapter", ch["name"]):
			chapter_doc = frappe.get_doc("Course Chapter", ch["name"])
		else:
			chapter_doc = frappe.new_doc("Course Chapter")
			chapter_doc.name = ch["name"]
			chapter_doc.course = course_doc.name

		chapter_doc.title = ch.get("title")
		chapter_doc.description = ch.get("description")
		chapter_doc.thumbnail = ch.get("thumbnail")
		chapter_doc.save(ignore_permissions=True)

		ref = frappe.new_doc("Chapter Reference")
		ref.parent = course_doc.name
		ref.parenttype = "LMS Course"
		ref.parentfield = "chapters"
		ref.idx = ch.get("idx") or 0
		ref.chapter = chapter_doc.name
		ref.insert(ignore_permissions=True)

		frappe.db.delete("Lesson Reference", {"parent": chapter_doc.name})
		for le in ch.get("lessons") or []:
			if frappe.db.exists("Course Lesson", le["name"]):
				lesson_doc = frappe.get_doc("Course Lesson", le["name"])
			else:
				lesson_doc = frappe.new_doc("Course Lesson")
				lesson_doc.name = le["name"]
				lesson_doc.chapter = chapter_doc.name
				lesson_doc.course = course_doc.name

			lesson_doc.title = le.get("title")
			lesson_doc.description = le.get("description")
			lesson_doc.save(ignore_permissions=True)

			lref = frappe.new_doc("Lesson Reference")
			lref.parent = chapter_doc.name
			lref.parenttype = "Course Chapter"
			lref.parentfield = "lessons"
			lref.idx = le.get("idx") or 0
			lref.lesson = lesson_doc.name
			lref.insert(ignore_permissions=True)

			_restore_slide_order_for_lesson(lesson_doc.name, le.get("slides") or [])

	snapshot_slide_names = [
		s["name"]
		for ch in snapshot.get("chapters") or []
		for le in ch.get("lessons") or []
		for s in le.get("slides") or []
	]
	if snapshot_slide_names:
		frappe.db.delete("Course Interaction", {"slide": ["in", snapshot_slide_names]})
		for inter in snapshot.get("interactions") or []:
			doc = frappe.new_doc("Course Interaction")
			if inter.get("name"):
				doc.name = inter.get("name")
			doc.update(inter)
			doc.insert(ignore_permissions=True)

	ver.status = "Rolled Back"
	ver.save(ignore_permissions=True)

	return {"ok": True, "course": course_doc.name, "current_version": course_doc.current_version}
