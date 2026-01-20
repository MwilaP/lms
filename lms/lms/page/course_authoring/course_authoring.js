frappe.pages["course-authoring"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Course Authoring",
		single_column: true,
	});

	const $root = $(page.body);
	$root.html(
		`<div class="course-authoring">
			<div class="row no-gutters" style="height: calc(100vh - 140px);">
				<div class="col-md-3" style="border-right: 1px solid var(--border-color); height: 100%; overflow: auto;">
					<div class="p-3">
						<div class="mb-2" data-ca="course-title" style="font-weight: 600;"></div>
						<div class="mb-3" data-ca="course-picker"></div>
						<div data-ca="outline"></div>
					</div>
				</div>
				<div class="col-md-6" style="border-right: 1px solid var(--border-color); height: 100%; overflow: auto;">
					<div class="p-3">
						<div class="d-flex justify-content-between align-items-center mb-2">
							<div data-ca="slide-title" style="font-weight: 600;"></div>
							<div class="d-flex align-items-center" style="gap: 6px;">
								<button class="btn btn-default btn-sm" data-ca="add-rect">Rect</button>
								<button class="btn btn-default btn-sm" data-ca="add-text">Text</button>
								<button class="btn btn-primary btn-sm" data-ca="save">Save</button>
							</div>
						</div>
						<div class="mb-2" data-ca="status" style="min-height: 18px;"></div>
						<div data-ca="stage-wrap" style="width: 100%;">
							<div data-ca="stage" style="width: 100%; height: 520px; background: var(--gray-50); border: 1px solid var(--border-color); border-radius: 6px;"></div>
						</div>
						<textarea class="form-control mt-2" data-ca="konva" rows="6" placeholder="Konva JSON (debug)"></textarea>
					</div>
				</div>
				<div class="col-md-3" style="height: 100%; overflow: auto;">
					<div class="p-3">
						<div style="font-weight: 600;" class="mb-2">Inspector</div>
						<pre data-ca="inspector" style="white-space: pre-wrap; word-break: break-word; font-size: 12px;">Select an element</pre>
					</div>
				</div>
			</div>
		</div>`
	);

	const state = {
		course: null,
		slide: null,
		stage: null,
		ui_layer: null,
		transformer: null,
		selected: null,
		save_timeout: null,
		key_listener_bound: false,
	};

	function set_status(text, indicator) {
		const $status = $root.find('[data-ca="status"]');
		$status.removeClass("text-muted text-danger text-success");
		if (indicator === "red") {
			$status.addClass("text-danger");
		} else if (indicator === "green") {
			$status.addClass("text-success");
		} else {
			$status.addClass("text-muted");
		}
		$status.text(text || "");
	}

	function load_script(url) {
		return new Promise((resolve, reject) => {
			const existing = document.querySelector(`script[src="${url}"]`);
			if (existing) {
				resolve();
				return;
			}
			const script = document.createElement("script");
			script.src = url;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error(`Failed to load ${url}`));
			document.head.appendChild(script);
		});
	}

	async function ensure_konva() {
		if (window.Konva) {
			return;
		}
		set_status("Loading editor…", "");
		await load_script("https://unpkg.com/konva@9/konva.min.js");
		if (!window.Konva) {
			throw new Error("Konva failed to initialize");
		}
	}

	function destroy_stage() {
		if (state.stage) {
			state.stage.destroy();
			state.stage = null;
			state.ui_layer = null;
			state.transformer = null;
			state.selected = null;
		}
		$root.find('[data-ca="stage"]').empty();
	}

	function get_stage_container_size() {
		const el = $root.find('[data-ca="stage"]')[0];
		if (!el) {
			return { width: 0, height: 0 };
		}
		const rect = el.getBoundingClientRect();
		return { width: rect.width || 0, height: rect.height || 0 };
	}

	function get_base_stage_size() {
		return { width: 1024, height: 576 };
	}

	function fit_stage_to_container() {
		if (!state.stage) {
			return;
		}
		const base = get_base_stage_size();
		const size = get_stage_container_size();
		if (!size.width || !size.height) {
			return;
		}
		const scale = Math.min(size.width / base.width, size.height / base.height);
		state.stage.width(base.width);
		state.stage.height(base.height);
		state.stage.scale({ x: scale, y: scale });
		state.stage.draw();
	}

	function set_selected(node) {
		state.selected = node || null;
		if (state.transformer) {
			state.transformer.nodes(node ? [node] : []);
			state.ui_layer.draw();
		}
		const $inspector = $root.find('[data-ca="inspector"]');
		if (!node) {
			$inspector.text("Select an element");
			return;
		}
		try {
			$inspector.text(JSON.stringify(node.getAttrs(), null, 2));
		} catch (e) {
			$inspector.text(String(e));
		}
	}

	function get_content_layer() {
		if (!state.stage) {
			return null;
		}
		let layer = state.stage.findOne("Layer");
		if (!layer) {
			layer = new window.Konva.Layer();
			state.stage.add(layer);
		}
		return layer;
	}

	function ensure_ui_layer() {
		if (!state.stage) {
			return;
		}
		if (state.ui_layer) {
			return;
		}
		state.ui_layer = new window.Konva.Layer();
		state.stage.add(state.ui_layer);
		state.transformer = new window.Konva.Transformer({
			rotateEnabled: true,
			anchorSize: 8,
			borderStroke: "#4f46e5",
			anchorStroke: "#4f46e5",
			anchorFill: "#ffffff",
		});
		state.ui_layer.add(state.transformer);
		state.ui_layer.draw();
	}

	function update_konva_textarea() {
		if (!state.stage) {
			$root.find('[data-ca="konva"]').val("");
			return;
		}
		const json = state.stage.toJSON();
		$root.find('[data-ca="konva"]').val(json);
	}

	function save_stage() {
		if (!state.slide || !state.stage) {
			return;
		}
		update_konva_textarea();
		const konva_json = $root.find('[data-ca="konva"]').val();
		set_status("Saving…", "");
		frappe.call({
			method: "lms.lms.authoring_api.save_konva_json",
			args: { slide: state.slide, konva_json },
			callback: () => {
				set_status("Saved", "green");
			},
			error: () => {
				set_status("Save failed", "red");
			},
		});
	}

	function schedule_autosave() {
		if (state.save_timeout) {
			clearTimeout(state.save_timeout);
		}
		state.save_timeout = setTimeout(() => {
			state.save_timeout = null;
			save_stage();
		}, 800);
	}

	function bind_key_listener() {
		if (state.key_listener_bound) {
			return;
		}
		state.key_listener_bound = true;
		document.addEventListener("keydown", (e) => {
			if (!state.stage) {
				return;
			}
			if (!state.selected) {
				return;
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				if (state.selected && state.selected.destroy) {
					state.selected.destroy();
					set_selected(null);
					state.stage.draw();
					schedule_autosave();
				}
			}
		});
	}

	async function render_stage(konva_json) {
		destroy_stage();
		try {
			await ensure_konva();
		} catch (e) {
			set_status("Konva could not be loaded", "red");
			return;
		}

		const container = $root.find('[data-ca="stage"]')[0];
		if (!container) {
			return;
		}

		const base = get_base_stage_size();
		let stage;
		if (konva_json) {
			try {
				stage = window.Konva.Node.create(konva_json, container);
			} catch (e) {
				stage = null;
			}
		}
		if (!stage) {
			stage = new window.Konva.Stage({ container, width: base.width, height: base.height });
			const layer = new window.Konva.Layer();
			stage.add(layer);
			layer.draw();
		}

		state.stage = stage;
		ensure_ui_layer();
		get_content_layer();
		fit_stage_to_container();
		update_konva_textarea();
		set_status("", "");
		bind_key_listener();

		state.stage.on("click tap", (evt) => {
			const target = evt.target;
			if (!target || target === state.stage) {
				set_selected(null);
				return;
			}
			if (state.transformer && state.transformer === target) {
				return;
			}
			set_selected(target);
		});

		state.stage.on("dragend transformend", () => {
			schedule_autosave();
		});

		$(window).on("resize.course-authoring", () => {
			fit_stage_to_container();
		});
	}

	function get_course_from_route() {
		const route = frappe.get_route();
		if (route && route.length > 1) {
			return route[1];
		}
		const opts = (frappe.get_route_options && frappe.get_route_options()) || frappe.route_options || {};
		return opts.course;
	}

	function render_outline(outline) {
		const $outline = $root.find('[data-ca="outline"]');
		$outline.empty();

		(outline.chapters || []).forEach((ch) => {
			const $ch = $(
				`<div class="mb-3">
					<div style="font-weight:600;" class="mb-2">${frappe.utils.escape_html(ch.title || ch.name)}</div>
					<div data-ca="ch"></div>
				</div>`
			);
			(ch.lessons || []).forEach((le) => {
				const $le = $(
					`<div class="mb-2">
						<div style="font-weight:500;" class="mb-1">${frappe.utils.escape_html(le.title || le.name)}</div>
						<div class="pl-2" data-ca="slides"></div>
					</div>`
				);
				(le.slides || []).forEach((sl) => {
					const $sl = $(
						`<div class="mb-1">
							<a href="#" data-slide="${sl.name}">${frappe.utils.escape_html(sl.title || sl.name)}</a>
						</div>`
					);
					$sl.find('a').on('click', (e) => {
						e.preventDefault();
						load_slide(sl.name);
					});
					$le.find('[data-ca="slides"]').append($sl);
				});
				$ch.find('[data-ca="ch"]').append($le);
			});
			$outline.append($ch);
		});
	}

	function load_course(course) {
		state.course = course;
		$root.find('[data-ca="course-title"]').text(course ? `Course: ${course}` : "");
		state.slide = null;
		$root.find('[data-ca="slide-title"]').text("");
		$root.find('[data-ca="konva"]').val("");
		destroy_stage();

		if (!course) {
			return;
		}

		frappe.call({
			method: "lms.lms.authoring_api.get_course_outline",
			args: { course },
			callback: (r) => {
				const outline = r.message;
				if (outline && outline.course) {
					$root.find('[data-ca="course-title"]').text(outline.course.title || outline.course.name);
				}
				render_outline(outline || { chapters: [] });
			},
		});
	}

	function load_slide(slide) {
		state.slide = slide;
		$root.find('[data-ca="slide-title"]').text(slide);
		$root.find('[data-ca="konva"]').val("");
		destroy_stage();

		frappe.call({
			method: "lms.lms.authoring_api.get_slide",
			args: { slide },
			callback: (r) => {
				const d = r.message || {};
				$root.find('[data-ca="slide-title"]').text(d.title || d.name || slide);
				$root.find('[data-ca="konva"]').val(d.konva_json || "");
				render_stage(d.konva_json || "");
			},
		});
	}

	$root.find('[data-ca="save"]').on('click', () => {
		if (!state.slide) {
			frappe.msgprint("Select a slide to save");
			return;
		}
		save_stage();
	});

	$root.find('[data-ca="add-rect"]').on("click", () => {
		if (!state.stage) {
			return;
		}
		const layer = get_content_layer();
		const rect = new window.Konva.Rect({
			x: 80,
			y: 80,
			width: 240,
			height: 120,
			fill: "#e0e7ff",
			stroke: "#4f46e5",
			strokeWidth: 1,
			draggable: true,
		});
		layer.add(rect);
		layer.draw();
		set_selected(rect);
		schedule_autosave();
	});

	$root.find('[data-ca="add-text"]').on("click", () => {
		if (!state.stage) {
			return;
		}
		const layer = get_content_layer();
		const text = new window.Konva.Text({
			x: 100,
			y: 110,
			text: "Text",
			fontSize: 32,
			fill: "#111827",
			draggable: true,
		});
		layer.add(text);
		layer.draw();
		set_selected(text);
		schedule_autosave();
	});

	const $picker = $root.find('[data-ca="course-picker"]');
	const $btn = $(
		'<button class="btn btn-default btn-sm">Select Course</button>'
	);
	$btn.on('click', () => {
		frappe.prompt(
			[
				{
					fieldtype: "Link",
					fieldname: "course",
					label: "LMS Course",
					options: "LMS Course",
					reqd: 1,
				},
			],
			(values) => {
				frappe.set_route("course-authoring", values.course);
			},
			"Select Course"
		);
	});
	$picker.append($btn);

	load_course(get_course_from_route());
};

frappe.pages["course-authoring"].on_page_show = function () {
	const route = frappe.get_route();
	if (route && route[0] === "course-authoring" && frappe.pages["course-authoring"]) {
		const wrapper = frappe.container && frappe.container.page && frappe.container.page.wrapper;
		if (!wrapper) {
			return;
		}
	}
};
