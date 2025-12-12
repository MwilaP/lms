import { sessionStore } from '@/stores/session'
import { createDialog } from '@/utils/dialogs'

class AutoLogoutService {
	constructor() {
		this.timeoutDuration = 15 * 60 * 1000 // 15 minutes in milliseconds
		this.warningDuration = 2 * 60 * 1000 // 2 minutes warning before logout
		this.timeoutId = null
		this.warningTimeoutId = null
		this.warningDialog = null
		this.isActive = false
		this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'video-activity']
		
		// Bind methods to preserve 'this' context
		this.resetTimer = this.resetTimer.bind(this)
		this.showWarning = this.showWarning.bind(this)
		this.performLogout = this.performLogout.bind(this)
		this.handleActivity = this.handleActivity.bind(this)
	}

	/**
	 * Start the auto-logout service
	 */
	start() {
		if (this.isActive) return
		
		const { isLoggedIn } = sessionStore()
		if (!isLoggedIn) return
		
		this.isActive = true
		this.addEventListeners()
		this.resetTimer()
		
		console.log('Auto-logout service started - 15 minute timeout')
	}

	/**
	 * Stop the auto-logout service
	 */
	stop() {
		if (!this.isActive) return
		
		this.isActive = false
		this.removeEventListeners()
		this.clearTimers()
		this.closeWarningDialog()
		
		console.log('Auto-logout service stopped')
	}

	/**
	 * Add event listeners for user activity
	 */
	addEventListeners() {
		this.events.forEach(event => {
			document.addEventListener(event, this.handleActivity, true)
		})
		
		// Listen for visibility changes (tab switching)
		document.addEventListener('visibilitychange', this.handleActivity, true)
	}

	/**
	 * Remove event listeners
	 */
	removeEventListeners() {
		this.events.forEach(event => {
			document.removeEventListener(event, this.handleActivity, true)
		})
		
		document.removeEventListener('visibilitychange', this.handleActivity, true)
	}

	/**
	 * Handle user activity
	 */
	handleActivity() {
		if (!this.isActive) return
		
		// Close warning dialog if user becomes active
		if (this.warningDialog) {
			this.closeWarningDialog()
		}
		
		this.resetTimer()
	}

	/**
	 * Reset the inactivity timer
	 */
	resetTimer() {
		this.clearTimers()
		
		// Set warning timer (13 minutes - 2 minutes before logout)
		this.warningTimeoutId = setTimeout(this.showWarning, this.timeoutDuration - this.warningDuration)
		
		// Set logout timer (15 minutes)
		this.timeoutId = setTimeout(this.performLogout, this.timeoutDuration)
	}

	/**
	 * Clear all timers
	 */
	clearTimers() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
		
		if (this.warningTimeoutId) {
			clearTimeout(this.warningTimeoutId)
			this.warningTimeoutId = null
		}
	}

	/**
	 * Show warning dialog before logout
	 */
	showWarning() {
		if (!this.isActive) return
		
		let countdown = Math.floor(this.warningDuration / 1000) // 2 minutes in seconds
		
		this.warningDialog = createDialog({
			title: 'Session Timeout Warning',
			message: `Your session will expire in ${Math.floor(countdown / 60)} minutes due to inactivity. Click "Stay Logged In" to continue your session.`,
			actions: [
				{
					label: 'Stay Logged In',
					variant: 'solid',
					onClick: (close) => {
						this.handleActivity() // Reset timer
						close()
					}
				},
				{
					label: 'Logout Now',
					variant: 'outline',
					onClick: (close) => {
						close()
						this.performLogout()
					}
				}
			]
		})

	}

	/**
	 * Close warning dialog
	 */
	closeWarningDialog() {
		if (this.warningDialog) {
			this.warningDialog.close()
			this.warningDialog = null
		}
	}

	/**
	 * Perform automatic logout
	 */
	performLogout() {
		if (!this.isActive) return
		
		console.log('Auto-logout: Logging out user due to inactivity')
		
		this.closeWarningDialog()
		this.stop()
		
		// Use the existing logout function from session store
		const { logout } = sessionStore()
		logout.submit().then(() => {
			// Show a message about automatic logout
			createDialog({
				title: 'Session Expired',
				message: 'You have been automatically logged out due to 15 minutes of inactivity.',
				actions: [
					{
						label: 'OK',
						variant: 'solid',
						onClick: (close) => close()
					}
				]
			})
		}).catch((error) => {
			console.error('Auto-logout error:', error)
			// Fallback: redirect to login page
			window.location.href = '/login'
		})
	}

	/**
	 * Check if service is currently active
	 */
	isServiceActive() {
		return this.isActive
	}

	/**
	 * Update timeout duration (for testing or configuration)
	 */
	setTimeoutDuration(minutes) {
		this.timeoutDuration = minutes * 60 * 1000
		this.warningDuration = Math.min(2 * 60 * 1000, this.timeoutDuration / 2) // Warning at 2 minutes or half the timeout
		
		if (this.isActive) {
			this.resetTimer()
		}
	}
}

// Create singleton instance
const autoLogoutService = new AutoLogoutService()

export default autoLogoutService
