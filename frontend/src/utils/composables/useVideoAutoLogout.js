import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAutoLogout } from './useAutoLogout'

/**
 * Composable for managing auto-logout on video/lesson pages
 * Automatically extends timeout for video content
 */
export function useVideoAutoLogout() {
	const route = useRoute()
	const { setTimeoutDuration, isAutoLogoutActive } = useAutoLogout()
	
	let originalTimeout = 15 // Default 15 minutes
	let videoTimeoutExtension = 45 // Extended to 45 minutes for videos
	let heartbeatInterval = null

	/**
	 * Check if current page is a video/lesson page
	 */
	const isVideoPage = () => {
		const videoRoutes = ['Lesson', 'LessonWithAnalytics', 'SCORMChapter']
		return videoRoutes.includes(route.name)
	}

	/**
	 * Check if there's an active video element on the page
	 */
	const hasActiveVideo = () => {
		const videos = document.querySelectorAll('video')
		return Array.from(videos).some(video => !video.paused && !video.ended)
	}

	/**
	 * Start video-specific timeout management
	 */
	const startVideoTimeout = () => {
		if (isAutoLogoutActive()) {
			console.log('Extending auto-logout timeout for video content (45 minutes)')
			setTimeoutDuration(videoTimeoutExtension)
			
			// Start heartbeat to detect video activity
			startVideoHeartbeat()
		}
	}

	/**
	 * Restore normal timeout
	 */
	const restoreNormalTimeout = () => {
		if (isAutoLogoutActive()) {
			console.log('Restoring normal auto-logout timeout (15 minutes)')
			setTimeoutDuration(originalTimeout)
			
			// Stop video heartbeat
			stopVideoHeartbeat()
		}
	}

	/**
	 * Start heartbeat to monitor video playback
	 */
	const startVideoHeartbeat = () => {
		stopVideoHeartbeat() // Clear any existing interval
		
		heartbeatInterval = setInterval(() => {
			if (hasActiveVideo()) {
				// Video is playing, simulate activity to reset timer
				// Dispatch a custom event that the auto-logout service will detect
				document.dispatchEvent(new CustomEvent('video-activity', { 
					detail: { source: 'video-playback' }
				}))
			}
		}, 30000) // Check every 30 seconds
	}

	/**
	 * Stop video heartbeat
	 */
	const stopVideoHeartbeat = () => {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval)
			heartbeatInterval = null
		}
	}

	/**
	 * Handle route changes
	 */
	const handleRouteChange = () => {
		if (isVideoPage()) {
			startVideoTimeout()
		} else {
			restoreNormalTimeout()
		}
	}

	// Watch for route changes
	watch(
		() => route.name,
		() => {
			handleRouteChange()
		},
		{ immediate: true }
	)

	// Setup on mount
	onMounted(() => {
		handleRouteChange()
		
		// Listen for video events
		const handleVideoPlay = () => {
			if (isVideoPage()) {
				startVideoTimeout()
			}
		}
		
		const handleVideoPause = () => {
			// Don't change timeout on pause, user might resume
		}
		
		// Add event listeners for video elements
		document.addEventListener('play', handleVideoPlay, true)
		document.addEventListener('pause', handleVideoPause, true)
	})

	// Cleanup on unmount
	onUnmounted(() => {
		stopVideoHeartbeat()
		restoreNormalTimeout()
		
		// Remove event listeners
		document.removeEventListener('play', () => {}, true)
		document.removeEventListener('pause', () => {}, true)
	})

	return {
		isVideoPage,
		hasActiveVideo,
		startVideoTimeout,
		restoreNormalTimeout
	}
}
