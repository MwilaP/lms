export class MatchingPairs {
	static get toolbox() {
		return {
			title: 'Matching Pairs',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><rect x="40" y="40" width="100" height="50" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><rect x="200" y="40" width="100" height="50" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><rect x="40" y="120" width="100" height="50" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><rect x="200" y="120" width="100" height="50" rx="6" stroke="currentColor" stroke-width="10" fill="none"/><path d="M140 65 L200 65" stroke="currentColor" stroke-width="6" stroke-dasharray="10,5"/><path d="M140 145 L200 145" stroke="currentColor" stroke-width="6" stroke-dasharray="10,5"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			question: data.question || 'Match the items on the left with their corresponding pairs on the right:',
			pairs: data.pairs || [
				{ left: 'Item A', right: 'Match A' },
				{ left: 'Item B', right: 'Match B' },
				{ left: 'Item C', right: 'Match C' },
			],
			showFeedback: data.showFeedback !== false,
			feedbackCorrect: data.feedbackCorrect || 'Perfect! All matches are correct.',
			feedbackIncorrect: data.feedbackIncorrect || 'Some matches are incorrect. Try again!',
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('matching-pairs-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('matching-pairs-editor')

		// Question Input
		const questionLabel = document.createElement('label')
		questionLabel.textContent = 'Question/Instruction:'
		questionLabel.classList.add('matching-pairs-label')

		const questionInput = document.createElement('textarea')
		questionInput.classList.add('matching-pairs-question-input')
		questionInput.placeholder = 'Enter your question or instruction...'
		questionInput.value = this.data.question
		questionInput.rows = 2
		questionInput.addEventListener('input', (e) => {
			this.data.question = e.target.value
		})

		// Pairs
		const pairsLabel = document.createElement('label')
		pairsLabel.textContent = 'Matching Pairs:'
		pairsLabel.classList.add('matching-pairs-label')

		const pairsContainer = document.createElement('div')
		pairsContainer.classList.add('matching-pairs-items')

		this.data.pairs.forEach((pair, index) => {
			const pairElement = this.createPairEditor(pair, index)
			pairsContainer.appendChild(pairElement)
		})

		// Add Pair Button
		const addButton = document.createElement('button')
		addButton.classList.add('matching-pairs-add-button')
		addButton.textContent = '+ Add Pair'
		addButton.addEventListener('click', () => {
			this.data.pairs.push({
				left: `Item ${this.data.pairs.length + 1}`,
				right: `Match ${this.data.pairs.length + 1}`,
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})

		// Feedback Settings
		const feedbackContainer = document.createElement('div')
		feedbackContainer.classList.add('matching-pairs-feedback')

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
			<label class="matching-pairs-label">Correct feedback:</label>
			<input type="text" class="matching-pairs-feedback-input" value="${this.data.feedbackCorrect}" data-field="feedbackCorrect" />
			<label class="matching-pairs-label">Incorrect feedback:</label>
			<input type="text" class="matching-pairs-feedback-input" value="${this.data.feedbackIncorrect}" data-field="feedbackIncorrect" />
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
		container.appendChild(pairsLabel)
		container.appendChild(pairsContainer)
		container.appendChild(addButton)
		container.appendChild(feedbackContainer)

		this.wrapper.appendChild(container)
	}

	createPairEditor(pair, index) {
		const pairDiv = document.createElement('div')
		pairDiv.classList.add('matching-pair-editor')

		const header = document.createElement('div')
		header.classList.add('matching-pair-header')

		const pairNumber = document.createElement('span')
		pairNumber.textContent = `Pair ${index + 1}`
		pairNumber.classList.add('matching-pair-number')

		const deleteButton = document.createElement('button')
		deleteButton.classList.add('matching-pair-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete pair'
		deleteButton.addEventListener('click', () => {
			if (this.data.pairs.length > 2) {
				this.data.pairs.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		header.appendChild(pairNumber)
		header.appendChild(deleteButton)

		const leftInput = document.createElement('input')
		leftInput.type = 'text'
		leftInput.classList.add('matching-pair-input')
		leftInput.placeholder = 'Left item...'
		leftInput.value = pair.left
		leftInput.addEventListener('input', (e) => {
			pair.left = e.target.value
		})

		const rightInput = document.createElement('input')
		rightInput.type = 'text'
		rightInput.classList.add('matching-pair-input')
		rightInput.placeholder = 'Right match...'
		rightInput.value = pair.right
		rightInput.addEventListener('input', (e) => {
			pair.right = e.target.value
		})

		const inputsContainer = document.createElement('div')
		inputsContainer.classList.add('matching-pair-inputs')
		inputsContainer.appendChild(leftInput)
		inputsContainer.appendChild(rightInput)

		pairDiv.appendChild(header)
		pairDiv.appendChild(inputsContainer)

		return pairDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('matching-pairs-readonly')

		// Question
		const question = document.createElement('div')
		question.classList.add('matching-pairs-question')
		question.textContent = this.data.question

		// Columns
		const columnsContainer = document.createElement('div')
		columnsContainer.classList.add('matching-pairs-columns')

		// Left column
		const leftColumn = document.createElement('div')
		leftColumn.classList.add('matching-pairs-column', 'left-column')

		// Right column (shuffled)
		const rightColumn = document.createElement('div')
		rightColumn.classList.add('matching-pairs-column', 'right-column')

		const shuffledRightItems = [...this.data.pairs]
			.map((pair, index) => ({ ...pair, originalIndex: index }))
			.sort(() => Math.random() - 0.5)

		this.data.pairs.forEach((pair, index) => {
			const leftItem = document.createElement('div')
			leftItem.classList.add('matching-item', 'left-item')
			leftItem.textContent = pair.left
			leftItem.dataset.index = index
			leftColumn.appendChild(leftItem)
		})

		shuffledRightItems.forEach((pair, index) => {
			const rightItem = document.createElement('div')
			rightItem.classList.add('matching-item', 'right-item')
			rightItem.textContent = pair.right
			rightItem.dataset.index = pair.originalIndex
			rightColumn.appendChild(rightItem)
		})

		columnsContainer.appendChild(leftColumn)
		columnsContainer.appendChild(rightColumn)

		// Canvas for drawing lines
		const canvas = document.createElement('canvas')
		canvas.classList.add('matching-pairs-canvas')
		columnsContainer.appendChild(canvas)

		// Buttons
		const buttonsContainer = document.createElement('div')
		buttonsContainer.classList.add('matching-pairs-buttons')

		const checkButton = document.createElement('button')
		checkButton.classList.add('matching-pairs-check-button')
		checkButton.textContent = 'Check Answer'

		const resetButton = document.createElement('button')
		resetButton.classList.add('matching-pairs-reset-button')
		resetButton.textContent = 'Reset'

		buttonsContainer.appendChild(checkButton)
		buttonsContainer.appendChild(resetButton)

		// Feedback
		const feedbackDiv = document.createElement('div')
		feedbackDiv.classList.add('matching-pairs-feedback-message')
		feedbackDiv.style.display = 'none'

		container.appendChild(question)
		container.appendChild(columnsContainer)
		container.appendChild(buttonsContainer)
		if (this.data.showFeedback) {
			container.appendChild(feedbackDiv)
		}

		this.wrapper.appendChild(container)

		// Initialize interaction
		setTimeout(() => {
			this.initializeMatching(leftColumn, rightColumn, canvas, checkButton, resetButton, feedbackDiv)
		}, 100)
	}

	initializeMatching(leftColumn, rightColumn, canvas, checkButton, resetButton, feedbackDiv) {
		const matches = new Map()
		let selectedLeft = null

		const resizeCanvas = () => {
			const container = canvas.parentElement
			canvas.width = container.offsetWidth
			canvas.height = container.offsetHeight
			this.drawLines(canvas, matches)
		}

		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)

		const leftItems = leftColumn.querySelectorAll('.left-item')
		const rightItems = rightColumn.querySelectorAll('.right-item')

		leftItems.forEach((item) => {
			item.addEventListener('click', () => {
				if (selectedLeft === item) {
					selectedLeft.classList.remove('selected')
					selectedLeft = null
				} else {
					leftItems.forEach((i) => i.classList.remove('selected'))
					item.classList.add('selected')
					selectedLeft = item
				}
			})
		})

		rightItems.forEach((item) => {
			item.addEventListener('click', () => {
				if (selectedLeft) {
					const leftIndex = selectedLeft.dataset.index
					const rightIndex = item.dataset.index

					matches.set(leftIndex, rightIndex)
					selectedLeft.classList.remove('selected')
					selectedLeft.classList.add('matched')
					item.classList.add('matched')
					selectedLeft = null

					this.drawLines(canvas, matches)
				}
			})
		})

		checkButton.addEventListener('click', () => {
			this.checkMatches(matches, leftItems, rightItems, feedbackDiv)
		})

		resetButton.addEventListener('click', () => {
			this.wrapper.innerHTML = ''
			this.renderReadOnly()
		})
	}

	drawLines(canvas, matches) {
		const ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		const leftColumn = canvas.parentElement.querySelector('.left-column')
		const rightColumn = canvas.parentElement.querySelector('.right-column')

		matches.forEach((rightIndex, leftIndex) => {
			const leftItem = leftColumn.querySelector(`[data-index="${leftIndex}"]`)
			const rightItem = rightColumn.querySelector(`[data-index="${rightIndex}"]`)

			if (leftItem && rightItem) {
				const leftRect = leftItem.getBoundingClientRect()
				const rightRect = rightItem.getBoundingClientRect()
				const canvasRect = canvas.getBoundingClientRect()

				const x1 = leftRect.right - canvasRect.left
				const y1 = leftRect.top + leftRect.height / 2 - canvasRect.top
				const x2 = rightRect.left - canvasRect.left
				const y2 = rightRect.top + rightRect.height / 2 - canvasRect.top

				ctx.beginPath()
				ctx.moveTo(x1, y1)
				ctx.lineTo(x2, y2)
				ctx.strokeStyle = '#2563eb'
				ctx.lineWidth = 2
				ctx.stroke()
			}
		})
	}

	checkMatches(matches, leftItems, rightItems, feedbackDiv) {
		let allCorrect = true

		leftItems.forEach((item) => {
			item.classList.remove('correct', 'incorrect')
		})
		rightItems.forEach((item) => {
			item.classList.remove('correct', 'incorrect')
		})

		matches.forEach((rightIndex, leftIndex) => {
			const isCorrect = leftIndex === rightIndex

			const leftItem = Array.from(leftItems).find((item) => item.dataset.index === leftIndex)
			const rightItem = Array.from(rightItems).find((item) => item.dataset.index === rightIndex)

			if (isCorrect) {
				leftItem.classList.add('correct')
				rightItem.classList.add('correct')
			} else {
				leftItem.classList.add('incorrect')
				rightItem.classList.add('incorrect')
				allCorrect = false
			}
		})

		if (matches.size < this.data.pairs.length) {
			allCorrect = false
		}

		if (this.data.showFeedback && feedbackDiv) {
			feedbackDiv.style.display = 'block'
			feedbackDiv.className = 'matching-pairs-feedback-message'
			if (allCorrect) {
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
		if (!savedData.question || !savedData.pairs || savedData.pairs.length < 2) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			question: {},
			pairs: {},
			showFeedback: {},
			feedbackCorrect: {},
			feedbackIncorrect: {},
		}
	}
}
