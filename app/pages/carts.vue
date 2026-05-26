<script setup lang="ts">
const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const { toast } = useToast()

const newCartName = ref('')
const address = ref('')
const errorText = ref('')
const editingCart = ref<{ id: number; name: string } | null>(null)
const isProcessing = ref(false)

definePageMeta({
  middleware: 'auth'
})

const fillAddressFromProfile = (force = false) => {
  const profileAddress = authStore.profile?.address?.trim()
  if (!profileAddress) return
  if (force || !address.value.trim()) {
    address.value = profileAddress
  }
}

onMounted(async () => {
  await Promise.all([
    cartStore.fetchCarts(),
    authStore.profile ? Promise.resolve() : authStore.fetchProfile()
  ])
  fillAddressFromProfile()
})

watch(
  () => authStore.profile?.address,
  () => fillAddressFromProfile()
)

const createCart = async () => {
  if (!newCartName.value.trim()) {
    errorText.value = 'Введите название корзины'
    return
  }

  try {
    await cartStore.createCart(newCartName.value.trim())
    newCartName.value = ''
    errorText.value = ''
    toast('Корзина создана! 🎉', 'success')
  } catch (error: any) {
    errorText.value = error?.data?.detail || 'Не удалось создать корзину'
    toast(errorText.value, 'error')
  }
}

const renameCart = async (id: number, name: string) => {
  try {
    await cartStore.renameCart(id, name)
    editingCart.value = null
    toast('Корзина переименована ✏️', 'success')
  } catch (error: any) {
    toast('Не удалось переименовать корзину', 'error')
  }
}

const deleteCart = async (id: number, name: string) => {
  if (!confirm(`Удалить корзину "${name}"? Все товары будут удалены.`)) return

  try {
    await cartStore.deleteCart(id)
    toast('Корзина удалена 🗑️', 'success')
  } catch (error: any) {
    toast('Не удалось удалить корзину', 'error')
  }
}

const removePosition = async (positionId: number) => {
  try {
    await cartStore.removePosition(positionId)
    toast('Товар удален из корзины', 'success')
  } catch (error: any) {
    toast('Не удалось удалить товар', 'error')
  }
}

const submitOrder = async (cartId: number) => {
  if (!address.value.trim()) {
    errorText.value = 'Введите адрес доставки'
    return
  }

  isProcessing.value = true
  errorText.value = ''

  try {
    const order = await orderStore.createFromCart(cartId, address.value)
    toast('Заказ оформлен! 📦', 'success')
    await navigateTo(`/orders`)
  } catch (error: any) {
    errorText.value = error?.data?.non_field_errors?.[0] || error?.data?.detail || 'Не удалось оформить заказ'
    toast(errorText.value, 'error')
  } finally {
    isProcessing.value = false
  }
}

const calculateCartTotal = (cart: any) => {
  return cart.positions.reduce((total: number, pos: any) => {
    return total + (parseFloat(pos.product.price) * pos.quantity)
  }, 0)
}

const cartTotal = computed(() => {
  return cartStore.carts.reduce((total, cart) => total + calculateCartTotal(cart), 0)
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-['Playfair_Display'] font-bold text-gray-900">Мои корзины</h1>
        <p class="text-gray-600 mt-1">Управляйте вашими покупками</p>
      </div>
      <div v-if="cartStore.carts.length" class="badge text-lg px-4 py-2">
        {{ cartStore.carts.length }} корзин • {{ cartTotal }} ₽
      </div>
    </div>

    <!-- Create Cart -->
    <div class="card-soft p-6">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Новая корзина</label>
          <input v-model="newCartName"
                 class="input-field"
                 placeholder="Например: Летний гардероб"
                 @keyup.enter="createCart" />
        </div>
        <button @click="createCart"
                class="btn-primary flex items-center gap-2">
          <span>➕</span>
          Создать
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <Transition name="fade">
      <p v-if="errorText"
         class="card-soft p-4 text-sm text-red-600 bg-red-50 border-red-200 flex items-center gap-2">
        <span>⚠️</span>
        {{ errorText }}
        <button @click="errorText = ''" class="ml-auto text-red-400 hover:text-red-600">✕</button>
      </p>
    </Transition>

    <!-- Empty State -->
    <div v-if="!cartStore.carts.length" class="card-soft p-12 text-center">
      <div class="text-8xl mb-6 animate-float">🛍️</div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-3">У вас пока нет корзин</h2>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        Создайте корзину, чтобы начать добавлять товары и оформлять заказы
      </p>
      <NuxtLink to="/" class="btn-primary inline-flex items-center gap-2">
        <span>🌸</span>
        Перейти в каталог
      </NuxtLink>
    </div>

    <!-- Carts List -->
    <div class="space-y-6">
      <section v-for="cart in cartStore.carts" :key="cart.id"
               class="card-soft overflow-hidden">
        <!-- Cart Header -->
        <div class="p-6 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex-1">
              <div v-if="editingCart?.id === cart.id" class="flex items-center gap-2">
                <input v-model="editingCart.name"
                       class="input-field max-w-[300px] text-lg font-semibold"
                       @keyup.enter="renameCart(cart.id, editingCart.name)"
                       @keyup.escape="editingCart = null" />
                <button @click="renameCart(cart.id, editingCart.name)"
                        class="btn-primary text-sm py-2">✓</button>
                <button @click="editingCart = null"
                        class="btn-secondary text-sm py-2">✕</button>
              </div>
              <div v-else class="flex items-center gap-3">
                <h2 class="text-xl font-semibold">{{ cart.name }}</h2>
                <button @click="editingCart = { id: cart.id, name: cart.name }"
                        class="btn-icon text-sm opacity-50 hover:opacity-100">✏️</button>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ cart.positions.length }} товаров • {{ calculateCartTotal(cart) }} ₽
              </p>
            </div>
            <button @click="deleteCart(cart.id, cart.name)"
                    class="btn-secondary text-sm flex items-center gap-1">
              <span>🗑️</span>
              Удалить
            </button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="p-6">
          <div v-if="!cart.positions.length"
               class="text-center py-8 text-gray-500">
            <span class="text-4xl block mb-3">📦</span>
            <p>Корзина пуста</p>
            <NuxtLink to="/" class="text-rose-600 hover:underline mt-2 inline-block">
              Добавить товары →
            </NuxtLink>
          </div>

          <div v-else class="space-y-4">
            <article v-for="pos in cart.positions" :key="pos.id"
                     class="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white border border-rose-50 hover:shadow-md transition-all">
              <!-- Product Image -->
              <img :src="useMediaUrl(pos.product.preview)"
                   :alt="pos.product.name"
                   class="w-20 h-20 object-cover rounded-xl" />

              <!-- Product Info -->
              <div class="flex-1 min-w-[200px]">
                <NuxtLink :to="`/products/${pos.product.id}`"
                          class="font-semibold hover:text-rose-600 line-clamp-1">
                  {{ pos.product.name }}
                </NuxtLink>
                <p class="text-sm text-gray-600">
                  Размер: <span class="badge">{{ pos.size.value_russian }}</span>
                </p>
                <p class="text-rose-600 font-bold mt-1">
                  {{ (parseFloat(pos.product.price) * pos.quantity).toFixed(2) }} ₽
                </p>
              </div>

              <!-- Quantity -->
              <div class="flex items-center gap-2">
                <div class="flex items-center border-2 border-rose-100 rounded-xl overflow-hidden">
                  <button @click="cartStore.updatePosition(pos.id, {
                    cart: cart.id,
                    product: pos.product.id,
                    size: pos.size.id,
                    quantity: Math.max(1, pos.quantity - 1)
                  })"
                          class="px-3 py-1 hover:bg-rose-50 font-bold">−</button>
                  <span class="px-4 py-1 border-x-2 border-rose-100 min-w-[40px] text-center">
                    {{ pos.quantity }}
                  </span>
                  <button @click="cartStore.updatePosition(pos.id, {
                    cart: cart.id,
                    product: pos.product.id,
                    size: pos.size.id,
                    quantity: pos.quantity + 1
                  })"
                          class="px-3 py-1 hover:bg-rose-50 font-bold">+</button>
                </div>
              </div>

              <!-- Remove -->
              <button @click="removePosition(pos.id)"
                      class="btn-secondary text-sm py-2">
                🗑️
              </button>
            </article>
          </div>

          <!-- Order Section -->
          <div v-if="cart.positions.length"
               class="mt-6 pt-6 border-t border-rose-100">
            <div class="flex flex-wrap gap-3 items-end">
              <div class="flex-1 min-w-[250px]">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Адрес доставки
                </label>
                <input v-model="address"
                       class="input-field"
                       placeholder="Введите адрес доставки" />
              </div>
              <button @click="submitOrder(cart.id)"
                      :disabled="isProcessing"
                      class="btn-primary flex items-center gap-2">
                <span v-if="isProcessing" class="animate-spin">⏳</span>
                {{ isProcessing ? 'Оформляем...' : `Оформить заказ • ${calculateCartTotal(cart)} ₽` }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
