export class Timeline {
	static get toolbox() {
		return {
			title: 'Timeline',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><circle cx="60" cy="50" r="15" stroke="currentColor" stroke-width="8" fill="currentColor"/><line x1="60" y1="65" x2="60" y2="110" stroke="currentColor" stroke-width="8"/><circle cx="60" cy="125" r="15" stroke="currentColor" stroke-width="8" fill="none"/><line x1="60" y1="140" x2="60" y2="185" stroke="currentColor" stroke-width="8"/><circle cx="60" cy="200" r="15" stroke="currentColor" stroke-width="8" fill="currentColor"/><rect x="90" y="35" width="200" height="30" rx="4" fill="currentColor" fill-opacity="0.2"/><rect x="90" y="110" width="200" height="30" rx="4" fill="currentColor" fill-opacity="0.2"/><rect x="90" y="185" width="200" height="30" rx="4" fill="currentColor" fill-opacity="0.2"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			items: data.items || [
				{
					date: '2024',
					title: 'Event 1',
					description: 'Description of event 1',
				},
				{
					date: '2025',
					title: 'Event 2',
					description: 'Description of event 2',
				},
			],
			layout: data.layout || 'vertical',
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('timeline-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('timeline-editor')

		// Layout Toggle
		const layoutContainer = document.createElement('div')
		layoutContainer.classList.add('timeline-layout-toggle')
		
		const layoutLabel = document.createElement('label')
		layoutLabel.innerHTML = `
			<span>Layout:</span>
			<select>
				<option value="vertical" ${this.data.layout === 'vertical' ? 'selected' : ''}>Vertical</option>
				<option value="horizontal" ${this.data.layout === 'horizontal' ? 'selected' : ''}>Horizontal</option>
			</select>
		`
		layoutLabel.querySelector('select').addEventListener('change', (e) => {
			this.data.layout = e.target.value
		})
		layoutContainer.appendChild(layoutLabel)
		container.appendChild(layoutContainer)

		// Items
		const itemsContainer = document.createElement('div')
		itemsContainer.classList.add('timeline-items')

		this.data.items.forEach((item, index) => {
			const itemElement = this.createItemEditor(item, index)
			itemsContainer.appendChild(itemElement)
		})

		container.appendChild(itemsContainer)

		// Add Item Button
		const addButton = document.createElement('button')
		addButton.classList.add('timeline-add-button')
		addButton.textContent = '+ Add Event'
		addButton.addEventListener('click', () => {
			this.data.items.push({
				date: new Date().getFullYear().toString(),
				title: `Event ${this.data.items.length + 1}`,
				description: 'Description goes here...',
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createItemEditor(item, index) {
		const itemDiv = document.createElement('div')
		itemDiv.classList.add('timeline-item-editor')

		// Date Input
		const dateInput = document.createElement('input')
		dateInput.type = 'text'
		dateInput.classList.add('timeline-date-input')
		dateInput.placeholder = 'Date/Year...'
		dateInput.value = item.date
		dateInput.addEventListener('input', (e) => {
			item.date = e.target.value
		})

		// Title Input
		const titleInput = document.createElement('input')
		titleInput.type = 'text'
		titleInput.classList.add('timeline-title-input')
		titleInput.placeholder = 'Event title...'
		titleInput.value = item.title
		titleInput.addEventListener('input', (e) => {
			item.title = e.target.value
		})

		// Description Textarea
		const descTextarea = document.createElement('textarea')
		descTextarea.classList.add('timeline-desc-input')
		descTextarea.placeholder = 'Event description...'
		descTextarea.value = item.description
		descTextarea.rows = 3
		descTextarea.addEventListener('input', (e) => {
			item.description = e.target.value
		})

		// Delete Button
		const deleteButton = document.createElement('button')
		deleteButton.classList.add('timeline-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete event'
		deleteButton.addEventListener('click', () => {
			if (this.data.items.length > 1) {
				this.data.items.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		const header = document.createElement('div')
		header.classList.add('timeline-item-header')
		header.appendChild(dateInput)
		header.appendChild(deleteButton)

		itemDiv.appendChild(header)
		itemDiv.appendChild(titleInput)
		itemDiv.appendChild(descTextarea)

		return itemDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('timeline-readonly')
		container.classList.add(`timeline-${this.data.layout}`)

		this.data.items.forEach((item, index) => {
			const itemElement = this.createReadOnlyItem(item, index)
			container.appendChild(itemElement)
		})

		this.wrapper.appendChild(container)
	}

	createReadOnlyItem(item, index) {
		const itemDiv = document.createElement('div')
		itemDiv.classList.add('timeline-item')

		const marker = document.createElement('div')
		marker.classList.add('timeline-marker')

		const line = document.createElement('div')
		line.classList.add('timeline-line')

		const content = document.createElement('div')
		content.classList.add('timeline-content')

		const date = document.createElement('div')
		date.classList.add('timeline-date')
		date.textContent = item.date

		const title = document.createElement('div')
		title.classList.add('timeline-title')
		title.textContent = item.title

		const description = document.createElement('div')
		description.classList.add('timeline-description')
		description.innerHTML = this.formatContent(item.description)

		content.appendChild(date)
		content.appendChild(title)
		content.appendChild(description)

		itemDiv.appendChild(marker)
		if (index < this.data.items.length - 1) {
			itemDiv.appendChild(line)
		}
		itemDiv.appendChild(content)

		return itemDiv
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
		if (!savedData.items || savedData.items.length === 0) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			items: {},
			layout: {},
		}
	}
}
