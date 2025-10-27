<template>
  <div class="student-courses">
    <header
      class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
    >
      <Breadcrumbs class="h-7" :items="breadcrumbs" />
    </header>

    <div class="p-5">
      <div v-if="loading" class="flex justify-center py-10">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="student-header mb-6">
          <div class="flex items-center gap-4">
            <UserAvatar :user="studentId" size="lg" />
            <div>
              <h1 class="text-2xl font-bold">{{ studentName }}</h1>
              <p class="text-gray-600">{{ studentId }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h2 class="mb-4 text-lg font-medium">{{ __('Enrolled Courses') }}</h2>
          
          <div v-if="enrolledCourses.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="course in enrolledCourses" 
              :key="course.name"
              class="course-card cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
              @click="viewCourseAnalytics(course.name)"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="course-image h-16 w-16 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                  <img 
                    v-if="course.image" 
                    :src="course.image" 
                    :alt="course.title"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="text-gray-400 text-xl">{{ course.title.charAt(0) }}</span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ course.title }}</h3>
                  <div class="mt-1 flex items-center text-sm">
                    <div class="h-2 w-full max-w-[100px] rounded-full bg-gray-200">
                      <div 
                        class="h-full rounded-full bg-green-500" 
                        :style="{ width: `${course.progress || 0}%` }"
                      ></div>
                    </div>
                    <span class="ml-2">{{ course.progress || 0 }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-3 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ __('Time Spent') }}</span>
                  <span class="font-medium">{{ formatTime(course.total_time || 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ __('Last Active') }}</span>
                  <span class="font-medium">{{ formatDate(course.last_active) }}</span>
                </div>
              </div>
              
              <div class="mt-3 pt-3 border-t">
                <div class="flex items-center justify-center">
                  <span class="text-blue-600 text-sm font-medium">{{ __('View Analytics') }} →</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-10">
            <p class="text-gray-500">{{ __('No courses found for this student') }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  Breadcrumbs,
  createResource,
  usePageMeta,
} from 'frappe-ui'
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sessionStore } from '../stores/session'
import UserAvatar from '../components/UserAvatar.vue'

const router = useRouter()
const route = useRoute()
const { brand } = sessionStore()

// Student data
const studentId = route.params.student
const studentName = ref('')
const loading = ref(true)
const enrolledCourses = ref([])

// Breadcrumbs
const breadcrumbs = computed(() => {
  return [
    {
      label: 'Analytics Dashboard',
      route: {
        name: 'AdminAnalytics',
      },
    },
    {
      label: studentName.value || studentId,
      route: {
        name: 'StudentCourses',
        params: { student: studentId }
      },
    }
  ]
})

// Resources
const userResource = createResource({
  url: 'frappe.client.get_value',
  params: {
    doctype: 'User',
    filters: { name: studentId },
    fieldname: 'full_name'
  },
  auto: true,
  onSuccess: (data) => {
    if (data && data.message) {
      studentName.value = data.message.full_name || studentId
    }
  }
})

// Get enrolled courses
const enrollmentsResource = createResource({
  url: 'frappe.client.get_list',
  makeParams: () => ({
    doctype: 'LMS Enrollment',
    fields: ['name', 'course', 'progress', 'creation'],
    filters: { member: studentId },
    limit_page_length: 0
  }),
  auto: true,
  onSuccess: async (enrollments) => {
    try {
      if (!enrollments || !enrollments.length) {
        loading.value = false
        return
      }
      
      // Get course details for each enrollment
      const coursePromises = enrollments.map(enrollment => {
        return createResource({
          url: 'frappe.client.get_value',
          params: {
            doctype: 'LMS Course',
            filters: { name: enrollment.course },
            fieldname: ['name', 'title', 'image']
          }
        }).submit()
      })
      
      // Get analytics data for each course
      const analyticsPromises = enrollments.map(enrollment => {
        return createResource({
          url: 'lms.lms.learning_analytics_api.get_student_analytics',
          params: {
            student: studentId,
            course: enrollment.course
          }
        }).submit()
      })
      
      const courseResults = await Promise.all(coursePromises)
      const analyticsResults = await Promise.all(analyticsPromises)
      
      // Combine data
      const courses = enrollments.map((enrollment, index) => {
        const courseData = courseResults[index]?.message || {}
        const analyticsData = analyticsResults[index] || []
        
        // Find analytics for this course
        const courseAnalytics = analyticsData.find(a => a.course.name === enrollment.course)
        
        return {
          name: enrollment.course,
          title: courseData.title || enrollment.course,
          image: courseData.image,
          progress: enrollment.progress,
          total_time: courseAnalytics?.summary?.total_active_time || 0,
          last_active: courseAnalytics?.summary?.last_access || enrollment.creation
        }
      })
      
      enrolledCourses.value = courses
      loading.value = false
    } catch (error) {
      console.error('Error loading student courses:', error)
      loading.value = false
    }
  },
  onError: (error) => {
    console.error('Enrollments resource error:', error)
    loading.value = false
  }
})

// Methods
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function formatDate(dateString) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
}

function viewCourseAnalytics(course) {
  router.push({ 
    name: 'StudentCourseAnalytics', 
    params: { 
      student: studentId,
      course: course
    } 
  })
}

// Page meta
usePageMeta(() => {
  return {
    title: __('Student Courses'),
    icon: brand.favicon,
  }
})
</script>

<style scoped>
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
