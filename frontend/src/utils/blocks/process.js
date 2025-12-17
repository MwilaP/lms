export class Process {
	static get toolbox() {
		return {
			title: 'Process',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><circle cx="60" cy="138" r="30" stroke="currentColor" stroke-width="10" fill="none"/><text x="60" y="148" text-anchor="middle" font-size="32" font-weight="bold" fill="currentColor">1</text><path d="M90 138 L130 138" stroke="currentColor" stroke-width="8" marker-end="url(#arrowhead)"/><circle cx="180" cy="138" r="30" stroke="currentColor" stroke-width="10" fill="none"/><text x="180" y="148" text-anchor="middle" font-size="32" font-weight="bold" fill="currentColor">2</text><path d="M210 138 L250 138" stroke="currentColor" stroke-width="8" marker-end="url(#arrowhead)"/><circle cx="300" cy="138" r="30" stroke="currentColor" stroke-width="10" fill="none"/><text x="300" y="148" text-anchor="middle" font-size="32" font-weight="bold" fill="currentColor">3</text></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			steps: data.steps || [
				{
					title: 'Step 1',
					description: 'Description of step 1',
				},
				{
					title: 'Step 2',
					description: 'Description of step 2',
				},
				{
					title: 'Step 3',
					description: 'Description of step 3',
				},
			],
			layout: data.layout || 'horizontal',
			showNumbers: data.showNumbers !== false,
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('process-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('process-editor')

		// Settings
		const settingsContainer = document.createElement('div')
		settingsContainer.classList.add('process-settings')
		
		// Layout Toggle
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

		// Show Numbers Toggle
		const numbersLabel = document.createElement('label')
		numbersLabel.innerHTML = `
			<input type="checkbox" ${this.data.showNumbers ? 'checked' : ''} />
			<span>Show step numbers</span>
		`
		numbersLabel.querySelector('input').addEventListener('change', (e) => {
			this.data.showNumbers = e.target.checked
		})

		settingsContainer.appendChild(layoutLabel)
		settingsContainer.appendChild(numbersLabel)
		container.appendChild(settingsContainer)

		// Steps
		const stepsContainer = document.createElement('div')
		stepsContainer.classList.add('process-steps')

		this.data.steps.forEach((step, index) => {
			const stepElement = this.createStepEditor(step, index)
			stepsContainer.appendChild(stepElement)
		})

		container.appendChild(stepsContainer)

		// Add Step Button
		const addButton = document.createElement('button')
		addButton.classList.add('process-add-button')
		addButton.textContent = '+ Add Step'
		addButton.addEventListener('click', () => {
			this.data.steps.push({
				title: `Step ${this.data.steps.length + 1}`,
				description: 'Description goes here...',
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createStepEditor(step, index) {
		const stepDiv = document.createElement('div')
		stepDiv.classList.add('process-step-editor')

		// Title Input
		const titleInput = document.createElement('input')
		titleInput.type = 'text'
		titleInput.classList.add('process-title-input')
		titleInput.placeholder = 'Step title...'
		titleInput.value = step.title
		titleInput.addEventListener('input', (e) => {
			step.title = e.target.value
		})

		// Description Textarea
		const descTextarea = document.createElement('textarea')
		descTextarea.classList.add('process-desc-input')
		descTextarea.placeholder = 'Step description...'
		descTextarea.value = step.description
		descTextarea.rows = 3
		descTextarea.addEventListener('input', (e) => {
			step.description = e.target.value
		})

		// Delete Button
		const deleteButton = document.createElement('button')
		deleteButton.classList.add('process-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete step'
		deleteButton.addEventListener('click', () => {
			if (this.data.steps.length > 1) {
				this.data.steps.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		const header = document.createElement('div')
		header.classList.add('process-step-header')
		const stepNumber = document.createElement('span')
		stepNumber.textContent = `Step ${index + 1}`
		stepNumber.classList.add('process-step-number')
		header.appendChild(stepNumber)
		header.appendChild(deleteButton)

		stepDiv.appendChild(header)
		stepDiv.appendChild(titleInput)
		stepDiv.appendChild(descTextarea)

		return stepDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('process-readonly')
		container.classList.add(`process-${this.data.layout}`)

		this.data.steps.forEach((step, index) => {
			const stepElement = this.createReadOnlyStep(step, index)
			container.appendChild(stepElement)

			// Add arrow between steps (except after last step)
			if (index < this.data.steps.length - 1) {
				const arrow = document.createElement('div')
				arrow.classList.add('process-arrow')
				arrow.innerHTML = this.data.layout === 'horizontal' 
					? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
					: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
				container.appendChild(arrow)
			}
		})

		this.wrapper.appendChild(container)
	}

	createReadOnlyStep(step, index) {
		const stepDiv = document.createElement('div')
		stepDiv.classList.add('process-step')

		if (this.data.showNumbers) {
			const number = document.createElement('div')
			number.classList.add('process-step-number')
			number.textContent = index + 1
			stepDiv.appendChild(number)
		}

		const content = document.createElement('div')
		content.classList.add('process-step-content')

		const title = document.createElement('div')
		title.classList.add('process-step-title')
		title.textContent = step.title

		const description = document.createElement('div')
		description.classList.add('process-step-description')
		description.innerHTML = this.formatContent(step.description)

		content.appendChild(title)
		content.appendChild(description)
		stepDiv.appendChild(content)

		return stepDiv
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
		if (!savedData.steps || savedData.steps.length === 0) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			steps: {},
			layout: {},
			showNumbers: {},
		}
	}
}
