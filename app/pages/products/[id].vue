<script setup lang="ts">
import type { ReviewReportPayload } from '~/types/api'

const route = useRoute()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()
const { toast } = useToast()

const quantity = ref(1)
const selectedSizeId = ref<number | null>(null)
const selectedCartId = ref<number | null>(null)
const errorText = ref('')
const isAddingToCart = ref(false)
const reviewForm = ref({
  rating: 5,
  advantages: '',
  disadvantages: '',
  comment: ''
})
const reviewPhotos = ref<File[]>([])
const reviewPhotoPreviewUrls = ref<string[]>([])
const selectedMediaIndex = ref(0)
const isDescriptionExpanded = ref(false) // <-- Состояние для описания
const activeReportReviewId = ref<number | null>(null)
const reportReason = ref('')
const reportingReviewId = ref<number | null>(null)
const lightbox = ref<{
  isOpen: boolean
  title: string
  items: string[]
  index: number
}>({
  isOpen: false,
  title: '',
  items: [],
  index: 0
})

const getMediaKind = (path: string) => {
  if (!path) return 'image'
  const normalizedPath = path.split('?')[0]?.toLowerCase()
  if (!normalizedPath) return 'image'
  const videoExtensions = new Set(['mp4', 'webm', 'ogg', 'mov', 'm4v', 'avi', 'mkv'])
  return videoExtensions.has(normalizedPath.split('.').pop() || '') ? 'video' : 'image'
}

const mediaItems = computed(() => {
  const product = catalogStore.currentProduct
  if (!product) return []

  const result: Array<{ id: string; path: string; kind: 'image' | 'video' }> = []

  if (product.preview) {
    result.push({ id: `preview-${product.id}`, path: product.preview, kind: 'image' })
  }

  for (const item of product.examples || []) {
    if (!item.example) continue
    result.push({ id: `example-${item.id}`, path: item.example, kind: getMediaKind(item.example) })
  }

  return result
})

// *** ИСПРАВЛЕНИЕ: Делаем selectedMediaUrl вычисляемым свойством ***
const selectedMediaUrl = computed(() => {
  if (!mediaItems.value.length) return ''
  // Убедимся, что индекс не выходит за границы
  const index = Math.min(selectedMediaIndex.value, mediaItems.value.length - 1)
  return useMediaUrl(mediaItems.value[index]?.path || '')
})

const productImageUrls = computed(() =>
    mediaItems.value
        .filter((item) => item.kind === 'image')
        .map((item) => useMediaUrl(item.path))
)

// Удаляем старый watch, который больше не нужен
// watch(mediaItems, (items) => { ... })

const navigateMedia = (direction: 'prev' | 'next') => {
  if (!mediaItems.value.length) return
  if (direction === 'prev') {
    selectedMediaIndex.value = selectedMediaIndex.value === 0
        ? mediaItems.value.length - 1
        : selectedMediaIndex.value - 1
  } else {
    selectedMediaIndex.value = selectedMediaIndex.value === mediaItems.value.length - 1
        ? 0
        : selectedMediaIndex.value + 1
  }
}

const openLightbox = (items: string[], index: number, title: string) => {
  if (!items.length) return
  lightbox.value = {
    isOpen: true,
    title,
    items,
    index: Math.min(Math.max(index, 0), items.length - 1)
  }
}

const closeLightbox = () => {
  lightbox.value.isOpen = false
}

const navigateLightbox = (direction: 'prev' | 'next') => {
  if (!lightbox.value.items.length) return
  if (direction === 'prev') {
    lightbox.value.index = lightbox.value.index === 0
        ? lightbox.value.items.length - 1
        : lightbox.value.index - 1
  } else {
    lightbox.value.index = lightbox.value.index === lightbox.value.items.length - 1
        ? 0
        : lightbox.value.index + 1
  }
}

const openProductGallery = (index: number) => {
  openLightbox(productImageUrls.value, index, 'Фотографии товара')
}

const openProductGalleryByCurrentImage = () => {
  const currentPath = mediaItems.value[selectedMediaIndex.value]?.path
  if (!currentPath || mediaItems.value[selectedMediaIndex.value]?.kind !== 'image') return
  const currentUrl = useMediaUrl(currentPath)
  const index = productImageUrls.value.findIndex((url) => url === currentUrl)
  openProductGallery(Math.max(index, 0))
}

const openReviewGallery = (photoUrls: string[], index: number) => {
  openLightbox(photoUrls, index, 'Фотографии из отзыва')
}

onMounted(async () => {
  await catalogStore.fetchProduct(Number(route.params.id))
  if (catalogStore.currentProduct?.dimensions?.length) {
    const firstDimension = catalogStore.currentProduct.dimensions[0]
    if (firstDimension) selectedSizeId.value = firstDimension.id
  }
  if (authStore.isAuthenticated) {
    await Promise.all([cartStore.fetchCarts(), favoriteStore.fetchFavorites()])
    selectedCartId.value = cartStore.selectedCartId
  }
})

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  if (!selectedSizeId.value) {
    errorText.value = 'Пожалуйста, выберите размер'
    return
  }

  isAddingToCart.value = true
  errorText.value = ''

  try {
    if (!cartStore.carts.length) {
      await cartStore.createCart('Моя корзина')
    }

    const targetCartId = selectedCartId.value || cartStore.selectedCartId
    if (!targetCartId) {
      errorText.value = 'Выберите корзину'
      return
    }

    await cartStore.addProduct(targetCartId, Number(route.params.id), selectedSizeId.value, quantity.value)
    toast('Товар добавлен в корзину! 🎉', 'success')
  } catch (error: any) {
    errorText.value = error?.data?.detail || 'Не удалось добавить в корзину'
    toast(errorText.value, 'error')
  } finally {
    isAddingToCart.value = false
  }
}

const targetCartId = computed(() => selectedCartId.value || cartStore.selectedCartId)

const selectedCart = computed(() =>
  cartStore.carts.find((cart) => cart.id === targetCartId.value) || null
)

const selectedCartPosition = computed(() => {
  const cart = selectedCart.value
  const product = catalogStore.currentProduct
  const sizeId = selectedSizeId.value
  if (!cart || !product || !sizeId) return null

  return (
    cart.positions.find(
      (position) => position.product.id === product.id && position.size.id === sizeId
    ) || null
  )
})

const isInSelectedCart = computed(() => Boolean(selectedCartPosition.value))

const handleCartAction = async () => {
  if (!authStore.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  if (!selectedSizeId.value) {
    errorText.value = 'Пожалуйста, выберите размер'
    return
  }

  if (isInSelectedCart.value && selectedCartPosition.value) {
    isAddingToCart.value = true
    errorText.value = ''
    try {
      await cartStore.removePosition(selectedCartPosition.value.id)
      toast('Товар удален из корзины', 'success')
    } catch (error: any) {
      errorText.value = error?.data?.detail || 'Не удалось удалить из корзины'
      toast(errorText.value, 'error')
    } finally {
      isAddingToCart.value = false
    }
    return
  }

  await addToCart()
}

const submitReview = async () => {
  if (!authStore.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  try {
    const { request } = useApi()
    const formData = new FormData()
    formData.append('rating', String(reviewForm.value.rating))
    formData.append('advantages', reviewForm.value.advantages)
    formData.append('disadvantages', reviewForm.value.disadvantages)
    formData.append('comment', reviewForm.value.comment)
    formData.append('product_id', String(route.params.id))
    reviewPhotos.value.forEach((file) => formData.append('photos', file))

    await request('/shop/reviews/', 'POST', formData, true)
    reviewForm.value = { rating: 5, advantages: '', disadvantages: '', comment: '' }
    reviewPhotos.value = []
    reviewPhotoPreviewUrls.value.forEach((url) => URL.revokeObjectURL(url))
    reviewPhotoPreviewUrls.value = []
    await catalogStore.fetchProduct(Number(route.params.id))
    toast('Спасибо за ваш отзыв! 🌟', 'success')
  } catch (error: any) {
    toast('Не удалось отправить отзыв', 'error')
  }
}

const onReviewPhotosSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  reviewPhotoPreviewUrls.value.forEach((url) => URL.revokeObjectURL(url))
  reviewPhotos.value = files
  reviewPhotoPreviewUrls.value = files.map((file) => URL.createObjectURL(file))
}

const removeReviewPhoto = (index: number) => {
  const url = reviewPhotoPreviewUrls.value[index]
  if (url) {
    URL.revokeObjectURL(url)
  }
  reviewPhotos.value = reviewPhotos.value.filter((_, i) => i !== index)
  reviewPhotoPreviewUrls.value = reviewPhotoPreviewUrls.value.filter((_, i) => i !== index)
}

const handleFavoriteToggle = async () => {
  if (!authStore.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  const isCurrentlyFavorite = favoriteStore.favoriteIds.has(catalogStore.currentProduct!.id)
  await favoriteStore.toggle(catalogStore.currentProduct!.id)
  toast(isCurrentlyFavorite ? 'Удалено из избранного' : 'Добавлено в избранное ❤️', 'success')
}

const openReportForm = async (reviewId: number) => {
  if (!authStore.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  activeReportReviewId.value = reviewId
  reportReason.value = ''
}

const cancelReport = () => {
  activeReportReviewId.value = null
  reportReason.value = ''
}

const submitReviewReport = async (reviewId: number) => {
  if (!reportReason.value.trim()) {
    toast('Опишите причину жалобы', 'error')
    return
  }

  const payload: ReviewReportPayload = {
    review_id: reviewId,
    reason: reportReason.value.trim()
  }

  try {
    reportingReviewId.value = reviewId
    const { request } = useApi()
    await request('/shop/review-reports/', 'POST', payload, true)
    toast('Жалоба отправлена. Спасибо за сигнал 💌', 'success')
    cancelReport()
  } catch {
    toast('Не удалось отправить жалобу', 'error')
  } finally {
    reportingReviewId.value = null
  }
}

// Сброс индекса при смене товара (на всякий случай)
watch(() => catalogStore.currentProduct, () => {
  selectedMediaIndex.value = 0
  isDescriptionExpanded.value = false
})

onBeforeUnmount(() => {
  reviewPhotoPreviewUrls.value.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div v-if="catalogStore.currentProduct" class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center space-x-2 text-sm text-gray-600">
      <NuxtLink to="/" class="hover:text-rose-600">Каталог</NuxtLink>
      <span>/</span>
      <NuxtLink to="/" class="hover:text-rose-600">Женская одежда</NuxtLink>
      <span>/</span>
      <span class="text-gray-800 font-medium truncate">{{ catalogStore.currentProduct.name }}</span>
    </nav>

    <!-- Product Section -->
    <section class="grid gap-8 lg:grid-cols-2">
      <!-- *** ИЗМЕНЕНИЕ: Добавлены классы для sticky *** -->
      <div class="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div class="card-soft overflow-hidden relative group">
          <div class="relative aspect-[3/4]">
            <img
                v-if="mediaItems[selectedMediaIndex]?.kind === 'image'"
                :src="selectedMediaUrl"
                :alt="catalogStore.currentProduct.name"
                class="w-full h-full object-cover cursor-zoom-in"
                @click="openProductGalleryByCurrentImage"
            />
            <video
                v-else
                :src="selectedMediaUrl"
                class="w-full h-full object-cover"
                controls
                preload="metadata"
            />

            <!-- Navigation Arrows -->
            <button v-if="mediaItems.length > 1"
                    @click="navigateMedia('prev')"
                    class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
              ←
            </button>
            <button v-if="mediaItems.length > 1"
                    @click="navigateMedia('next')"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
              →
            </button>
          </div>
        </div>

        <!-- Thumbnails -->
        <div v-if="mediaItems.length > 1" class="grid grid-cols-5 gap-2">
          <button
              v-for="(item, index) in mediaItems"
              :key="item.id"
              @click="selectedMediaIndex = index"
              class="relative overflow-hidden rounded-xl border-2 transition-all duration-300"
              :class="index === selectedMediaIndex ? 'border-rose-500 shadow-lg' : 'border-white/60 hover:border-rose-300'"
          >
            <img
                v-if="item.kind === 'image'"
                :src="useMediaUrl(item.path)"
                class="h-20 w-full object-cover"
                @click.stop="openProductGallery(mediaItems.filter((media) => media.kind === 'image').findIndex((media) => useMediaUrl(media.path) === useMediaUrl(item.path)))"
            />
            <div v-else class="flex h-20 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-xs text-white">
              ▶ Видео
            </div>
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="card-soft p-8 space-y-6">
        <div>
          <h1 class="text-4xl font-['Playfair_Display'] font-bold text-gray-900">
            {{ catalogStore.currentProduct.name }}
          </h1>
          <div class="flex items-center gap-2 mt-2">
            <div class="flex text-amber-400">
              <span v-for="i in 5" :key="i">★</span>
            </div>
            <span class="text-sm text-gray-600">
              {{ catalogStore.currentProduct.average_rating || '0' }} / 5
            </span>
          </div>
        </div>

        <p class="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
          {{ catalogStore.currentProduct.price }} ₽
        </p>

        <!-- *** ИЗМЕНЕНИЕ: Блок с раскрывающимся описанием *** -->
        <div>
          <p
              class="text-gray-600 leading-relaxed text-sm"
              :class="{ 'line-clamp-4': !isDescriptionExpanded }"
          >
            {{ catalogStore.currentProduct.description }}
          </p>
          <button
              v-if="catalogStore.currentProduct.description && catalogStore.currentProduct.description.length > 200"
              @click="isDescriptionExpanded = !isDescriptionExpanded"
              class="mt-2 text-rose-600 hover:text-rose-700 font-medium text-sm transition-colors"
          >
            {{ isDescriptionExpanded ? 'Скрыть' : 'Показать всё' }}
          </button>
        </div>

        <!-- Size Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">Размер</label>
          <div class="flex flex-wrap gap-2">
            <button
                v-for="size in catalogStore.currentProduct.dimensions"
                :key="size.id"
                @click="selectedSizeId = size.id"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                :class="selectedSizeId === size.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/50'
                : 'bg-white border-2 border-rose-100 hover:border-rose-300 text-gray-700'"
            >
              {{ size.value_russian }}
            </button>
          </div>
        </div>

        <!-- Add to Cart Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="flex items-center border-2 border-rose-100 rounded-xl overflow-hidden">
              <button @click="quantity = Math.max(1, quantity - 1)"
                      class="px-3 py-2 hover:bg-rose-50 font-bold text-gray-600">−</button>
              <input v-model.number="quantity"
                     class="w-16 text-center py-2 border-x-2 border-rose-100 outline-none"
                     min="1" type="number" />
              <button @click="quantity++"
                      class="px-3 py-2 hover:bg-rose-50 font-bold text-gray-600">+</button>
            </div>

            <select v-if="authStore.isAuthenticated" v-model.number="selectedCartId"
                    class="select-field flex-1">
              <option :value="null">Выберите корзину</option>
              <option v-for="cart in cartStore.carts" :key="cart.id" :value="cart.id">
                {{ cart.name }}
              </option>
            </select>
          </div>

          <div class="flex gap-2">
            <button @click="handleCartAction"
                    :disabled="isAddingToCart"
                    class="btn-primary flex-1 flex items-center justify-center gap-2">
              <span v-if="isAddingToCart" class="animate-spin">⏳</span>
              {{ isAddingToCart ? (isInSelectedCart ? 'Удаляем...' : 'Добавляем...') : (isInSelectedCart ? 'Удалить из корзины' : 'Добавить в корзину') }}
            </button>

            <button @click="handleFavoriteToggle"
                    class="btn-secondary flex items-center gap-2">
              <span>{{ favoriteStore.favoriteIds.has(catalogStore.currentProduct.id) ? '❤️' : '🤍' }}</span>
            </button>
          </div>

          <p v-if="errorText" class="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{{ errorText }}</p>
        </div>

        <!-- Quick Info -->
        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-rose-100">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>🚚</span> Бесплатная доставка
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>🔄</span> 30 дней возврат
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>✨</span> Оригинальное качество
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>🔒</span> Безопасная оплата
          </div>
        </div>
      </div>
    </section>

    <!-- Product Details Tabs -->
    <section class="card-soft p-8">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-4">
            Характеристики
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div v-for="section in catalogStore.currentProduct.attributes"
                 :key="section.id"
                 class="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50">
              <h3 class="font-semibold text-rose-800 mb-3">{{ section.category }}</h3>
              <ul class="space-y-2">
                <li v-for="attr in section.attributes"
                    :key="attr.id"
                    class="flex justify-between text-sm text-gray-700">
                  <span class="text-gray-600">{{ attr.name }}</span>
                  <span class="font-medium">{{ attr.value }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="card-soft p-8">
      <h2 class="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
        Отзывы покупателей
      </h2>

      <!-- Existing Reviews -->
      <div class="space-y-4 mb-8">
        <article v-for="review in catalogStore.currentProduct.reviews"
                 :key="review.id"
                 class="p-5 rounded-2xl bg-gradient-to-br from-rose-50/50 to-white border border-rose-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                {{ review.user.email.toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold">{{ review.user.first_name || review.user.email }}</p>
                <p class="text-xs text-gray-500">
                  {{ review.created_at ? new Date(review.created_at).toLocaleDateString('ru-RU') : '' }}
                </p>
              </div>
            </div>
            <div class="flex text-amber-400">
              <span v-for="i in review.rating" :key="i">★</span>
              <span v-for="i in (5 - review.rating)" :key="i" class="text-gray-300">★</span>
            </div>
          </div>

          <div v-if="review.advantages" class="mb-2">
            <span class="text-green-600 font-medium text-sm">✓ Достоинства:</span>
            <p class="text-sm text-gray-700 ml-4">{{ review.advantages }}</p>
          </div>

          <div v-if="review.disadvantages" class="mb-2">
            <span class="text-red-600 font-medium text-sm">✗ Недостатки:</span>
            <p class="text-sm text-gray-700 ml-4">{{ review.disadvantages }}</p>
          </div>

          <p class="text-gray-800 mt-2">{{ review.comment }}</p>

          <div v-if="review.photos?.length" class="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <button
                v-for="(photo, photoIndex) in review.photos"
                :key="photo.id"
                type="button"
                @click="openReviewGallery(review.photos.map((item) => useMediaUrl(item.photo)), photoIndex)"
                class="block overflow-hidden rounded-xl border border-rose-100 hover:border-rose-300 transition-colors"
            >
              <img
                  :src="useMediaUrl(photo.photo)"
                  alt="Фото из отзыва"
                  class="h-24 w-full object-cover"
              />
            </button>
          </div>

          <div class="mt-4 pt-3 border-t border-rose-100">
            <button
                v-if="activeReportReviewId !== review.id"
                @click="openReportForm(review.id)"
                class="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Пожаловаться на отзыв
            </button>

            <div v-else class="space-y-2">
              <textarea
                  v-model="reportReason"
                  class="input-field min-h-[90px]"
                  placeholder="Опишите причину жалобы"
              />
              <div class="flex items-center gap-2">
                <button
                    @click="submitReviewReport(review.id)"
                    :disabled="reportingReviewId === review.id"
                    class="btn-primary text-sm"
                >
                  {{ reportingReviewId === review.id ? 'Отправляем...' : 'Отправить жалобу' }}
                </button>
                <button
                    @click="cancelReport"
                    type="button"
                    class="btn-secondary text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Review Form -->
      <div class="border-t border-rose-100 pt-6">
        <h3 class="text-xl font-semibold mb-4">Оставить отзыв ✍️</h3>

        <div class="space-y-4">
          <!-- Rating Stars -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">Оценка:</span>
            <div class="flex gap-1">
              <button v-for="star in 5" :key="star"
                      @click="reviewForm.rating = star"
                      class="text-2xl transition-all duration-200 hover:scale-110"
                      :class="star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'">
                ★
              </button>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <input v-model="reviewForm.advantages"
                   class="input-field"
                   placeholder="Достоинства ✓" />
            <input v-model="reviewForm.disadvantages"
                   class="input-field"
                   placeholder="Недостатки ✗" />
          </div>

          <textarea v-model="reviewForm.comment"
                    class="input-field min-h-[100px]"
                    placeholder="Ваш комментарий... 💭" />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Фотографии (необязательно)</label>
            <input
                type="file"
                accept="image/*"
                multiple
                @change="onReviewPhotosSelected"
                class="block w-full text-sm text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:text-rose-700 hover:file:bg-rose-200"
            />
            <div v-if="reviewPhotoPreviewUrls.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <div
                  v-for="(previewUrl, index) in reviewPhotoPreviewUrls"
                  :key="previewUrl"
                  class="relative overflow-hidden rounded-xl border border-rose-100"
              >
                <img :src="previewUrl" alt="Предпросмотр фото" class="h-24 w-full object-cover" />
                <button
                    @click="removeReviewPhoto(index)"
                    type="button"
                    class="absolute top-1 right-1 rounded-full bg-white/90 px-2 py-1 text-xs text-gray-700 hover:bg-white"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <button @click="submitReview"
                  class="btn-primary w-full">
            Отправить отзыв ✨
          </button>
        </div>
      </div>
    </section>
  </div>

  <!-- Loading State -->
  <div v-else class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <div class="text-6xl animate-bounce mb-4">🌸</div>
      <p class="text-xl text-gray-600">Загружаем товар...</p>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div
          v-if="lightbox.isOpen"
          class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="closeLightbox"
      >
        <div class="relative w-full max-w-5xl">
          <button
              type="button"
              class="absolute -top-12 right-0 text-white/90 hover:text-white text-3xl leading-none"
              @click="closeLightbox"
          >
            ✕
          </button>

          <div class="absolute -top-10 left-0 text-white/80 text-sm">
            {{ lightbox.title }} • {{ lightbox.index + 1 }} / {{ lightbox.items.length }}
          </div>

          <img
              :src="lightbox.items[lightbox.index]"
              alt="Фото"
              class="max-h-[80vh] w-full object-contain rounded-2xl shadow-2xl"
          />

          <button
              v-if="lightbox.items.length > 1"
              type="button"
              class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white text-gray-800 w-11 h-11 text-xl shadow-lg"
              @click.stop="navigateLightbox('prev')"
          >
            ←
          </button>
          <button
              v-if="lightbox.items.length > 1"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white text-gray-800 w-11 h-11 text-xl shadow-lg"
              @click.stop="navigateLightbox('next')"
          >
            →
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>