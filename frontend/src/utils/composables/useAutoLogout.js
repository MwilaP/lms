import { onMounted, onUnmounted, watch } from 'vue'
import { sessionStore } from '@/stores/session'
import autoLogoutService from '@/utils/autoLogout'

/**
 * Composable for managing auto-logout functionality
 * Automatically starts/stops the service based on login status
 */
export function useAutoLogout() {
	const { isLoggedIn } = sessionStore()

	/**
	 * Start auto-logout service
	 */
	const startAutoLogout = () => {
		autoLogoutService.start()
	}

	/**
	 * Stop auto-logout service
	 */
	const stopAutoLogout = () => {
		autoLogoutService.stop()
	}

	/**
	 * Check if auto-logout is active
	 */
	const isAutoLogoutActive = () => {
		return autoLogoutService.isServiceActive()
	}

	/**
	 * Set custom timeout duration (in minutes)
	 */
	const setTimeoutDuration = (minutes) => {
		autoLogoutService.setTimeoutDuration(minutes)
	}

	// Watch for login status changes
	watch(
		() => isLoggedIn,
		(newValue) => {
			if (newValue) {
				startAutoLogout()
			} else {
				stopAutoLogout()
			}
		},
		{ immediate: true }
	)

	// Cleanup on component unmount
	onUnmounted(() => {
		// Don't stop the service on unmount since it should persist across components
		// Only stop when user logs out or manually stopped
	})

	return {
		startAutoLogout,
		stopAutoLogout,
		isAutoLogoutActive,
		setTimeoutDuration
	}
}
