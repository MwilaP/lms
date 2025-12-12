<template>
  <div class="student-analytics min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-6 py-8">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <!-- Student Header Section -->
        <div class="mb-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <div class="relative">
                <UserAvatar :user="studentId" size="lg" />
                <div class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-50"
                     :class="selectedCourse?.summary?.last_access ? 'bg-green-500' : 'bg-gray-400'">
                </div>
              </div>
              <div>
                <h1 class="text-2xl font-semibold text-gray-900">{{ studentName }}</h1>
                <p class="text-sm text-gray-600">{{ studentId }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div v-if="courses.length > 1" class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">{{ __('Course') }}</label>
                <select 
                  v-model="selectedCourseIndex" 
                  class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option v-for="(course, index) in courses" :key="index" :value="index">
                    {{ course.course.title }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Course Title -->
          <div v-if="selectedCourse" class="mt-4">
            <h2 class="text-lg font-medium text-gray-900">{{ selectedCourse.course.title }}</h2>
          </div>
        </div>

        <div v-if="selectedCourse">
          <!-- Key Metrics Cards -->
          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <!-- Total Time Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600">{{ __('Total Time Spent') }}</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900">{{ formatTime(selectedCourse.summary.total_active_time) }}</p>
                </div>
                <div class="rounded-lg bg-blue-50 p-2.5">
                  <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Sessions Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600">{{ __('Learning Sessions') }}</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900">{{ selectedCourse.summary.sessions_count }}</p>
                </div>
                <div class="rounded-lg bg-green-50 p-2.5">
                  <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Days Active Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600">{{ __('Days Active') }}</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900">{{ selectedCourse.summary.days_active }}</p>
                </div>
                <div class="rounded-lg bg-purple-50 p-2.5">
                  <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Completion Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600">{{ __('Course Progress') }}</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900">{{ selectedCourse.summary.completion }}%</p>
                </div>
                <div class="rounded-lg bg-orange-50 p-2.5">
                  <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="mb-3">
                <div class="h-2 w-full rounded-full bg-gray-100">
                  <div 
                    class="h-full rounded-full bg-blue-500 transition-all duration-500" 
                    :style="{ width: `${selectedCourse.summary.completion}%` }"
                  ></div>
                </div>
              </div>
              <div class="space-y-1 text-xs text-gray-500">
                <div>{{ __('Started') }}: {{ formatDate(selectedCourse.summary.first_access) }}</div>
                <div>{{ __('Last active') }}: {{ formatDate(selectedCourse.summary.last_access) }}</div>
              </div>
            </div>
          </div>


          <!-- Detailed Breakdown Section -->
          <div class="rounded-lg border border-gray-200 bg-white p-6">
            <div class="mb-5">
              <h3 class="text-base font-semibold text-gray-900">{{ __('Learning Breakdown') }}</h3>
              <p class="mt-1 text-sm text-gray-600">{{ __('Detailed chapter and lesson analytics') }}</p>
            </div>
            
            <div class="space-y-3">
              <template v-for="(chapter, chapterIndex) in selectedCourse.chapters" :key="chapterIndex">
                <!-- Chapter Card -->
                <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <!-- Chapter Header (Clickable) -->
                  <div 
                    @click="toggleChapter(chapterIndex)"
                    class="flex cursor-pointer items-center justify-between bg-gray-50 px-5 py-3.5 transition-colors hover:bg-gray-100"
                  >
                    <div class="flex flex-1 items-center gap-3">
                      <div class="rounded-md bg-white p-1.5 border border-gray-200">
                        <svg class="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h3 class="font-medium text-gray-900">{{ chapter.title }}</h3>
                        <p class="text-xs text-gray-500">{{ chapter.lessons.length }} {{ chapter.lessons.length === 1 ? __('lesson') : __('lessons') }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <span class="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
                        {{ formatTime(chapter.total_active_time) }}
                      </span>
                      <svg 
                        class="h-4 w-4 text-gray-400 transition-transform duration-200"
                        :class="{ 'rotate-180': expandedChapters[chapterIndex] }"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Chapter Content (Collapsible) -->
                  <div 
                    v-show="expandedChapters[chapterIndex]"
                    class="divide-y divide-gray-100"
                  >
                    <!-- Lessons -->
                    <div 
                      v-for="(lesson, lessonIndex) in chapter.lessons" 
                      :key="`lesson-${chapterIndex}-${lessonIndex}`"
                      class="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div class="flex flex-1 items-center gap-3">
                        <div class="rounded-md bg-green-50 p-1.5">
                          <svg class="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">{{ lesson.title }}</p>
                          <p class="text-xs text-gray-500">{{ __('Last access') }}: {{ formatDate(lesson.last_access) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          {{ formatTime(lesson.active_time) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Quiz Results for this Chapter -->
                    <div 
                      v-for="quiz in getQuizzesForChapter(chapter)" 
                      :key="`quiz-${quiz.quiz_id}`"
                      class="flex items-center justify-between px-5 py-3 transition-colors"
                      :class="quiz.passed ? 'bg-green-50/50 hover:bg-green-50' : 'bg-red-50/50 hover:bg-red-50'"
                    >
                      <div class="flex flex-1 items-center gap-3">
                        <div 
                          class="rounded-md p-1.5"
                          :class="quiz.passed ? 'bg-green-100' : 'bg-red-100'"
                        >
                          <svg class="h-3.5 w-3.5" :class="quiz.passed ? 'text-green-600' : 'text-red-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <p class="text-sm font-medium text-gray-900">{{ quiz.quiz_title }}</p>
                            <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium" :class="quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                              {{ quiz.passed ? __('Passed') : __('Failed') }}
                            </span>
                          </div>
                          <p class="text-xs text-gray-500">{{ quiz.attempts }} {{ quiz.attempts === 1 ? __('attempt') : __('attempts') }} • {{ formatDate(quiz.last_attempt) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="text-right">
                          <p class="text-sm font-semibold" :class="quiz.passed ? 'text-green-700' : 'text-red-700'">
                            {{ quiz.latest_score }}/{{ quiz.score_out_of }}
                          </p>
                          <p class="text-xs text-gray-500">{{ quiz.percentage }}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Empty state for no lessons -->
                    <div v-if="!chapter.lessons.length && !getQuizzesForChapter(chapter).length" class="px-5 py-4">
                      <p class="text-sm text-gray-500">{{ __('No content available in this chapter') }}</p>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- Empty state for no chapters -->
              <div v-if="!selectedCourse.chapters.length" class="rounded-lg border border-gray-200 bg-white px-5 py-10 text-center">
                <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="mt-3 text-sm text-gray-500">{{ __('No learning content data available') }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state for no courses -->
        <div v-else class="mt-12 text-center">
          <div class="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="mb-2 text-base font-semibold text-gray-900">{{ __('No Course Data') }}</h3>
            <p class="text-sm text-gray-500">{{ __('This student hasn\'t enrolled in any courses yet or no analytics data is available.') }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  createResource,
  usePageMeta,
} from 'frappe-ui'
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sessionStore } from '../stores/session'
import UserAvatar from '../components/UserAvatar.vue'

const router = useRouter()
const route = useRoute()
const { brand } = sessionStore()

// Student data
const studentId = route.params.student
const courseId = route.params.course
const studentName = ref('')
const loading = ref(true)
const courses = ref([])
const selectedCourseIndex = ref(0)
const quizResults = ref([])
const expandedChapters = ref({})

// Computed
const selectedCourse = computed(() => {
  return courses.value[selectedCourseIndex.value] || null
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

const analyticsResource = createResource({
  url: 'lms.lms.learning_analytics_api.get_student_analytics',
  onSuccess: (data) => {
    courses.value = data || []
    loading.value = false
    
    // If courseId is provided in URL, find and select that course
    if (courseId && data && data.length > 0) {
      const courseIndex = data.findIndex(c => c.course.name === courseId)
      if (courseIndex !== -1) {
        selectedCourseIndex.value = courseIndex
      }
      loadQuizResults(courseId)
    } else if (data && data.length > 0) {
      // Load quiz results for the first course if no specific course is selected
      loadQuizResults(data[0].course.name)
    }
  },
  onError: () => {
    loading.value = false
  }
})

const quizResultsResource = createResource({
  url: 'lms.lms.learning_analytics_api.get_student_quiz_results',
  onSuccess: (data) => {
    quizResults.value = data || []
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

function loadQuizResults(courseName) {
  if (courseName) {
    quizResultsResource.submit({
      student: studentId,
      course: courseName
    })
  }
}

function toggleChapter(chapterIndex) {
  expandedChapters.value[chapterIndex] = !expandedChapters.value[chapterIndex]
}

function getQuizzesForChapter(chapter) {
  // Filter quizzes that belong to lessons in this chapter
  return quizResults.value.filter(quiz => {
    // Check if quiz's lesson is in this chapter
    return chapter.lessons.some(lesson => lesson.name === quiz.lesson)
  })
}


// Watch for course selection changes
watch(selectedCourse, (newCourse) => {
  if (newCourse && newCourse.course && newCourse.course.name) {
    loadQuizResults(newCourse.course.name)
    // Reset expanded chapters when switching courses
    expandedChapters.value = {}
    
    // Update URL to reflect the selected course
    if (newCourse.course.name !== courseId) {
      router.push({
        name: 'StudentCourseAnalytics',
        params: {
          student: studentId,
          course: newCourse.course.name
        }
      })
    }
  }
})

// Load initial data
onMounted(() => {
  const params = { student: studentId }
  if (courseId) {
    params.course = courseId
  }
  analyticsResource.submit(params)
})

// Page meta
usePageMeta(() => {
  return {
    title: __('Student Analytics'),
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
