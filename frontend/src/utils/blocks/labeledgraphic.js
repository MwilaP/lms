export class LabeledGraphic {
	static get toolbox() {
		return {
			title: 'Labeled Graphic',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><rect x="20" y="20" width="280" height="200" rx="8" stroke="currentColor" stroke-width="10" fill="none"/><circle cx="100" cy="80" r="12" fill="#2563eb"/><circle cx="220" cy="120" r="12" fill="#2563eb"/><circle cx="160" cy="160" r="12" fill="#2563eb"/><line x1="100" y1="80" x2="140" y2="50" stroke="currentColor" stroke-width="4"/><line x1="220" y1="120" x2="260" y2="100" stroke="currentColor" stroke-width="4"/><line x1="160" y1="160" x2="200" y2="190" stroke="currentColor" stroke-width="4"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			imageUrl: data.imageUrl || '',
			markers: data.markers || [],
		}
		this.wrapper = null
		this.imageElement = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('labeled-graphic-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('labeled-graphic-editor')

		// Image Upload
		const uploadContainer = document.createElement('div')
		uploadContainer.classList.add('labeled-graphic-upload')

		if (!this.data.imageUrl) {
			const uploadButton = document.createElement('button')
			uploadButton.classList.add('labeled-graphic-upload-button')
			uploadButton.textContent = 'Upload Image'
			uploadButton.addEventListener('click', () => {
				const input = document.createElement('input')
				input.type = 'file'
				input.accept = 'image/*'
				input.onchange = (e) => {
					const file = e.target.files[0]
					if (file) {
						const reader = new FileReader()
						reader.onload = (event) => {
							this.data.imageUrl = event.target.result
							this.wrapper.innerHTML = ''
							this.renderEditor()
						}
						reader.readAsDataURL(file)
					}
				}
				input.click()
			})
			uploadContainer.appendChild(uploadButton)
		} else {
			// Image with markers
			const imageContainer = document.createElement('div')
			imageContainer.classList.add('labeled-graphic-image-container')

			this.imageElement = document.createElement('img')
			this.imageElement.src = this.data.imageUrl
			this.imageElement.classList.add('labeled-graphic-image')

			// Add click handler to add markers
			this.imageElement.addEventListener('click', (e) => {
				const rect = this.imageElement.getBoundingClientRect()
				const x = ((e.clientX - rect.left) / rect.width) * 100
				const y = ((e.clientY - rect.top) / rect.height) * 100

				this.data.markers.push({
					x: x,
					y: y,
					label: `Marker ${this.data.markers.length + 1}`,
					description: 'Description...',
				})
				this.wrapper.innerHTML = ''
				this.renderEditor()
			})

			imageContainer.appendChild(this.imageElement)

			// Render existing markers
			this.data.markers.forEach((marker, index) => {
				const markerElement = this.createMarkerElement(marker, index, true)
				imageContainer.appendChild(markerElement)
			})

			uploadContainer.appendChild(imageContainer)

			// Change Image Button
			const changeButton = document.createElement('button')
			changeButton.classList.add('labeled-graphic-change-button')
			changeButton.textContent = 'Change Image'
			changeButton.addEventListener('click', () => {
				this.data.imageUrl = ''
				this.data.markers = []
				this.wrapper.innerHTML = ''
				this.renderEditor()
			})
			uploadContainer.appendChild(changeButton)

			// Markers List
			if (this.data.markers.length > 0) {
				const markersList = document.createElement('div')
				markersList.classList.add('labeled-graphic-markers-list')

				const listTitle = document.createElement('h4')
				listTitle.textContent = 'Markers'
				markersList.appendChild(listTitle)

				this.data.markers.forEach((marker, index) => {
					const markerEditor = this.createMarkerEditor(marker, index)
					markersList.appendChild(markerEditor)
				})

				uploadContainer.appendChild(markersList)
			}
		}

		container.appendChild(uploadContainer)
		this.wrapper.appendChild(container)
	}

	createMarkerElement(marker, index, isEditor = false) {
		const markerDiv = document.createElement('div')
		markerDiv.classList.add('labeled-graphic-marker')
		markerDiv.style.left = `${marker.x}%`
		markerDiv.style.top = `${marker.y}%`
		markerDiv.textContent = index + 1

		if (isEditor) {
			markerDiv.title = 'Click to edit'
		}

		return markerDiv
	}

	createMarkerEditor(marker, index) {
		const editorDiv = document.createElement('div')
		editorDiv.classList.add('labeled-graphic-marker-editor')

		const header = document.createElement('div')
		header.classList.add('marker-editor-header')
		
		const title = document.createElement('span')
		title.textContent = `Marker ${index + 1}`
		
		const deleteButton = document.createElement('button')
		deleteButton.classList.add('marker-delete-button')
		deleteButton.textContent = '×'
		deleteButton.addEventListener('click', () => {
			this.data.markers.splice(index, 1)
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})

		header.appendChild(title)
		header.appendChild(deleteButton)

		const labelInput = document.createElement('input')
		labelInput.type = 'text'
		labelInput.placeholder = 'Label...'
		labelInput.value = marker.label
		labelInput.addEventListener('input', (e) => {
			marker.label = e.target.value
		})

		const descTextarea = document.createElement('textarea')
		descTextarea.placeholder = 'Description...'
		descTextarea.value = marker.description
		descTextarea.rows = 2
		descTextarea.addEventListener('input', (e) => {
			marker.description = e.target.value
		})

		editorDiv.appendChild(header)
		editorDiv.appendChild(labelInput)
		editorDiv.appendChild(descTextarea)

		return editorDiv
	}

	renderReadOnly() {
		if (!this.data.imageUrl) {
			const placeholder = document.createElement('div')
			placeholder.classList.add('labeled-graphic-placeholder')
			placeholder.textContent = 'No image uploaded'
			this.wrapper.appendChild(placeholder)
			return
		}

		const container = document.createElement('div')
		container.classList.add('labeled-graphic-readonly')

		const imageContainer = document.createElement('div')
		imageContainer.classList.add('labeled-graphic-image-container')

		this.imageElement = document.createElement('img')
		this.imageElement.src = this.data.imageUrl
		this.imageElement.classList.add('labeled-graphic-image')

		imageContainer.appendChild(this.imageElement)

		// Render markers
		this.data.markers.forEach((marker, index) => {
			const markerElement = this.createReadOnlyMarker(marker, index)
			imageContainer.appendChild(markerElement)
		})

		container.appendChild(imageContainer)
		this.wrapper.appendChild(container)
	}

	createReadOnlyMarker(marker, index) {
		const markerDiv = document.createElement('div')
		markerDiv.classList.add('labeled-graphic-marker')
		markerDiv.style.left = `${marker.x}%`
		markerDiv.style.top = `${marker.y}%`
		markerDiv.textContent = index + 1

		// Tooltip
		const tooltip = document.createElement('div')
		tooltip.classList.add('labeled-graphic-tooltip')
		
		const tooltipTitle = document.createElement('div')
		tooltipTitle.classList.add('tooltip-title')
		tooltipTitle.textContent = marker.label

		const tooltipDesc = document.createElement('div')
		tooltipDesc.classList.add('tooltip-description')
		tooltipDesc.innerHTML = this.formatContent(marker.description)

		tooltip.appendChild(tooltipTitle)
		tooltip.appendChild(tooltipDesc)
		markerDiv.appendChild(tooltip)

		markerDiv.addEventListener('click', () => {
			tooltip.classList.toggle('visible')
		})

		return markerDiv
	}

	formatContent(content) {
		return content
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/\n/g, '<br>')
	}

	save() {
		return this.data
	}

	validate(savedData) {
		if (!savedData.imageUrl) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			imageUrl: {},
			markers: {},
		}
	}
}
