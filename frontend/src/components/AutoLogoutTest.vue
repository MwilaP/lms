<template>
	<div class="p-4 border rounded-lg bg-gray-50">
		<h3 class="text-lg font-semibold mb-4">Auto-Logout Test Panel</h3>
		
		<div class="space-y-4">
			<div class="flex items-center space-x-4">
				<span class="font-medium">Status:</span>
				<span 
					:class="isActive ? 'text-green-600' : 'text-red-600'"
					class="font-medium"
				>
					{{ isActive ? 'Active' : 'Inactive' }}
				</span>
			</div>
			
			<div class="flex items-center space-x-4">
				<label class="font-medium">Timeout (minutes):</label>
				<input 
					v-model.number="timeoutMinutes"
					type="number"
					min="1"
					max="60"
					class="px-3 py-1 border rounded w-20"
				/>
				<button 
					@click="updateTimeout"
					class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Update
				</button>
			</div>
			
			<div class="flex space-x-2">
				<button 
					@click="startService"
					:disabled="isActive"
					class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Start Auto-Logout
				</button>
				
				<button 
					@click="stopService"
					:disabled="!isActive"
					class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Stop Auto-Logout
				</button>
				
				<button 
					@click="triggerWarning"
					:disabled="!isActive"
					class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Test Warning (30s)
				</button>
			</div>
			
			<div class="text-sm text-gray-600">
				<p><strong>Note:</strong> This is a test component for development purposes.</p>
				<p>• Default timeout: 15 minutes</p>
				<p>• Warning appears: 2 minutes before logout</p>
				<p>• Activity events: mouse movement, clicks, keyboard input, scrolling</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAutoLogout } from '@/utils/composables/useAutoLogout'
import autoLogoutService from '@/utils/autoLogout'

const { startAutoLogout, stopAutoLogout, isAutoLogoutActive, setTimeoutDuration } = useAutoLogout()

const isActive = ref(false)
const timeoutMinutes = ref(15)

const updateStatus = () => {
	isActive.value = isAutoLogoutActive()
}

const startService = () => {
	startAutoLogout()
	updateStatus()
}

const stopService = () => {
	stopAutoLogout()
	updateStatus()
}

const updateTimeout = () => {
	if (timeoutMinutes.value >= 1 && timeoutMinutes.value <= 60) {
		setTimeoutDuration(timeoutMinutes.value)
		console.log(`Auto-logout timeout updated to ${timeoutMinutes.value} minutes`)
	}
}

const triggerWarning = () => {
	// Temporarily set a short timeout for testing
	const originalTimeout = timeoutMinutes.value
	setTimeoutDuration(0.5) // 30 seconds
	
	// Reset to original timeout after test
	setTimeout(() => {
		setTimeoutDuration(originalTimeout)
	}, 35000) // 35 seconds to allow for warning + logout
	
	console.log('Test warning will appear in ~28 seconds (30s timeout - 2s warning)')
}

onMounted(() => {
	updateStatus()
	
	// Update status every second
	setInterval(updateStatus, 1000)
})
</script>
