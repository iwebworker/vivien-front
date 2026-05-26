<script setup lang="ts">
const orderStore = useOrderStore()
const authStore = useAuthStore()
const { toast } = useToast()

definePageMeta({
  middleware: 'auth'
})

const expandedOrder = ref<number | null>(null)
const filterStatus = ref<string>('all')
const isLoading = ref(false)

onMounted(async () => {
  await orderStore.fetchOrders()
})

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  'pending': { label: 'В обработке', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
  'confirmed': { label: 'Подтвержден', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✅' },
  'processing': { label: 'Собирается', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '📦' },
  'shipped': { label: 'В пути', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🚚' },
  'delivered': { label: 'Доставлен', color: 'bg-green-100 text-green-800 border-green-200', icon: '🎉' },
  'cancelled': { label: 'Отменен', color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' },
}

const getStatusInfo = (status: string) => {
  return statusLabels[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋' }
}

const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') return orderStore.orders

  if (filterStatus.value === 'active') {
    return orderStore.orders.filter(o =>
        ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
    )
  }

  return orderStore.orders.filter(o => o.status === filterStatus.value)
})

const cancelOrder = async (orderId: number) => {
  if (!confirm('Вы уверены, что хотите отменить заказ?')) return

  try {
    const { request } = useApi()
    await request(`/shop/orders/${orderId}/cancel/`, 'POST', {}, true)
    await orderStore.fetchOrders()
    toast('Заказ отменен', 'success')
  } catch (error: any) {
    toast('Не удалось отменить заказ', 'error')
  }
}

const calculateTotal = (order: any) => {
  return order.items.reduce((total: number, item: any) => {
    return total + (parseFloat(item.price) * item.quantity)
  }, 0)
}

const totalSpent = computed(() => {
  return orderStore.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((total, order) => total + calculateTotal(order), 0)
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-['Playfair_Display'] font-bold text-gray-900">Мои заказы</h1>
        <p class="text-gray-600 mt-1">
          {{ orderStore.orders.length }} заказов • Потрачено: {{ totalSpent }} ₽
        </p>
      </div>
    </div>

    <section
      class="card-soft p-5 border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 shadow-lg"
      aria-label="Контакты по вопросам заказа и оплаты"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-rose-700 mb-2">Важно</p>
      <p class="text-gray-800 font-semibold">
        По всем вопросам, связанным с заказом и оплатой, свяжитесь с Алиной:
      </p>
      <a href="tel:89851855173" class="mt-2 inline-flex items-center gap-2 text-xl font-bold text-rose-700 hover:text-rose-800">
        <span>📞</span>
        8 (985) 185-51-73
      </a>
    </section>

    <!-- Stats Cards -->
    <div v-if="orderStore.orders.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card-soft p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ orderStore.orders.length }}</div>
        <div class="text-sm text-gray-600">Всего заказов</div>
      </div>
      <div class="card-soft p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">
          {{ orderStore.orders.filter(o => ['shipped', 'delivered'].includes(o.status)).length }}
        </div>
        <div class="text-sm text-gray-600">Доставлено</div>
      </div>
      <div class="card-soft p-4 text-center">
        <div class="text-2xl font-bold text-yellow-600">
          {{ orderStore.orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length }}
        </div>
        <div class="text-sm text-gray-600">В обработке</div>
      </div>
      <div class="card-soft p-4 text-center">
        <div class="text-2xl font-bold text-rose-600">{{ totalSpent }}</div>
        <div class="text-sm text-gray-600">Потрачено ₽</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <button v-for="(filter, key) in [
        { key: 'all', label: 'Все' },
        { key: 'active', label: 'Активные' },
        { key: 'pending', label: 'В обработке' },
        { key: 'shipped', label: 'В пути' },
        { key: 'delivered', label: 'Доставленные' },
        { key: 'cancelled', label: 'Отмененные' },
      ]" :key="key"
              @click="filterStatus = filter.key"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
              :class="filterStatus === filter.key
        ? 'bg-rose-500 text-white shadow-lg'
        : 'bg-white border border-rose-100 text-gray-600 hover:bg-rose-50'">
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="card-soft p-6">
        <div class="skeleton h-6 w-48 mb-4"></div>
        <div class="skeleton h-4 w-full mb-2"></div>
        <div class="skeleton h-4 w-3/4"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !filteredOrders.length" class="card-soft p-12 text-center">
      <div class="text-8xl mb-6 animate-float">📭</div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-3">
        {{ filterStatus === 'all' ? 'У вас пока нет заказов' : 'Нет заказов с таким статусом' }}
      </h2>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        {{ filterStatus === 'all'
          ? 'Оформите свой первый заказ и он появится здесь'
          : 'Попробуйте выбрать другой фильтр' }}
      </p>
      <NuxtLink v-if="filterStatus === 'all'" to="/carts"
                class="btn-primary inline-flex items-center gap-2">
        <span>🛍️</span>
        Перейти в корзины
      </NuxtLink>
    </div>

    <!-- Orders List -->
    <div class="space-y-6">
      <TransitionGroup name="list">
        <article v-for="order in filteredOrders" :key="order.id"
                 class="card-soft overflow-hidden">
          <!-- Order Header -->
          <div @click="expandedOrder = expandedOrder === order.id ? null : order.id"
               class="p-6 cursor-pointer hover:bg-rose-50/50 transition-all">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl">
                  {{ getStatusInfo(order.status).icon }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold">Заказ №{{ order.id }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ new Date(order.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <span class="px-4 py-1 rounded-full text-sm font-medium border"
                      :class="getStatusInfo(order.status).color">
                  {{ getStatusInfo(order.status).label }}
                </span>
                <p class="text-xl font-bold text-rose-600">
                  {{ order.total_price || calculateTotal(order) }} ₽
                </p>
                <span class="transform transition-transform duration-300 text-2xl"
                      :class="{ 'rotate-180': expandedOrder === order.id }">
                  ▼
                </span>
              </div>
            </div>
          </div>

          <!-- Order Details (Expandable) -->
          <Transition name="expand">
            <div v-if="expandedOrder === order.id"
                 class="border-t border-rose-100 p-6 bg-white/50">

              <!-- Delivery Info -->
              <div class="grid md:grid-cols-2 gap-4 mb-6">
                <div class="p-4 rounded-xl bg-rose-50">
                  <h4 class="font-semibold text-gray-800 mb-2">📍 Адрес доставки</h4>
                  <p class="text-gray-600">{{ order.address }}</p>
                </div>
                <div class="p-4 rounded-xl bg-rose-50">
                  <h4 class="font-semibold text-gray-800 mb-2">💳 Информация о заказе</h4>
                  <p class="text-gray-600">Статус: {{ getStatusInfo(order.status).label }}</p>
                  <p class="text-gray-600">Сумма: {{ order.total_price || calculateTotal(order) }} ₽</p>
                  <p class="text-gray-600">Товаров: {{ order.items.length }}</p>
                </div>
              </div>

              <!-- Items List -->
              <div class="space-y-3">
                <h4 class="font-semibold text-gray-800">🛍️ Товары в заказе</h4>
                <div v-for="item in order.items" :key="item.id"
                     class="flex items-center gap-4 p-3 rounded-xl bg-white border border-rose-50">
                  <img v-if="item.product.preview"
                       :src="useMediaUrl(item.product.preview)"
                       :alt="item.product.name"
                       class="w-16 h-16 object-cover rounded-lg" />
                  <div class="flex-1">
                    <NuxtLink :to="`/products/${item.product.id}`"
                              class="font-medium hover:text-rose-600 line-clamp-1">
                      {{ item.product.name }}
                    </NuxtLink>
                    <p class="text-sm text-gray-600">
                      Размер: {{ item.size.value_russian }} •
                      {{ item.quantity }} шт. × {{ item.price }} ₽
                    </p>
                  </div>
                  <p class="font-bold text-rose-600">
                    {{ (parseFloat(item.price) * item.quantity).toFixed(2) }} ₽
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div v-if="['pending', 'confirmed'].includes(order.status)"
                   class="mt-6 flex justify-end gap-3">
                <button @click="cancelOrder(order.id)"
                        class="btn-secondary text-sm">
                  Отменить заказ
                </button>
              </div>
            </div>
          </Transition>
        </article>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
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