export class FlipCards {
	static get toolbox() {
		return {
			title: 'Flip Cards',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><rect x="20" y="40" width="120" height="160" rx="8" stroke="currentColor" stroke-width="12" fill="none"/><rect x="160" y="40" width="120" height="160" rx="8" stroke="currentColor" stroke-width="12" fill="currentColor" fill-opacity="0.1"/><path d="M80 100 L80 140" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M60 120 L100 120" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			cards: data.cards || [
				{
					front: 'Front of card 1',
					back: 'Back of card 1',
				},
				{
					front: 'Front of card 2',
					back: 'Back of card 2',
				},
			],
			columns: data.columns || 2,
			flipTrigger: data.flipTrigger || 'click',
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('flipcards-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('flipcards-editor')

		// Settings
		const settingsContainer = document.createElement('div')
		settingsContainer.classList.add('flipcards-settings')
		
		// Columns selector
		const columnsLabel = document.createElement('label')
		columnsLabel.innerHTML = `
			<span>Columns:</span>
			<select>
				<option value="2" ${this.data.columns === 2 ? 'selected' : ''}>2</option>
				<option value="3" ${this.data.columns === 3 ? 'selected' : ''}>3</option>
				<option value="4" ${this.data.columns === 4 ? 'selected' : ''}>4</option>
			</select>
		`
		columnsLabel.querySelector('select').addEventListener('change', (e) => {
			this.data.columns = parseInt(e.target.value)
		})

		// Flip trigger selector
		const triggerLabel = document.createElement('label')
		triggerLabel.innerHTML = `
			<span>Flip on:</span>
			<select>
				<option value="click" ${this.data.flipTrigger === 'click' ? 'selected' : ''}>Click</option>
				<option value="hover" ${this.data.flipTrigger === 'hover' ? 'selected' : ''}>Hover</option>
			</select>
		`
		triggerLabel.querySelector('select').addEventListener('change', (e) => {
			this.data.flipTrigger = e.target.value
		})

		settingsContainer.appendChild(columnsLabel)
		settingsContainer.appendChild(triggerLabel)
		container.appendChild(settingsContainer)

		// Cards
		const cardsContainer = document.createElement('div')
		cardsContainer.classList.add('flipcards-items')

		this.data.cards.forEach((card, index) => {
			const cardElement = this.createCardEditor(card, index)
			cardsContainer.appendChild(cardElement)
		})

		container.appendChild(cardsContainer)

		// Add Card Button
		const addButton = document.createElement('button')
		addButton.classList.add('flipcards-add-button')
		addButton.textContent = '+ Add Card'
		addButton.addEventListener('click', () => {
			this.data.cards.push({
				front: `Front of card ${this.data.cards.length + 1}`,
				back: `Back of card ${this.data.cards.length + 1}`,
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createCardEditor(card, index) {
		const cardDiv = document.createElement('div')
		cardDiv.classList.add('flipcard-item-editor')

		// Front Input
		const frontLabel = document.createElement('label')
		frontLabel.textContent = 'Front:'
		const frontTextarea = document.createElement('textarea')
		frontTextarea.classList.add('flipcard-front-input')
		frontTextarea.placeholder = 'Front content...'
		frontTextarea.value = card.front
		frontTextarea.rows = 3
		frontTextarea.addEventListener('input', (e) => {
			card.front = e.target.value
		})

		// Back Input
		const backLabel = document.createElement('label')
		backLabel.textContent = 'Back:'
		const backTextarea = document.createElement('textarea')
		backTextarea.classList.add('flipcard-back-input')
		backTextarea.placeholder = 'Back content...'
		backTextarea.value = card.back
		backTextarea.rows = 3
		backTextarea.addEventListener('input', (e) => {
			card.back = e.target.value
		})

		// Delete Button
		const deleteButton = document.createElement('button')
		deleteButton.classList.add('flipcard-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete card'
		deleteButton.addEventListener('click', () => {
			if (this.data.cards.length > 1) {
				this.data.cards.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		const header = document.createElement('div')
		header.classList.add('flipcard-item-header')
		const headerTitle = document.createElement('span')
		headerTitle.textContent = `Card ${index + 1}`
		header.appendChild(headerTitle)
		header.appendChild(deleteButton)

		cardDiv.appendChild(header)
		cardDiv.appendChild(frontLabel)
		cardDiv.appendChild(frontTextarea)
		cardDiv.appendChild(backLabel)
		cardDiv.appendChild(backTextarea)

		return cardDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('flipcards-readonly')
		container.style.gridTemplateColumns = `repeat(${this.data.columns}, 1fr)`

		this.data.cards.forEach((card, index) => {
			const cardElement = this.createReadOnlyCard(card, index)
			container.appendChild(cardElement)
		})

		this.wrapper.appendChild(container)
	}

	createReadOnlyCard(card, index) {
		const cardContainer = document.createElement('div')
		cardContainer.classList.add('flipcard-container')

		const cardInner = document.createElement('div')
		cardInner.classList.add('flipcard-inner')

		const cardFront = document.createElement('div')
		cardFront.classList.add('flipcard-face', 'flipcard-front')
		cardFront.innerHTML = `<div class="flipcard-content">${this.formatContent(card.front)}</div>`

		const cardBack = document.createElement('div')
		cardBack.classList.add('flipcard-face', 'flipcard-back')
		cardBack.innerHTML = `<div class="flipcard-content">${this.formatContent(card.back)}</div>`

		cardInner.appendChild(cardFront)
		cardInner.appendChild(cardBack)
		cardContainer.appendChild(cardInner)

		if (this.data.flipTrigger === 'click') {
			cardContainer.addEventListener('click', () => {
				cardInner.classList.toggle('flipped')
			})
		} else {
			cardContainer.addEventListener('mouseenter', () => {
				cardInner.classList.add('flipped')
			})
			cardContainer.addEventListener('mouseleave', () => {
				cardInner.classList.remove('flipped')
			})
		}

		return cardContainer
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
		if (!savedData.cards || savedData.cards.length === 0) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			cards: {},
			columns: {},
			flipTrigger: {},
		}
	}
}
