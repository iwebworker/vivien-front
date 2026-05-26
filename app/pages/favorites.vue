<script setup lang="ts">
const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()
const { toast } = useToast()
const cartStore = useCartStore()

definePageMeta({
  middleware: 'auth'
})

const selectedCartForAdd = ref<Record<number, number>>({})

onMounted(async () => {
  await favoriteStore.fetchFavorites()
  if (authStore.isAuthenticated) {
    await cartStore.fetchCarts()
  }
})

const removeFromFavorites = async (productId: number) => {
  await favoriteStore.remove(productId)
  toast('Удалено из избранного', 'success')
}

const addToCart = async (productId: number) => {
  try {
    if (!cartStore.carts.length) {
      await cartStore.createCart('Моя корзина')
    }

    const product = await $fetch<any>(`${useRuntimeConfig().public.apiBase}/shop/products/${productId}/`)
    const sizeId = product.dimensions?.[0]?.id

    if (!sizeId) {
      toast('Нет доступных размеров', 'error')
      return
    }

    const cartId = selectedCartForAdd.value[productId] || cartStore.selectedCartId || cartStore.carts[0]?.id
    if (!cartId) {
      toast('Выберите корзину', 'error')
      return
    }

    await cartStore.addProduct(cartId, productId, sizeId, 1)
    toast('Добавлено в корзину! 🛍️', 'success')
  } catch (error: any) {
    toast('Не удалось добавить в корзину', 'error')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-['Playfair_Display'] font-bold text-gray-900">Избранное</h1>
        <p class="text-gray-600 mt-1">
          {{ favoriteStore.favorites.length }}
          {{ favoriteStore.favorites.length === 1 ? 'товар' :
            favoriteStore.favorites.length < 5 ? 'товара' : 'товаров' }}
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!favoriteStore.favorites.length" class="card-soft p-12 text-center">
      <div class="text-8xl mb-6 animate-float">💝</div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-3">Здесь пока пусто</h2>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        Добавляйте понравившиеся товары в избранное, чтобы не потерять их
      </p>
      <NuxtLink to="/" class="btn-primary inline-flex items-center gap-2">
        <span>🌸</span>
        Перейти в каталог
      </NuxtLink>
    </div>

    <!-- Favorites Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article v-for="item in favoriteStore.favorites" :key="item.id"
               class="card-soft overflow-hidden group">
        <!-- Product Image -->
        <div class="relative h-64 overflow-hidden">
          <img :src="useMediaUrl(item.product.preview)"
               :alt="item.product.name"
               class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

          <!-- Remove Button -->
          <button @click="removeFromFavorites(item.product.id)"
                  class="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600">
            ✕
          </button>

          <!-- Rating -->
          <div v-if="item.product.average_rating"
               class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
            <span class="text-amber-400">★</span>
            <span>{{ item.product.average_rating }}</span>
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-4">
          <NuxtLink :to="`/products/${item.product.id}`"
                    class="text-lg font-semibold text-gray-900 hover:text-rose-600 line-clamp-2 block mb-2">
            {{ item.product.name }}
          </NuxtLink>

          <p class="text-sm text-gray-600 line-clamp-2 mb-3">
            {{ item.product.description }}
          </p>

          <p class="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent mb-3">
            {{ item.product.price }} ₽
          </p>

          <!-- Cart Selection -->
          <select v-if="cartStore.carts.length"
                  v-model.number="selectedCartForAdd[item.product.id]"
                  class="select-field text-sm mb-2">
            <option :value="undefined">Выбрать корзину</option>
            <option v-for="cart in cartStore.carts" :key="cart.id" :value="cart.id">
              {{ cart.name }}
            </option>
          </select>

          <!-- Actions -->
          <div class="flex gap-2">
            <button @click="addToCart(item.product.id)"
                    class="btn-primary flex-1 text-sm">
              В корзину
            </button>
            <button @click="removeFromFavorites(item.product.id)"
                    class="btn-secondary px-3 text-sm">
              🗑️
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>