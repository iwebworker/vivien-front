<script setup lang="ts">
const authStore = useAuthStore()
const { request } = useApi()
const { toast } = useToast()

const questions = ref<Array<{
  id: number
  title: string
  comment: string
  created_at: string
  shop_answers: Array<{ id: number; comment: string; created_at: string }>
}>>([])

const title = ref('')
const comment = ref('')
const isLoading = ref(false)
const isExpanded = ref<number | null>(null)
const searchQuery = ref('')

definePageMeta({
  middleware: 'auth'
})

const fetchQuestions = async () => {
  isLoading.value = true
  try {
    questions.value = await request('/shop/shop-questions/')
  } catch (error: any) {
    toast('Не удалось загрузить вопросы', 'error')
  } finally {
    isLoading.value = false
  }
}

const submitQuestion = async () => {
  if (!title.value.trim() || !comment.value.trim()) {
    toast('Заполните все поля', 'error')
    return
  }

  try {
    await request('/shop/shop-questions/', 'POST', {
      title: title.value.trim(),
      comment: comment.value.trim()
    }, true)

    title.value = ''
    comment.value = ''
    toast('Вопрос отправлен! 💬', 'success')
    await fetchQuestions()
  } catch (error: any) {
    toast('Не удалось отправить вопрос', 'error')
  }
}

const filteredQuestions = computed(() => {
  if (!searchQuery.value) return questions.value

  const query = searchQuery.value.toLowerCase()
  return questions.value.filter(q =>
      q.title.toLowerCase().includes(query) ||
      q.comment.toLowerCase().includes(query)
  )
})

onMounted(fetchQuestions)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-['Playfair_Display'] font-bold text-gray-900">Поддержка</h1>
        <p class="text-gray-600 mt-1">Задайте вопрос или найдите ответ</p>
      </div>
      <div class="badge text-lg px-4 py-2">
        {{ questions.length }} вопросов
      </div>
    </div>

    <!-- Search -->
    <div class="card-soft p-4">
      <div class="relative">
        <input v-model="searchQuery"
               class="input-field pl-4"
               placeholder="Поиск по вопросам..." />
      </div>
    </div>

    <!-- Ask Question Form -->
    <div class="card-soft p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>✍️</span>
        Задать новый вопрос
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Тема вопроса</label>
          <input v-model="title"
                 class="input-field"
                 placeholder="Например: Как узнать статус заказа?" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Ваш вопрос</label>
          <textarea v-model="comment"
                    class="input-field min-h-[120px]"
                    placeholder="Опишите ваш вопрос подробнее..."
                    rows="4" />
        </div>

        <button @click="submitQuestion"
                class="btn-primary flex items-center gap-2">
          Отправить вопрос
        </button>
      </div>
    </div>
  </div>

  <!-- Questions List -->
  <div class="space-y-4 mt-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="card-soft p-4">
        <div class="skeleton h-5 w-48 mb-3"></div>
        <div class="skeleton h-4 w-full mb-2"></div>
        <div class="skeleton h-4 w-3/4"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !filteredQuestions.length" class="card-soft p-12 text-center">
      <div class="text-6xl mb-4">💭</div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">
        {{ searchQuery ? 'Вопросы не найдены' : 'Пока нет вопросов' }}
      </h3>
      <p class="text-gray-600">
        {{ searchQuery
          ? 'Попробуйте изменить поисковый запрос'
          : 'Задайте первый вопрос и мы с радостью ответим' }}
      </p>
    </div>

    <!-- Questions -->
    <TransitionGroup name="list">
      <article v-for="question in filteredQuestions" :key="question.id"
               class="card-soft overflow-hidden">
        <div @click="isExpanded = isExpanded === question.id ? null : question.id"
             class="p-5 cursor-pointer hover:bg-rose-50/30 transition-all">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="font-semibold text-gray-800">{{ question.title }}</h3>
                <span v-if="question.shop_answers.length"
                      class="badge bg-green-100 text-green-700">
                    ✓ Отвечен
                  </span>
              </div>
              <p class="text-sm text-gray-600 line-clamp-2">{{ question.comment }}</p>
              <p class="text-xs text-gray-400 mt-2">
                {{ new Date(question.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) }}
              </p>
            </div>
            <span class="transform transition-transform duration-300 text-xl"
                  :class="{ 'rotate-180': isExpanded === question.id }">
                ▼
              </span>
          </div>
        </div>

        <!-- Expanded Content -->
        <Transition name="expand">
          <div v-if="isExpanded === question.id"
               class="border-t border-rose-100 p-5 bg-white/50">
            <div class="mb-4 p-4 rounded-xl bg-rose-50">
              <p class="text-sm font-medium text-gray-800 mb-1">Ваш вопрос:</p>
              <p class="text-gray-700">{{ question.comment }}</p>
            </div>

            <!-- Answers -->
            <div v-if="question.shop_answers.length" class="space-y-3">
              <p class="font-medium text-gray-800">Ответы магазина:</p>
              <div v-for="answer in question.shop_answers" :key="answer.id"
                   class="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm">
                    V
                  </div>
                  <div>
                    <p class="text-sm text-gray-800">{{ answer.comment }}</p>
                    <p v-if="answer.created_at" class="text-xs text-gray-400 mt-1">
                      {{ new Date(answer.created_at).toLocaleDateString('ru-RU') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <p class="text-sm text-yellow-800 flex items-center gap-2">
                <span>⏳</span>
                Ожидайте ответа от магазина
              </p>
            </div>
          </div>
        </Transition>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 2000px;
}
</style>