import { ChevronDown } from 'lucide-vue-next'

export class Accordion {
	static get toolbox() {
		return {
			title: 'Accordion',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><path d="M291 150V126C291 123.791 289.209 122 287 122H49C46.7909 122 45 123.791 45 126V150C45 152.209 46.7909 154 49 154H287C289.209 154 291 152.209 291 150Z" stroke="currentColor" stroke-width="12"/><path d="M291 48V24C291 21.7909 289.209 20 287 20H49C46.7909 20 45 21.7909 45 24V48C45 50.2091 46.7909 52 49 52H287C289.209 52 291 50.2091 291 48Z" stroke="currentColor" stroke-width="12"/><path d="M291 252V228C291 225.791 289.209 224 287 224H49C46.7909 224 45 225.791 45 228V252C45 254.209 46.7909 256 49 256H287C289.209 256 291 254.209 291 252Z" stroke="currentColor" stroke-width="12"/></svg>',
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
					title: 'Section 1',
					content: 'Content goes here...',
					isOpen: false,
				},
			],
			expandAll: data.expandAll || false,
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('accordion-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('accordion-editor')

		// Expand All Toggle
		const expandAllContainer = document.createElement('div')
		expandAllContainer.classList.add('accordion-expand-all')
		
		const expandAllLabel = document.createElement('label')
		expandAllLabel.innerHTML = `
			<input type="checkbox" ${this.data.expandAll ? 'checked' : ''} />
			<span>Expand all by default</span>
		`
		expandAllLabel.querySelector('input').addEventListener('change', (e) => {
			this.data.expandAll = e.target.checked
		})
		expandAllContainer.appendChild(expandAllLabel)
		container.appendChild(expandAllContainer)

		// Items
		const itemsContainer = document.createElement('div')
		itemsContainer.classList.add('accordion-items')

		this.data.items.forEach((item, index) => {
			const itemElement = this.createItemEditor(item, index)
			itemsContainer.appendChild(itemElement)
		})

		container.appendChild(itemsContainer)

		// Add Item Button
		const addButton = document.createElement('button')
		addButton.classList.add('accordion-add-button')
		addButton.textContent = '+ Add Section'
		addButton.addEventListener('click', () => {
			this.data.items.push({
				title: `Section ${this.data.items.length + 1}`,
				content: 'Content goes here...',
				isOpen: false,
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createItemEditor(item, index) {
		const itemDiv = document.createElement('div')
		itemDiv.classList.add('accordion-item-editor')

		// Title Input
		const titleInput = document.createElement('input')
		titleInput.type = 'text'
		titleInput.classList.add('accordion-title-input')
		titleInput.placeholder = 'Section title...'
		titleInput.value = item.title
		titleInput.addEventListener('input', (e) => {
			item.title = e.target.value
		})

		// Content Textarea
		const contentTextarea = document.createElement('textarea')
		contentTextarea.classList.add('accordion-content-input')
		contentTextarea.placeholder = 'Section content...'
		contentTextarea.value = item.content
		contentTextarea.rows = 4
		contentTextarea.addEventListener('input', (e) => {
			item.content = e.target.value
		})

		// Delete Button
		const deleteButton = document.createElement('button')
		deleteButton.classList.add('accordion-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete section'
		deleteButton.addEventListener('click', () => {
			if (this.data.items.length > 1) {
				this.data.items.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		const header = document.createElement('div')
		header.classList.add('accordion-item-header')
		header.appendChild(titleInput)
		header.appendChild(deleteButton)

		itemDiv.appendChild(header)
		itemDiv.appendChild(contentTextarea)

		return itemDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('accordion-readonly')

		this.data.items.forEach((item, index) => {
			const itemElement = this.createReadOnlyItem(item, index)
			container.appendChild(itemElement)
		})

		this.wrapper.appendChild(container)
	}

	createReadOnlyItem(item, index) {
		const itemDiv = document.createElement('div')
		itemDiv.classList.add('accordion-item')
		itemDiv.dataset.index = index

		const header = document.createElement('div')
		header.classList.add('accordion-header')
		
		const title = document.createElement('div')
		title.classList.add('accordion-title')
		title.textContent = item.title

		const icon = document.createElement('span')
		icon.classList.add('accordion-icon')
		icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'

		header.appendChild(title)
		header.appendChild(icon)

		const content = document.createElement('div')
		content.classList.add('accordion-content')
		content.innerHTML = this.formatContent(item.content)

		// Set initial state
		if (this.data.expandAll || item.isOpen) {
			itemDiv.classList.add('active')
			content.style.maxHeight = content.scrollHeight + 'px'
		}

		header.addEventListener('click', () => {
			const isActive = itemDiv.classList.contains('active')
			
			if (isActive) {
				itemDiv.classList.remove('active')
				content.style.maxHeight = null
			} else {
				itemDiv.classList.add('active')
				content.style.maxHeight = content.scrollHeight + 'px'
			}
		})

		itemDiv.appendChild(header)
		itemDiv.appendChild(content)

		return itemDiv
	}

	formatContent(content) {
		// Simple markdown-like formatting
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
			expandAll: {},
		}
	}
}
