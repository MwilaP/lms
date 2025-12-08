<template>
  <div class="student-analytics min-h-screen bg-gray-50">
    <header
      class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 shadow-sm sm:px-5"
    >
      <Breadcrumbs class="h-7" :items="breadcrumbs" />
    </header>

    <div class="mx-auto max-w-7xl p-6">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <!-- Student Header Section -->
        <div class="student-header mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <div class="relative">
                <UserAvatar :user="studentId" size="xl" />
                <div class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white"
                     :class="selectedCourse?.summary?.last_access ? 'bg-green-500' : 'bg-gray-400'">
                </div>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ studentName }}</h1>
                <p class="text-gray-600">{{ studentId }}</p>
                <div v-if="selectedCourse" class="mt-2 flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span class="text-sm font-medium text-blue-600">{{ selectedCourse.course.title }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <div class="filter-group" v-if="courses.length > 1">
                <label class="mb-2 block text-sm font-medium text-gray-700">{{ __('Course') }}</label>
                <select 
                  v-model="selectedCourseIndex" 
                  class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option v-for="(course, index) in courses" :key="index" :value="index">
                    {{ course.course.title }}
                  </option>
                </select>
              </div>
              
            </div>
          </div>
        </div>

        <div v-if="selectedCourse">
          <!-- Key Metrics Cards -->
          <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <!-- Total Time Card -->
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-transform hover:scale-105">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-3xl font-bold">{{ formatTime(selectedCourse.summary.total_active_time) }}</div>
                  <div class="mt-1 text-blue-100">{{ __('Total Time Spent') }}</div>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Sessions Card -->
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg transition-transform hover:scale-105">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-3xl font-bold">{{ selectedCourse.summary.sessions_count }}</div>
                  <div class="mt-1 text-green-100">{{ __('Learning Sessions') }}</div>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Days Active Card -->
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg transition-transform hover:scale-105">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-3xl font-bold">{{ selectedCourse.summary.days_active }}</div>
                  <div class="mt-1 text-purple-100">{{ __('Days Active') }}</div>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Completion Card -->
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg transition-transform hover:scale-105">
              <div class="flex flex-col">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-orange-100">{{ __('Course Progress') }}</div>
                  <div class="rounded-full bg-white/20 p-2">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold mb-3">{{ selectedCourse.summary.completion }}%</div>
                <div class="mb-3">
                  <div class="h-2 w-full rounded-full bg-white/20">
                    <div 
                      class="h-full rounded-full bg-white transition-all duration-500" 
                      :style="{ width: `${selectedCourse.summary.completion}%` }"
                    ></div>
                  </div>
                </div>
                <div class="space-y-1 text-xs text-orange-100">
                  <div>{{ __('Started') }}: {{ formatDate(selectedCourse.summary.first_access) }}</div>
                  <div>{{ __('Last active') }}: {{ formatDate(selectedCourse.summary.last_access) }}</div>
                </div>
              </div>
            </div>
          </div>


          <!-- Detailed Breakdown Section -->
          <div class="rounded-xl bg-white p-6 shadow-lg">
            <div class="mb-6 flex items-center gap-3">
              <div class="rounded-lg bg-indigo-100 p-2">
                <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ __('Learning Breakdown') }}</h2>
                <p class="text-sm text-gray-600">{{ __('Detailed chapter and lesson analytics') }}</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <template v-for="(chapter, chapterIndex) in selectedCourse.chapters" :key="chapterIndex">
                <!-- Chapter Card -->
                <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <!-- Chapter Header (Clickable) -->
                  <div 
                    @click="toggleChapter(chapterIndex)"
                    class="flex cursor-pointer items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 transition-colors hover:from-blue-100 hover:to-indigo-100"
                  >
                    <div class="flex flex-1 items-center gap-3">
                      <div class="rounded-lg bg-blue-100 p-2">
                        <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">{{ chapter.title }}</h3>
                        <p class="text-xs text-gray-600">{{ chapter.lessons.length }} {{ chapter.lessons.length === 1 ? __('lesson') : __('lessons') }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                      <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {{ formatTime(chapter.total_active_time) }}
                      </span>
                      <svg 
                        class="h-5 w-5 text-gray-500 transition-transform duration-200"
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
                      class="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div class="flex flex-1 items-center gap-3">
                        <div class="rounded-lg bg-green-100 p-1.5">
                          <svg class="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">{{ lesson.title }}</p>
                          <p class="text-xs text-gray-500">{{ __('Last access') }}: {{ formatDate(lesson.last_access) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          {{ formatTime(lesson.active_time) }}
                        </span>
                        <div class="flex items-center gap-2">
                          <div class="h-1.5 w-16 rounded-full bg-gray-200">
                            <div class="h-full rounded-full bg-green-500" :style="{ width: lesson.active_time > 0 ? '100%' : '0%' }"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Quiz Results for this Chapter -->
                    <div 
                      v-for="quiz in getQuizzesForChapter(chapter)" 
                      :key="`quiz-${quiz.quiz_id}`"
                      class="flex items-center justify-between px-6 py-3 transition-colors"
                      :class="quiz.passed ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'"
                    >
                      <div class="flex flex-1 items-center gap-3">
                        <div 
                          class="rounded-lg p-1.5"
                          :class="quiz.passed ? 'bg-green-100' : 'bg-red-100'"
                        >
                          <svg class="h-3 w-3" :class="quiz.passed ? 'text-green-600' : 'text-red-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <p class="text-sm font-medium text-gray-900">{{ quiz.quiz_title }}</p>
                            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" :class="quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                              {{ quiz.passed ? __('Passed') : __('Failed') }}
                            </span>
                          </div>
                          <p class="text-xs text-gray-500">{{ quiz.attempts }} {{ quiz.attempts === 1 ? __('attempt') : __('attempts') }} • {{ formatDate(quiz.last_attempt) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="text-right">
                          <p class="text-sm font-bold" :class="quiz.passed ? 'text-green-700' : 'text-red-700'">
                            {{ quiz.latest_score }}/{{ quiz.score_out_of }}
                          </p>
                          <p class="text-xs text-gray-600">{{ quiz.percentage }}%</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <div class="h-1.5 w-16 rounded-full bg-gray-200">
                            <div 
                              class="h-full rounded-full transition-all duration-500"
                              :class="quiz.passed ? 'bg-green-500' : 'bg-red-500'"
                              :style="{ width: `${quiz.percentage}%` }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Empty state for no lessons -->
                    <div v-if="!chapter.lessons.length && !getQuizzesForChapter(chapter).length" class="px-6 py-4">
                      <div class="flex items-center gap-2 text-sm text-gray-500">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ __('No content available in this chapter') }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- Empty state for no chapters -->
              <div v-if="!selectedCourse.chapters.length" class="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <svg class="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-500">{{ __('No learning content data available') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state for no courses -->
        <div v-else class="mt-16 text-center">
          <div class="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg">
            <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900">{{ __('No Course Data') }}</h3>
            <p class="text-gray-500">{{ __('This student hasn\'t enrolled in any courses yet or no analytics data is available.') }}</p>
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


// Breadcrumbs
const breadcrumbs = computed(() => {
  const breadcrumbItems = [
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
  
  // Add course breadcrumb if we have a specific course
  if (courseId && selectedCourse.value) {
    breadcrumbItems.push({
      label: selectedCourse.value.course.title,
      route: {
        name: 'StudentCourseAnalytics',
        params: { student: studentId, course: courseId }
      },
    })
  }
  
  return breadcrumbItems
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
    // Load quiz results for the first course if available
    if (data && data.length > 0) {
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
