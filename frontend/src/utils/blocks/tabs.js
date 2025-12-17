export class Tabs {
	static get toolbox() {
		return {
			title: 'Tabs',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><rect x="20" y="20" width="80" height="40" rx="4" stroke="currentColor" stroke-width="12" fill="none"/><rect x="110" y="20" width="80" height="40" rx="4" stroke="currentColor" stroke-width="12" fill="currentColor" fill-opacity="0.2"/><rect x="200" y="20" width="80" height="40" rx="4" stroke="currentColor" stroke-width="12" fill="none"/><rect x="20" y="70" width="260" height="180" rx="4" stroke="currentColor" stroke-width="12" fill="none"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			tabs: data.tabs || [
				{
					title: 'Tab 1',
					content: 'Content for tab 1...',
				},
				{
					title: 'Tab 2',
					content: 'Content for tab 2...',
				},
			],
			layout: data.layout || 'horizontal',
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('tabs-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('tabs-editor')

		// Layout Toggle
		const layoutContainer = document.createElement('div')
		layoutContainer.classList.add('tabs-layout-toggle')
		
		const layoutLabel = document.createElement('label')
		layoutLabel.innerHTML = `
			<span>Layout:</span>
			<select>
				<option value="horizontal" ${this.data.layout === 'horizontal' ? 'selected' : ''}>Horizontal</option>
				<option value="vertical" ${this.data.layout === 'vertical' ? 'selected' : ''}>Vertical</option>
			</select>
		`
		layoutLabel.querySelector('select').addEventListener('change', (e) => {
			this.data.layout = e.target.value
		})
		layoutContainer.appendChild(layoutLabel)
		container.appendChild(layoutContainer)

		// Tabs
		const tabsContainer = document.createElement('div')
		tabsContainer.classList.add('tabs-items')

		this.data.tabs.forEach((tab, index) => {
			const tabElement = this.createTabEditor(tab, index)
			tabsContainer.appendChild(tabElement)
		})

		container.appendChild(tabsContainer)

		// Add Tab Button
		const addButton = document.createElement('button')
		addButton.classList.add('tabs-add-button')
		addButton.textContent = '+ Add Tab'
		addButton.addEventListener('click', () => {
			this.data.tabs.push({
				title: `Tab ${this.data.tabs.length + 1}`,
				content: 'Content goes here...',
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createTabEditor(tab, index) {
		const tabDiv = document.createElement('div')
		tabDiv.classList.add('tab-item-editor')

		// Title Input
		const titleInput = document.createElement('input')
		titleInput.type = 'text'
		titleInput.classList.add('tab-title-input')
		titleInput.placeholder = 'Tab title...'
		titleInput.value = tab.title
		titleInput.addEventListener('input', (e) => {
			tab.title = e.target.value
		})

		// Content Textarea
		const contentTextarea = document.createElement('textarea')
		contentTextarea.classList.add('tab-content-input')
		contentTextarea.placeholder = 'Tab content...'
		contentTextarea.value = tab.content
		contentTextarea.rows = 5
		contentTextarea.addEventListener('input', (e) => {
			tab.content = e.target.value
		})

		// Delete Button
		const deleteButton = document.createElement('button')
		deleteButton.classList.add('tab-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete tab'
		deleteButton.addEventListener('click', () => {
			if (this.data.tabs.length > 1) {
				this.data.tabs.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		const header = document.createElement('div')
		header.classList.add('tab-item-header')
		header.appendChild(titleInput)
		header.appendChild(deleteButton)

		tabDiv.appendChild(header)
		tabDiv.appendChild(contentTextarea)

		return tabDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('tabs-readonly')
		container.classList.add(`tabs-${this.data.layout}`)

		// Tab Headers
		const tabHeaders = document.createElement('div')
		tabHeaders.classList.add('tabs-headers')

		this.data.tabs.forEach((tab, index) => {
			const header = document.createElement('button')
			header.classList.add('tab-header')
			header.textContent = tab.title
			header.dataset.index = index
			
			if (index === 0) {
				header.classList.add('active')
			}

			header.addEventListener('click', () => {
				this.activateTab(index, container)
			})

			tabHeaders.appendChild(header)
		})

		// Tab Contents
		const tabContents = document.createElement('div')
		tabContents.classList.add('tabs-contents')

		this.data.tabs.forEach((tab, index) => {
			const content = document.createElement('div')
			content.classList.add('tab-content')
			content.dataset.index = index
			content.innerHTML = this.formatContent(tab.content)
			
			if (index === 0) {
				content.classList.add('active')
			}

			tabContents.appendChild(content)
		})

		container.appendChild(tabHeaders)
		container.appendChild(tabContents)

		this.wrapper.appendChild(container)
	}

	activateTab(index, container) {
		const headers = container.querySelectorAll('.tab-header')
		const contents = container.querySelectorAll('.tab-content')

		headers.forEach((header) => header.classList.remove('active'))
		contents.forEach((content) => content.classList.remove('active'))

		headers[index].classList.add('active')
		contents[index].classList.add('active')
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
		if (!savedData.tabs || savedData.tabs.length === 0) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			tabs: {},
			layout: {},
		}
	}
}
