<script setup lang="ts">
import type { UserProfileUpdatePayload } from '~/types/api'

const authStore = useAuthStore()
const { toast } = useToast()

definePageMeta({
  middleware: 'auth'
})

const form = ref<UserProfileUpdatePayload>({
  first_name: '',
  last_name: '',
  patronymic: '',
  email: '',
  address: '',
  phone_number: ''
})
const isLoading = ref(false)
const isSaving = ref(false)
const fieldError = ref('')

const fullNamePreview = computed(() => {
  const lastName = form.value.last_name?.trim() || ''
  const firstName = form.value.first_name?.trim() || ''
  const patronymic = form.value.patronymic?.trim() || ''
  return [lastName, firstName, patronymic].filter(Boolean).join(' ')
})

const fillFormFromProfile = () => {
  const profile = authStore.profile || {}
  form.value = {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    patronymic: profile.patronymic || '',
    email: profile.email || '',
    address: profile.address || '',
    phone_number: profile.phone_number || ''
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    if (!authStore.profile) {
      await authStore.fetchProfile()
    }
    fillFormFromProfile()
  } finally {
    isLoading.value = false
  }
})

const submit = async () => {
  fieldError.value = ''
  isSaving.value = true
  try {
    const payload: UserProfileUpdatePayload = {
      first_name: form.value.first_name?.trim() || '',
      last_name: form.value.last_name?.trim() || '',
      patronymic: form.value.patronymic?.trim() || '',
      email: form.value.email?.trim() || '',
      address: form.value.address?.trim() || '',
      phone_number: form.value.phone_number?.trim() || ''
    }
    await authStore.updateProfile(payload)
    fillFormFromProfile()
    toast('Профиль успешно обновлен ✨', 'success')
  } catch (error: any) {
    const data = error?.data
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0]
      const firstValue = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
      fieldError.value = String(firstValue || 'Не удалось обновить профиль')
    } else {
      fieldError.value = 'Не удалось обновить профиль'
    }
    toast(fieldError.value, 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <header class="card-soft p-6">
      <h1 class="text-3xl font-['Playfair_Display'] font-bold text-gray-900">Профиль</h1>
      <p class="text-gray-600 mt-2">Заполните личные данные для удобного оформления заказов.</p>
      <p v-if="fullNamePreview" class="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-sm">
        <span>👤</span>
        {{ fullNamePreview }}
      </p>
    </header>

    <section class="card-soft p-6">
      <div v-if="isLoading" class="text-gray-600">Загружаем данные профиля...</div>
      <form v-else class="space-y-4" @submit.prevent="submit">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Фамилия</label>
            <input v-model="form.last_name" class="input-field" placeholder="Иванов" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Имя</label>
            <input v-model="form.first_name" class="input-field" placeholder="Иван" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Отчество</label>
          <input v-model="form.patronymic" class="input-field" placeholder="Иванович" />
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="name@email.com" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
            <input v-model="form.phone_number" class="input-field" placeholder="+79991234567" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Адрес доставки</label>
          <input v-model="form.address" class="input-field" placeholder="г. Москва, ул. Пример, д. 10" />
        </div>

        <p v-if="fieldError" class="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{{ fieldError }}</p>

        <button class="btn-primary w-full md:w-auto" :disabled="isSaving" type="submit">
          {{ isSaving ? 'Сохраняем...' : 'Сохранить профиль' }}
        </button>
      </form>
    </section>
  </div>
</template>
