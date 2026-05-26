<script setup lang="ts">
const authStore = useAuthStore()
const { toast } = useToast()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorText = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

definePageMeta({
  middleware: 'guest'
})

const submit = async () => {
  errorText.value = ''

  if (!email.value || !password.value || !confirmPassword.value) {
    errorText.value = 'Заполните все поля'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorText.value = 'Пароли не совпадают'
    return
  }

  if (password.value.length < 8) {
    errorText.value = 'Пароль должен быть не менее 8 символов'
    return
  }

  isLoading.value = true

  try {
    await authStore.register(email.value, password.value)
    toast('Добро пожаловать! 🎉', 'success')
    await navigateTo('/')
  } catch (error: any) {
    errorText.value = error?.data?.password?.[0] ||
        error?.data?.email?.[0] ||
        error?.data?.detail ||
        'Ошибка регистрации'
    toast(errorText.value, 'error')
  } finally {
    isLoading.value = false
  }
}

const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return { text: '', color: '', width: '0%' }

  let strength = 0
  if (pwd.length >= 8) strength++
  if (pwd.match(/[A-Z]/)) strength++
  if (pwd.match(/[0-9]/)) strength++
  if (pwd.match(/[^A-Za-z0-9]/)) strength++

  const levels = [
    { text: 'Слабый', color: 'bg-red-500', width: '25%' },
    { text: 'Средний', color: 'bg-yellow-500', width: '50%' },
    { text: 'Хороший', color: 'bg-blue-500', width: '75%' },
    { text: 'Отличный', color: 'bg-green-500', width: '100%' },
  ]

  return levels[Math.min(strength - 1, 3)] || levels[0]
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <span class="text-5xl animate-float block mb-3">🌸</span>
          <span class="text-3xl font-['Playfair_Display'] font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            Vivien
          </span>
        </NuxtLink>
        <p class="text-gray-600 mt-2">Создайте новый аккаунт</p>
      </div>

      <!-- Register Form -->
      <div class="card-soft p-8 space-y-5">
        <h1 class="text-2xl font-semibold text-gray-800 text-center">Регистрация</h1>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Электронная почта</label>
          <input v-model="email"
                 type="email"
                 class="input-field"
                 placeholder="your@email.com"
                 @keyup.enter="submit" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Пароль</label>
          <div class="relative">
            <input v-model="password"
                   :type="showPassword ? 'text' : 'password'"
                   class="input-field pr-12"
                   placeholder="Минимум 8 символов"
                   @keyup.enter="submit" />
            <button @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Подтвердите пароль</label>
          <input v-model="confirmPassword"
                 :type="showPassword ? 'text' : 'password'"
                 class="input-field"
                 :class="{ 'border-green-400': confirmPassword && password === confirmPassword,
                     'border-red-400': confirmPassword && password !== confirmPassword }"
                 placeholder="Повторите пароль"
                 @keyup.enter="submit" />
          <p v-if="confirmPassword && password === confirmPassword"
             class="text-xs text-green-600 mt-1">✓ Пароли совпадают</p>
          <p v-else-if="confirmPassword && password !== confirmPassword"
             class="text-xs text-red-600 mt-1">✗ Пароли не совпадают</p>
        </div>

        <Transition name="fade">
          <p v-if="errorText"
             class="text-sm text-red-600 bg-red-50 p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            {{ errorText }}
          </p>
        </Transition>

        <button @click="submit"
                :disabled="isLoading"
                class="btn-primary w-full flex items-center justify-center gap-2">
          <span v-if="isLoading" class="animate-spin">⏳</span>
          {{ isLoading ? 'Создаем аккаунт...' : 'Создать аккаунт' }}
        </button>

        <div class="text-center text-sm">
          <NuxtLink to="/login"
                    class="text-rose-600 hover:underline font-medium">
            Уже есть аккаунт? Войти →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
