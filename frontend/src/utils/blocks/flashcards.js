export class Flashcards {
	static get toolbox() {
		return {
			title: 'Flashcards',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><rect x="40" y="60" width="200" height="140" rx="12" stroke="currentColor" stroke-width="10" fill="none"/><rect x="60" y="80" width="200" height="140" rx="12" stroke="currentColor" stroke-width="10" fill="currentColor" fill-opacity="0.1"/><line x1="150" y1="140" x2="150" y2="170" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="135" y1="155" x2="165" y2="155" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			title: data.title || 'Flashcard Set',
			cards: data.cards || [
				{
					front: 'Question or term',
					back: 'Answer or definition',
				},
				{
					front: 'Another question',
					back: 'Another answer',
				},
			],
			autoPlay: data.autoPlay || false,
			showProgress: data.showProgress !== false,
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('flashcards-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('flashcards-editor')

		// Title Input
		const titleLabel = document.createElement('label')
		titleLabel.textContent = 'Flashcard Set Title:'
		titleLabel.classList.add('flashcards-label')

		const titleInput = document.createElement('input')
		titleInput.type = 'text'
		titleInput.classList.add('flashcards-title-input')
		titleInput.placeholder = 'Enter title...'
		titleInput.value = this.data.title
		titleInput.addEventListener('input', (e) => {
			this.data.title = e.target.value
		})

		// Settings
		const settingsContainer = document.createElement('div')
		settingsContainer.classList.add('flashcards-settings')

		const autoPlayToggle = document.createElement('label')
		autoPlayToggle.innerHTML = `
			<input type="checkbox" ${this.data.autoPlay ? 'checked' : ''} />
			<span>Auto-advance cards</span>
		`
		autoPlayToggle.querySelector('input').addEventListener('change', (e) => {
			this.data.autoPlay = e.target.checked
		})

		const progressToggle = document.createElement('label')
		progressToggle.innerHTML = `
			<input type="checkbox" ${this.data.showProgress ? 'checked' : ''} />
			<span>Show progress indicator</span>
		`
		progressToggle.querySelector('input').addEventListener('change', (e) => {
			this.data.showProgress = e.target.checked
		})

		settingsContainer.appendChild(autoPlayToggle)
		settingsContainer.appendChild(progressToggle)

		// Cards
		const cardsLabel = document.createElement('label')
		cardsLabel.textContent = 'Cards:'
		cardsLabel.classList.add('flashcards-label')

		const cardsContainer = document.createElement('div')
		cardsContainer.classList.add('flashcards-cards')

		this.data.cards.forEach((card, index) => {
			const cardElement = this.createCardEditor(card, index)
			cardsContainer.appendChild(cardElement)
		})

		// Add Card Button
		const addButton = document.createElement('button')
		addButton.classList.add('flashcards-add-button')
		addButton.textContent = '+ Add Card'
		addButton.addEventListener('click', () => {
			this.data.cards.push({
				front: 'Question or term',
				back: 'Answer or definition',
			})
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})

		container.appendChild(titleLabel)
		container.appendChild(titleInput)
		container.appendChild(settingsContainer)
		container.appendChild(cardsLabel)
		container.appendChild(cardsContainer)
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createCardEditor(card, index) {
		const cardDiv = document.createElement('div')
		cardDiv.classList.add('flashcard-editor')

		const header = document.createElement('div')
		header.classList.add('flashcard-editor-header')

		const cardNumber = document.createElement('span')
		cardNumber.textContent = `Card ${index + 1}`
		cardNumber.classList.add('flashcard-number')

		const deleteButton = document.createElement('button')
		deleteButton.classList.add('flashcard-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete card'
		deleteButton.addEventListener('click', () => {
			if (this.data.cards.length > 1) {
				this.data.cards.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		header.appendChild(cardNumber)
		header.appendChild(deleteButton)

		// Front
		const frontLabel = document.createElement('label')
		frontLabel.textContent = 'Front (Question/Term):'
		const frontTextarea = document.createElement('textarea')
		frontTextarea.classList.add('flashcard-input')
		frontTextarea.placeholder = 'Enter question or term...'
		frontTextarea.value = card.front
		frontTextarea.rows = 3
		frontTextarea.addEventListener('input', (e) => {
			card.front = e.target.value
		})

		// Back
		const backLabel = document.createElement('label')
		backLabel.textContent = 'Back (Answer/Definition):'
		const backTextarea = document.createElement('textarea')
		backTextarea.classList.add('flashcard-input')
		backTextarea.placeholder = 'Enter answer or definition...'
		backTextarea.value = card.back
		backTextarea.rows = 3
		backTextarea.addEventListener('input', (e) => {
			card.back = e.target.value
		})

		cardDiv.appendChild(header)
		cardDiv.appendChild(frontLabel)
		cardDiv.appendChild(frontTextarea)
		cardDiv.appendChild(backLabel)
		cardDiv.appendChild(backTextarea)

		return cardDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('flashcards-readonly')

		// Title
		const title = document.createElement('h3')
		title.classList.add('flashcards-title')
		title.textContent = this.data.title

		// Progress
		let progressDiv = null
		if (this.data.showProgress) {
			progressDiv = document.createElement('div')
			progressDiv.classList.add('flashcards-progress')
			progressDiv.innerHTML = `<span class="current">1</span> / <span class="total">${this.data.cards.length}</span>`
		}

		// Card Display
		const cardDisplay = document.createElement('div')
		cardDisplay.classList.add('flashcard-display')

		const cardInner = document.createElement('div')
		cardInner.classList.add('flashcard-inner')

		const cardFront = document.createElement('div')
		cardFront.classList.add('flashcard-face', 'flashcard-front')
		cardFront.innerHTML = `<div class="flashcard-content">${this.formatContent(
			this.data.cards[0].front
		)}</div>`

		const cardBack = document.createElement('div')
		cardBack.classList.add('flashcard-face', 'flashcard-back')
		cardBack.innerHTML = `<div class="flashcard-content">${this.formatContent(
			this.data.cards[0].back
		)}</div>`

		cardInner.appendChild(cardFront)
		cardInner.appendChild(cardBack)
		cardDisplay.appendChild(cardInner)

		// Flip hint
		const flipHint = document.createElement('div')
		flipHint.classList.add('flashcard-flip-hint')
		flipHint.textContent = 'Click to flip'

		// Navigation
		const navigation = document.createElement('div')
		navigation.classList.add('flashcards-navigation')

		const prevButton = document.createElement('button')
		prevButton.classList.add('flashcard-nav-button', 'prev')
		prevButton.innerHTML = '←'
		prevButton.disabled = true

		const nextButton = document.createElement('button')
		nextButton.classList.add('flashcard-nav-button', 'next')
		nextButton.innerHTML = '→'
		nextButton.disabled = this.data.cards.length === 1

		const shuffleButton = document.createElement('button')
		shuffleButton.classList.add('flashcard-shuffle-button')
		shuffleButton.textContent = 'Shuffle'

		navigation.appendChild(prevButton)
		navigation.appendChild(shuffleButton)
		navigation.appendChild(nextButton)

		container.appendChild(title)
		if (progressDiv) container.appendChild(progressDiv)
		container.appendChild(cardDisplay)
		container.appendChild(flipHint)
		container.appendChild(navigation)

		this.wrapper.appendChild(container)

		// Initialize interaction
		this.initializeFlashcards(cardInner, prevButton, nextButton, shuffleButton, progressDiv)
	}

	initializeFlashcards(cardInner, prevButton, nextButton, shuffleButton, progressDiv) {
		let currentIndex = 0
		let cards = [...this.data.cards]
		let isFlipped = false

		const updateCard = () => {
			const card = cards[currentIndex]
			const frontFace = cardInner.querySelector('.flashcard-front .flashcard-content')
			const backFace = cardInner.querySelector('.flashcard-back .flashcard-content')

			frontFace.innerHTML = this.formatContent(card.front)
			backFace.innerHTML = this.formatContent(card.back)

			if (isFlipped) {
				cardInner.classList.remove('flipped')
				isFlipped = false
			}

			prevButton.disabled = currentIndex === 0
			nextButton.disabled = currentIndex === cards.length - 1

			if (progressDiv) {
				progressDiv.querySelector('.current').textContent = currentIndex + 1
			}
		}

		cardInner.addEventListener('click', () => {
			cardInner.classList.toggle('flipped')
			isFlipped = !isFlipped
		})

		prevButton.addEventListener('click', () => {
			if (currentIndex > 0) {
				currentIndex--
				updateCard()
			}
		})

		nextButton.addEventListener('click', () => {
			if (currentIndex < cards.length - 1) {
				currentIndex++
				updateCard()
			}
		})

		shuffleButton.addEventListener('click', () => {
			cards = cards.sort(() => Math.random() - 0.5)
			currentIndex = 0
			updateCard()
		})
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
			title: {},
			cards: {},
			autoPlay: {},
			showProgress: {},
		}
	}
}
