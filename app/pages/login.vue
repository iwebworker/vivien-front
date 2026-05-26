<script setup lang="ts">
const authStore = useAuthStore()
const { toast } = useToast()
const email = ref('')
const password = ref('')
const errorText = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

definePageMeta({
  middleware: 'guest'
})

const submit = async () => {
  if (!email.value || !password.value) {
    errorText.value = 'Заполните все поля'
    return
  }

  isLoading.value = true
  errorText.value = ''

  try {
    await authStore.login(email.value, password.value)
    toast('С возвращением! 🌸', 'success')
    await navigateTo('/')
  } catch (error: any) {
    errorText.value = error?.data?.detail || 'Неверный email или пароль'
    toast(errorText.value, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <span class="text-5xl animate-float block mb-3">🌺</span>
          <span class="text-3xl font-['Playfair_Display'] font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            Vivien
          </span>
        </NuxtLink>
        <p class="text-gray-600 mt-2">Войдите в свой аккаунт</p>
      </div>

      <!-- Login Form -->
      <div class="card-soft p-8 space-y-5">
        <h1 class="text-2xl font-semibold text-gray-800 text-center">Вход</h1>

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
                   placeholder="••••••••"
                   @keyup.enter="submit" />
            <button @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
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
          {{ isLoading ? 'Входим...' : 'Войти' }}
        </button>

        <div class="text-center text-sm">
          <NuxtLink to="/register"
                    class="text-rose-600 hover:underline font-medium">
            Нет аккаунта? Зарегистрироваться →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
