export class Scenario {
	static get toolbox() {
		return {
			title: 'Scenario/Branching',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 336 276" fill="none"><circle cx="168" cy="50" r="30" stroke="currentColor" stroke-width="10" fill="none"/><circle cx="100" cy="180" r="30" stroke="currentColor" stroke-width="10" fill="none"/><circle cx="236" cy="180" r="30" stroke="currentColor" stroke-width="10" fill="none"/><path d="M168 80 L168 120 M168 120 L100 150 M168 120 L236 150" stroke="currentColor" stroke-width="8"/></svg>',
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	constructor({ data, config, api, readOnly }) {
		this.api = api
		this.readOnly = readOnly
		this.data = {
			title: data.title || 'Interactive Scenario',
			startNode: data.startNode || 'node-1',
			nodes: data.nodes || {
				'node-1': {
					id: 'node-1',
					type: 'scenario',
					content: 'You are faced with a challenging situation. What do you do?',
					choices: [
						{ text: 'Option A', nextNode: 'node-2' },
						{ text: 'Option B', nextNode: 'node-3' },
					],
				},
				'node-2': {
					id: 'node-2',
					type: 'outcome',
					content: 'Good choice! This leads to a positive outcome.',
					feedback: 'Well done!',
				},
				'node-3': {
					id: 'node-3',
					type: 'outcome',
					content: 'This choice has consequences. Consider the alternatives.',
					feedback: 'Think about other options.',
				},
			},
		}
		this.wrapper = null
	}

	render() {
		this.wrapper = document.createElement('div')
		this.wrapper.classList.add('scenario-block')

		if (!this.readOnly) {
			this.renderEditor()
		} else {
			this.renderReadOnly()
		}

		return this.wrapper
	}

	renderEditor() {
		const container = document.createElement('div')
		container.classList.add('scenario-editor')

		// Title Input
		const titleLabel = document.createElement('label')
		titleLabel.textContent = 'Scenario Title:'
		titleLabel.classList.add('scenario-label')

		const titleInput = document.createElement('input')
		titleInput.type = 'text'
		titleInput.classList.add('scenario-title-input')
		titleInput.placeholder = 'Enter scenario title...'
		titleInput.value = this.data.title
		titleInput.addEventListener('input', (e) => {
			this.data.title = e.target.value
		})

		// Nodes List
		const nodesLabel = document.createElement('label')
		nodesLabel.textContent = 'Scenario Nodes:'
		nodesLabel.classList.add('scenario-label')

		const nodesContainer = document.createElement('div')
		nodesContainer.classList.add('scenario-nodes')

		Object.values(this.data.nodes).forEach((node) => {
			const nodeElement = this.createNodeEditor(node)
			nodesContainer.appendChild(nodeElement)
		})

		// Add Node Button
		const addButton = document.createElement('button')
		addButton.classList.add('scenario-add-button')
		addButton.textContent = '+ Add Node'
		addButton.addEventListener('click', () => {
			const newId = `node-${Object.keys(this.data.nodes).length + 1}`
			this.data.nodes[newId] = {
				id: newId,
				type: 'scenario',
				content: 'New scenario content...',
				choices: [{ text: 'Choice 1', nextNode: '' }],
			}
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})

		// Instructions
		const instructions = document.createElement('div')
		instructions.classList.add('scenario-instructions')
		instructions.innerHTML = `
			<strong>Instructions:</strong>
			<ul>
				<li><strong>Scenario nodes</strong> present choices to the user</li>
				<li><strong>Outcome nodes</strong> show results and end the path</li>
				<li>Link choices to other nodes by entering the node ID</li>
				<li>The first node (${this.data.startNode}) is the starting point</li>
			</ul>
		`

		container.appendChild(titleLabel)
		container.appendChild(titleInput)
		container.appendChild(instructions)
		container.appendChild(nodesLabel)
		container.appendChild(nodesContainer)
		container.appendChild(addButton)

		this.wrapper.appendChild(container)
	}

	createNodeEditor(node) {
		const nodeDiv = document.createElement('div')
		nodeDiv.classList.add('scenario-node-editor')

		// Header
		const header = document.createElement('div')
		header.classList.add('scenario-node-header')

		const nodeInfo = document.createElement('span')
		nodeInfo.innerHTML = `<strong>Node ID:</strong> ${node.id}`

		const typeSelect = document.createElement('select')
		typeSelect.classList.add('scenario-node-type')
		typeSelect.innerHTML = `
			<option value="scenario" ${node.type === 'scenario' ? 'selected' : ''}>Scenario</option>
			<option value="outcome" ${node.type === 'outcome' ? 'selected' : ''}>Outcome</option>
		`
		typeSelect.addEventListener('change', (e) => {
			node.type = e.target.value
			if (node.type === 'outcome') {
				node.choices = []
				node.feedback = node.feedback || 'End of path.'
			} else {
				node.choices = node.choices || [{ text: 'Choice 1', nextNode: '' }]
				delete node.feedback
			}
			this.wrapper.innerHTML = ''
			this.renderEditor()
		})

		const deleteButton = document.createElement('button')
		deleteButton.classList.add('scenario-node-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete node'
		deleteButton.addEventListener('click', () => {
			if (Object.keys(this.data.nodes).length > 1 && node.id !== this.data.startNode) {
				delete this.data.nodes[node.id]
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		header.appendChild(nodeInfo)
		header.appendChild(typeSelect)
		header.appendChild(deleteButton)

		// Content
		const contentLabel = document.createElement('label')
		contentLabel.textContent = 'Content:'
		const contentTextarea = document.createElement('textarea')
		contentTextarea.classList.add('scenario-node-content')
		contentTextarea.placeholder = 'Enter scenario content...'
		contentTextarea.value = node.content
		contentTextarea.rows = 3
		contentTextarea.addEventListener('input', (e) => {
			node.content = e.target.value
		})

		nodeDiv.appendChild(header)
		nodeDiv.appendChild(contentLabel)
		nodeDiv.appendChild(contentTextarea)

		// Choices (for scenario nodes)
		if (node.type === 'scenario') {
			const choicesLabel = document.createElement('label')
			choicesLabel.textContent = 'Choices:'

			const choicesContainer = document.createElement('div')
			choicesContainer.classList.add('scenario-choices')

			node.choices.forEach((choice, index) => {
				const choiceDiv = this.createChoiceEditor(choice, index, node)
				choicesContainer.appendChild(choiceDiv)
			})

			const addChoiceButton = document.createElement('button')
			addChoiceButton.classList.add('scenario-add-choice-button')
			addChoiceButton.textContent = '+ Add Choice'
			addChoiceButton.addEventListener('click', () => {
				node.choices.push({ text: `Choice ${node.choices.length + 1}`, nextNode: '' })
				this.wrapper.innerHTML = ''
				this.renderEditor()
			})

			nodeDiv.appendChild(choicesLabel)
			nodeDiv.appendChild(choicesContainer)
			nodeDiv.appendChild(addChoiceButton)
		}

		// Feedback (for outcome nodes)
		if (node.type === 'outcome') {
			const feedbackLabel = document.createElement('label')
			feedbackLabel.textContent = 'Feedback:'
			const feedbackInput = document.createElement('input')
			feedbackInput.type = 'text'
			feedbackInput.classList.add('scenario-node-feedback')
			feedbackInput.placeholder = 'Enter feedback...'
			feedbackInput.value = node.feedback || ''
			feedbackInput.addEventListener('input', (e) => {
				node.feedback = e.target.value
			})

			nodeDiv.appendChild(feedbackLabel)
			nodeDiv.appendChild(feedbackInput)
		}

		return nodeDiv
	}

	createChoiceEditor(choice, index, node) {
		const choiceDiv = document.createElement('div')
		choiceDiv.classList.add('scenario-choice-editor')

		const textInput = document.createElement('input')
		textInput.type = 'text'
		textInput.classList.add('scenario-choice-text')
		textInput.placeholder = 'Choice text...'
		textInput.value = choice.text
		textInput.addEventListener('input', (e) => {
			choice.text = e.target.value
		})

		const nextNodeInput = document.createElement('input')
		nextNodeInput.type = 'text'
		nextNodeInput.classList.add('scenario-choice-next')
		nextNodeInput.placeholder = 'Next node ID...'
		nextNodeInput.value = choice.nextNode
		nextNodeInput.addEventListener('input', (e) => {
			choice.nextNode = e.target.value
		})

		const deleteButton = document.createElement('button')
		deleteButton.classList.add('scenario-choice-delete-button')
		deleteButton.textContent = '×'
		deleteButton.title = 'Delete choice'
		deleteButton.addEventListener('click', () => {
			if (node.choices.length > 1) {
				node.choices.splice(index, 1)
				this.wrapper.innerHTML = ''
				this.renderEditor()
			}
		})

		choiceDiv.appendChild(textInput)
		choiceDiv.appendChild(nextNodeInput)
		choiceDiv.appendChild(deleteButton)

		return choiceDiv
	}

	renderReadOnly() {
		const container = document.createElement('div')
		container.classList.add('scenario-readonly')

		// Title
		const title = document.createElement('h3')
		title.classList.add('scenario-title')
		title.textContent = this.data.title

		// Node Display
		const nodeDisplay = document.createElement('div')
		nodeDisplay.classList.add('scenario-node-display')

		// Path History
		const pathHistory = document.createElement('div')
		pathHistory.classList.add('scenario-path-history')

		// Restart Button
		const restartButton = document.createElement('button')
		restartButton.classList.add('scenario-restart-button')
		restartButton.textContent = '↻ Restart Scenario'
		restartButton.style.display = 'none'

		container.appendChild(title)
		container.appendChild(pathHistory)
		container.appendChild(nodeDisplay)
		container.appendChild(restartButton)

		this.wrapper.appendChild(container)

		// Initialize scenario
		this.initializeScenario(nodeDisplay, pathHistory, restartButton)
	}

	initializeScenario(nodeDisplay, pathHistory, restartButton) {
		const path = []

		const showNode = (nodeId) => {
			const node = this.data.nodes[nodeId]
			if (!node) {
				nodeDisplay.innerHTML = '<p class="scenario-error">Node not found. Please check the scenario configuration.</p>'
				return
			}

			path.push({ id: nodeId, text: node.content })

			// Update path history
			pathHistory.innerHTML = ''
			path.forEach((step, index) => {
				const stepDiv = document.createElement('div')
				stepDiv.classList.add('scenario-path-step')
				stepDiv.innerHTML = `<strong>Step ${index + 1}:</strong> ${step.text.substring(0, 50)}${step.text.length > 50 ? '...' : ''}`
				pathHistory.appendChild(stepDiv)
			})

			// Clear node display
			nodeDisplay.innerHTML = ''

			// Content
			const content = document.createElement('div')
			content.classList.add('scenario-node-content')
			content.innerHTML = this.formatContent(node.content)
			nodeDisplay.appendChild(content)

			if (node.type === 'scenario') {
				// Show choices
				const choicesContainer = document.createElement('div')
				choicesContainer.classList.add('scenario-choices-display')

				node.choices.forEach((choice) => {
					const choiceButton = document.createElement('button')
					choiceButton.classList.add('scenario-choice-button')
					choiceButton.textContent = choice.text
					choiceButton.addEventListener('click', () => {
						if (choice.nextNode) {
							showNode(choice.nextNode)
						}
					})
					choicesContainer.appendChild(choiceButton)
				})

				nodeDisplay.appendChild(choicesContainer)
			} else if (node.type === 'outcome') {
				// Show feedback
				const feedback = document.createElement('div')
				feedback.classList.add('scenario-outcome-feedback')
				feedback.textContent = node.feedback || 'End of scenario.'
				nodeDisplay.appendChild(feedback)

				// Show restart button
				restartButton.style.display = 'block'
			}
		}

		restartButton.addEventListener('click', () => {
			path.length = 0
			pathHistory.innerHTML = ''
			restartButton.style.display = 'none'
			showNode(this.data.startNode)
		})

		// Start scenario
		showNode(this.data.startNode)
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
		if (!savedData.title || !savedData.nodes || Object.keys(savedData.nodes).length === 0) {
			return false
		}
		return true
	}

	static get sanitize() {
		return {
			title: {},
			startNode: {},
			nodes: {},
		}
	}
}
