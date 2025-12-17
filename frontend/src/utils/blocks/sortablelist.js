export class SortableList {
	static get toolbox() {
		return {
			title: 'Sortable List',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><rect x="60" y="40" width="220" height="40" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><rect x="60" y="100" width="220" height="40" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><rect x="60" y="160" width="220" height="40" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><path d="M35 50 L35 70 M30 60 L40 60" stroke="currentColor" stroke-width="6"/><path d="M35 110 L35 130 M30 120 L40 120" stroke="currentColor" stroke-width="6"/><path d="M35 170 L35 190 M30 180 L40 180" stroke="currentColor" stroke-width="6"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			question: data.question || 'Arrange the following items in the correct order:',
			items: data.items || [
				{ text: 'Item 1', order: 1 },
				{ text: 'Item 2', order: 2 },
				{ text: 'Item 3', order: 3 },
			],
			showFeedback: data.showFeedback !== false,
			feedbackCorrect: data.feedbackCorrect || 'Correct! Well done.',
			feedbackIncorrect: data.feedbackIncorrect || 'Not quite right. Try again!',
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('sortable-list-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('sortable-list-editor')

		// Question Input
		const questionLabel = document.createElement('label')
		questionLabel.textContent = 'Question/Instruction:'
		questionLabel.classList.add('sortable-list-label')

		const questionInput = document.createElement('textarea')
		questionInput.classList.add('sortable-list-question-input')
		questionInput.placeholder = 'Enter your question or instruction...'
		questionInput.value = this.data.question
		questionInput.rows = 2
		questionInput.addEventListener('input', (e) => {
			this.data.question = e.target.value
		})

		// Items List
		const itemsLabel = document.createElement('label')
		itemsLabel.textContent = 'Items (in correct order):'
		itemsLabel.classList.add('sortable-list-label')

		const itemsContainer = document.createElement('div')
		itemsContainer.classList.add('sortable-list-items')

		this.data.items.forEach((item, index) => {
			const itemElement = this.createItemEditor(item, index)
			itemsContainer.appendChild(itemElement)
		})

		// Add Item Button
		const addButton = document.createElement('button')
		addButton.classList.add('sortable-list-add-button')
		addButton.textContent = '+ Add Item'
		addButton.addEventListener('click', () => {
			this.data.items.push({
				text: `Item ${this.data.items.length + 1}`,
				order: this.data.items.length + 1,
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})

		// Feedback Settings
		const feedbackContainer = document.createElement('div')
		feedbackContainer.classList.add('sortable-list-feedback')

		const feedbackToggle = document.createElement('label')
		feedbackToggle.innerHTML = `
			<input type="checkbox" ${this.data.showFeedback ? 'checked' : ''} />
			<span>Show feedback</span>
		`
		feedbackToggle.querySelector('input').addEventListener('change', (e) => {
			this.data.showFeedback = e.target.checked
			feedbackInputs.style.display = e.target.checked ? 'block' : 'none'
		})

		const feedbackInputs = document.createElement('div')
		feedbackInputs.style.display = this.data.showFeedback ? 'block' : 'none'
		feedbackInputs.innerHTML = `
			<label class="sortable-list-label">Correct feedback:</label>
			<input type="text" class="sortable-list-feedback-input" value="${this.data.feedbackCorrect}" data-field="feedbackCorrect" />
			<label class="sortable-list-label">Incorrect feedback:</label>
			<input type="text" class="sortable-list-feedback-input" value="${this.data.feedbackIncorrect}" data-field="feedbackIncorrect" />
		`
		feedbackInputs.querySelectorAll('input').forEach((input) => {
			input.addEventListener('input', (e) => {
				this.data[e.target.dataset.field] = e.target.value
			})
		})

		feedbackContainer.appendChild(feedbackToggle)
		feedbackContainer.appendChild(feedbackInputs)

		container.appendChild(questionLabel)
		container.appendChild(questionInput)
		container.appendChild(itemsLabel)
		container.appendChild(itemsContainer)
		container.appendChild(addButton)
		container.appendChild(feedbackContainer)

		this.wrapper.appendChild(container)
	}

	createItemEditor(item, index) {
		const itemDiv = document.createElement('div')
		itemDiv.classList.add('sortable-list-item-editor')

		const orderSpan = document.createElement('span')
		orderSpan.classList.add('sortable-list-order')
		orderSpan.textContent = index + 1

		const itemInput = document.createElement('input')
		itemInput.type = 'text'
		itemInput.classList.add('sortable-list-item-input')
		itemInput.placeholder = 'Item text...'
		itemInput.value = item.text
		itemInput.addEventListener('input', (e) => {
			item.text = e.target.value
		})

		const deleteButton = document.createElement('button')
		deleteButton.classList.add('sortable-list-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete item'
		deleteButton.addEventListener('click', () => {
			if (this.data.items.length > 2) {
				this.data.items.splice(index, 1)
				this.data.items.forEach((item, i) => {
					item.order = i + 1
				})
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		itemDiv.appendChild(orderSpan)
		itemDiv.appendChild(itemInput)
		itemDiv.appendChild(deleteButton)

		return itemDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('sortable-list-readonly')

		// Question
		const question = document.createElement('div')
		question.classList.add('sortable-list-question')
		question.textContent = this.data.question

		// Shuffled items for user to sort
		const itemsContainer = document.createElement('div')
		itemsContainer.classList.add('sortable-list-items-container')
		itemsContainer.dataset.correctOrder = JSON.stringify(
			this.data.items.map((item) => item.order)
		)

		// Shuffle items
		const shuffledItems = [...this.data.items]
			.map((item, index) => ({ ...item, currentIndex: index }))
			.sort(() => Math.random() - 0.5)

		shuffledItems.forEach((item, index) => {
			const itemElement = this.createReadOnlyItem(item, index)
			itemsContainer.appendChild(itemElement)
		})

		// Check Answer Button
		const checkButton = document.createElement('button')
		checkButton.classList.add('sortable-list-check-button')
		checkButton.textContent = 'Check Answer'
		checkButton.addEventListener('click', () => {
			this.checkAnswer(itemsContainer, feedbackDiv)
		})

		// Reset Button
		const resetButton = document.createElement('button')
		resetButton.classList.add('sortable-list-reset-button')
		resetButton.textContent = 'Reset'
		resetButton.addEventListener('click', () => {
			this.wrapper.innerHTML = ''
			this.renderReadOnly()
		})

		const buttonsContainer = document.createElement('div')
		buttonsContainer.classList.add('sortable-list-buttons')
		buttonsContainer.appendChild(checkButton)
		buttonsContainer.appendChild(resetButton)

		// Feedback
		const feedbackDiv = document.createElement('div')
		feedbackDiv.classList.add('sortable-list-feedback-message')
		feedbackDiv.style.display = 'none'

		container.appendChild(question)
		container.appendChild(itemsContainer)
		container.appendChild(buttonsContainer)
		if (this.data.showFeedback) {
			container.appendChild(feedbackDiv)
		}

		this.wrapper.appendChild(container)
		this.initializeDragAndDrop(itemsContainer)
	}

	createReadOnlyItem(item, index) {
		const itemDiv = document.createElement('div')
		itemDiv.classList.add('sortable-list-item')
		itemDiv.draggable = true
		itemDiv.dataset.order = item.order

		const dragHandle = document.createElement('span')
		dragHandle.classList.add('sortable-list-drag-handle')
		dragHandle.innerHTML = '⋮⋮'

		const itemText = document.createElement('span')
		itemText.classList.add('sortable-list-item-text')
		itemText.textContent = item.text

		itemDiv.appendChild(dragHandle)
		itemDiv.appendChild(itemText)

		return itemDiv
	}

	initializeDragAndDrop(container) {
		let draggedElement = null

		container.addEventListener('dragstart', (e) => {
			if (e.target.classList.contains('sortable-list-item')) {
				draggedElement = e.target
				e.target.classList.add('dragging')
			}
		})

		container.addEventListener('dragend', (e) => {
			if (e.target.classList.contains('sortable-list-item')) {
				e.target.classList.remove('dragging')
			}
		})

		container.addEventListener('dragover', (e) => {
			e.preventDefault()
			const afterElement = this.getDragAfterElement(container, e.clientY)
			if (afterElement == null) {
				container.appendChild(draggedElement)
			} else {
				container.insertBefore(draggedElement, afterElement)
			}
		})
	}

	getDragAfterElement(container, y) {
		const draggableElements = [
			...container.querySelectorAll('.sortable-list-item:not(.dragging)'),
		]

		return draggableElements.reduce(
			(closest, child) => {
				const box = child.getBoundingClientRect()
				const offset = y - box.top - box.height / 2
				if (offset < 0 && offset > closest.offset) {
					return { offset: offset, element: child }
				} else {
					return closest
				}
			},
			{ offset: Number.NEGATIVE_INFINITY }
		).element
	}

	checkAnswer(container, feedbackDiv) {
		const items = container.querySelectorAll('.sortable-list-item')
		const userOrder = Array.from(items).map((item) => parseInt(item.dataset.order))
		const correctOrder = JSON.parse(container.dataset.correctOrder)

		const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder)

		// Visual feedback
		items.forEach((item, index) => {
			item.classList.remove('correct', 'incorrect')
			if (parseInt(item.dataset.order) === correctOrder[index]) {
				item.classList.add('correct')
			} else {
				item.classList.add('incorrect')
			}
		})

		// Text feedback
		if (this.data.showFeedback && feedbackDiv) {
			feedbackDiv.style.display = 'block'
			feedbackDiv.className = 'sortable-list-feedback-message'
			if (isCorrect) {
				feedbackDiv.classList.add('correct')
				feedbackDiv.textContent = this.data.feedbackCorrect
			} else {
				feedbackDiv.classList.add('incorrect')
				feedbackDiv.textContent = this.data.feedbackIncorrect
			}
		}
	}

	save() {
		return this.data
	}

	validate(savedData) {
		if (!savedData.question || !savedData.items || savedData.items.length < 2) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			question: {},
			items: {},
			showFeedback: {},
			feedbackCorrect: {},
			feedbackIncorrect: {},
		}
	}
}
