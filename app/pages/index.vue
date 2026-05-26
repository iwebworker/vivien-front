<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-purple-500 p-6 md:p-8 text-white shadow-lg shadow-purple-200/30">
      <!-- Декоративный женственный узор на фоне -->
      <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); background-repeat: repeat;"></div>

      <!-- Плавные абстрактные круги для фона -->
      <div class="absolute -top-20 -left-20 w-64 h-64 bg-white/15 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-32 -right-16 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs md:text-sm font-medium uppercase tracking-[0.2em] bg-white/25 px-5 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
            Весеннее обновление 2026
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold mb-6 leading-tight text-shadow-sm">
          Искусство быть<br/>женственной
        </h1>
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/15">
            <span class="text-base drop-shadow-sm">🌸</span>
            <span>Бесплатная доставка</span>
          </div>
          <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/15">
            <span class="text-base drop-shadow-sm">🕊️</span>
            <span>Эксклюзивный дроп</span>
          </div>
        </div>
      </div>

      <!-- Обновленный нежный декоративный элемент -->
      <div class="absolute right-4 top-0 w-1/3 h-full opacity-10">
        <div class="text-[180px] md:text-[220px] absolute -right-10 top-1/2 -translate-y-1/2 select-none">🌸</div>
      </div>
    </section>

    <!-- Quick View Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isQuickViewOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="isQuickViewOpen = false"></div>
          <div class="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button @click="isQuickViewOpen = false"
                    class="absolute top-4 right-4 p-2 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 z-10">
              ✕
            </button>
            <div v-if="quickViewProduct" class="p-6">
              <img :src="useMediaUrl(quickViewProduct.preview)"
                   :alt="quickViewProduct.name"
                   class="w-full h-64 object-cover rounded-2xl mb-4" />
              <h2 class="text-2xl font-bold mb-2">{{ quickViewProduct.name }}</h2>
              <p class="text-rose-600 text-xl font-bold mb-3">{{ quickViewProduct.price }} ₽</p>
              <p class="text-gray-600 mb-4">{{ quickViewProduct.description }}</p>
              <NuxtLink :to="`/products/${quickViewProduct.id}`"
                        class="btn-primary w-full text-center block">
                Подробнее →
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Filters Section - Horizontal Layout -->
    <div class="space-y-4">
      <!-- Top Filter Bar -->
      <div class="flex flex-wrap gap-3 items-center">
        <!-- Search -->
        <div class="relative flex-1 min-w-[100px]">
          <input
              v-model="catalogStore.filters.search"
              type="text"
              placeholder="Поиск товаров..."
              class="w-full pl-10 pr-4 py-2.5 text-light-text dark:text-white bg-light-bg dark:bg-white border border-light-border dark:border-purple-400/50 rounded-xl focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
          />
          <svg class="w-5 h-5 absolute left-3 top-3 text-light-text-secondary dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Sort Dropdown -->
        <div class="relative min-w-[180px]">
          <Listbox v-model="catalogStore.filters.ordering">
            <div class="relative">
              <ListboxButton class="w-full pl-4 pr-4 py-2.5 text-left text-light-text dark:text-gray-600 bg-light-bg dark:bg-gray-100/20 border border-light-border dark:border-gray-700/30 rounded-xl focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20">
                <span class="block truncate">
                  {{ sortOptions.find(opt => opt.value === catalogStore.filters.ordering)?.label || 'Сортировка' }}
                </span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg class="h-5 w-5 text-light-text-secondary dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </span>
              </ListboxButton>
              <transition
                  leave-active-class="transition duration-100 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
              >
                <ListboxOptions class="absolute z-[9999] mt-1 w-full overflow-auto rounded-xl bg-light-bg-secondary dark:bg-gray-100/95 backdrop-blur-lg py-1 text-base shadow-lg border border-light-border dark:border-gray-700/30 focus:outline-none">
                  <ListboxOption
                      v-for="option in sortOptions"
                      :key="option.value"
                      :value="option.value"
                      v-slot="{ active, selected }"
                      class="relative cursor-pointer select-none"
                  >
                    <span
                        :class="[
                        active ? 'bg-purple-400/20 text-light-text dark:text-gray-700' : 'text-light-text-secondary dark:text-gray-700',
                        'block truncate px-4 py-2'
                      ]"
                    >
                      {{ option.label }}
                      <svg v-if="selected" class="h-5 w-5 inline-block ml-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>

        <!-- Categories Dropdown -->
        <div class="relative min-w-[180px]">
          <Listbox v-model="selectedCategory" @update:model-value="handleCategoryChange">
            <div class="relative">
              <ListboxButton class="w-full pl-4 pr-4 py-2.5 text-left text-light-text dark:text-text-gray-600 bg-light-bg dark:bg-gray-100/20 border border-light-border dark:border-gray-700/30 rounded-xl focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20">
                <span class="block truncate">
                  {{ selectedCategoryName || 'Все категории' }}
                </span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg class="h-5 w-5 text-light-text-secondary dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </span>
              </ListboxButton>
              <transition
                  leave-active-class="transition duration-100 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
              >
                <ListboxOptions class="absolute z-[9999] mt-1 w-full max-h-60 overflow-auto rounded-xl bg-light-bg-secondary dark:bg-gray-100/95 backdrop-blur-lg py-1 text-base shadow-lg border border-light-border dark:border-gray-700/30 focus:outline-none">
                  <ListboxOption
                      :value="null"
                      v-slot="{ active, selected }"
                      class="relative cursor-pointer select-none"
                  >
                    <span
                        :class="[
                        active ? 'bg-purple-400/20 text-light-text dark:text-gray-700' : 'text-light-text-secondary dark:text-gray-700',
                        'block truncate px-4 py-2'
                      ]"
                    >
                      Все категории
                    </span>
                  </ListboxOption>
                  <ListboxOption
                      v-for="item in catalogStore.categories"
                      :key="item.id"
                      :value="item.id"
                      v-slot="{ active, selected }"
                      class="relative cursor-pointer select-none"
                  >
                    <span
                        :class="[
                        active ? 'bg-purple-400/20 text-light-text dark:text-gray-700' : 'text-light-text-secondary dark:text-gray-700',
                        'block truncate px-4 py-2'
                      ]"
                    >
                      {{ item.name }}
                    </span>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>

        <!-- Brands Dropdown (Multi-select) -->
        <div class="relative min-w-[180px]">
          <div class="relative">
            <button
                @click="isBrandsOpen = !isBrandsOpen"
                class="w-full pl-4 pr-4 py-2.5 text-left text-light-text dark:text-gray-600 bg-light-bg dark:bg-gray-100/20 border border-light-border dark:border-gray-700/30 rounded-xl focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 hover:bg-light-bg-secondary"
            >
              <span class="block truncate">
                Бренды {{ selectedBrandsCount > 0 ? `(${selectedBrandsCount})` : '' }}
              </span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg class="h-5 w-5 text-light-text-secondary dark:text-gray-400 transition-transform" :class="{ 'rotate-180': isBrandsOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </span>
            </button>
            <transition
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
              <div v-if="isBrandsOpen" class="absolute z-[9999] mt-1 w-48 max-h-60 overflow-auto rounded-xl bg-light-bg-secondary dark:bg-gray-100/95 backdrop-blur-lg py-1 text-base shadow-lg border border-light-border dark:border-gray-700/30 focus:outline-none">
                <div class="p-2">
                  <label v-for="item in catalogStore.brands" :key="item.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-400/10 cursor-pointer transition-all">
                    <input
                        type="checkbox"
                        :checked="catalogStore.filters.brandIn.includes(item.id)"
                        @change="toggleInArray(catalogStore.filters.brandIn, item.id)"
                        class="w-4 h-4 text-purple-500 rounded focus:ring-purple-400"
                    />
                    <span class="text-sm text-light-text dark:text-gray-700">{{ item.name }}</span>
                  </label>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Countries Dropdown (Multi-select) -->
        <div class="relative min-w-[180px]">
          <div class="relative">
            <button
                @click="isCountriesOpen = !isCountriesOpen"
                class="w-full pl-4 pr-4 py-2.5 text-left text-light-text dark:text-gray-600 bg-light-bg dark:bg-gray-100/20 border border-light-border dark:border-gray-700/30 rounded-xl focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 hover:bg-light-bg-secondary"
            >
              <span class="block truncate">
                Страны {{ selectedCountriesCount > 0 ? `(${selectedCountriesCount})` : '' }}
              </span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg class="h-5 w-5 text-light-text-secondary dark:text-gray-400 transition-transform" :class="{ 'rotate-180': isCountriesOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </span>
            </button>
            <transition
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
              <div v-if="isCountriesOpen" class="absolute z-[9999] mt-1 w-48 max-h-60 overflow-auto rounded-xl bg-light-bg-secondary dark:bg-gray-100 backdrop-blur-lg py-1 text-base shadow-lg border border-light-border dark:border-gray-700/30 focus:outline-none">
                <div class="p-2">
                  <label v-for="item in catalogStore.countries" :key="item.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-400/10 cursor-pointer transition-all">
                    <input
                        type="checkbox"
                        :checked="catalogStore.filters.countryIn.includes(item.id)"
                        @change="toggleInArray(catalogStore.filters.countryIn, item.id)"
                        class="w-4 h-4 text-purple-500 rounded focus:ring-purple-400"
                    />
                    <span class="text-sm text-light-text dark:text-gray-700">{{ item.name }}</span>
                  </label>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <button @click="applyFilters" class="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 font-medium">
          Применить
        </button>
      </div>

      <!-- Active filters chips -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Активные фильтры:</span>
        <button
            v-if="selectedCategory !== null"
            @click="clearCategory"
            class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-white dark:text-white rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          Категория: {{ selectedCategoryName }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
            v-for="brandId in catalogStore.filters.brandIn"
            :key="`brand-${brandId}`"
            @click="removeBrand(brandId)"
            class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-white dark:text-white rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          Бренд: {{ catalogStore.brands.find(b => b.id === brandId)?.name }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
            v-for="countryId in catalogStore.filters.countryIn"
            :key="`country-${countryId}`"
            @click="removeCountry(countryId)"
            class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-white dark:text-white rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          Страна: {{ catalogStore.countries.find(c => c.id === countryId)?.name }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <section class="grid gap-8 lg:grid-cols-1">
      <!-- Products Grid -->
      <div class="space-y-6">
        <!-- Cart Creation Banner -->
        <div v-if="!cartStore.carts.length && authStore.isAuthenticated"
             class="card-soft p-4 flex flex-wrap items-center gap-3">
          <span class="text-2xl">🛍️</span>
          <div class="flex-1">
            <p class="font-semibold text-gray-800">Создайте первую корзину</p>
            <p class="text-sm text-gray-600">Чтобы добавлять товары</p>
          </div>
          <input v-model="creatingCartName"
                 class="input-field max-w-[200px]"
                 placeholder="Название корзины" />
          <button @click="cartStore.createCart(creatingCartName || 'Моя корзина')"
                  class="btn-primary">
            Создать
          </button>
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

        <!-- Loading State -->
        <div v-if="catalogStore.loading" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="i in 6" :key="i" class="card-soft p-4">
            <div class="skeleton h-64 w-full rounded-xl mb-4"></div>
            <div class="skeleton h-6 w-3/4 mb-2"></div>
            <div class="skeleton h-4 w-full mb-4"></div>
            <div class="skeleton h-10 w-full rounded-xl"></div>
          </div>
        </div>

        <!-- Products -->
        <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="product in catalogStore.products" :key="product.id"
                   class="card-soft overflow-hidden group">
            <!-- Product Image -->
            <div class="relative h-96 overflow-hidden">
              <img :src="useMediaUrl(product.preview)"
                   :alt="product.name"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

              <!-- Rating Badge -->
              <div v-if="product.average_rating"
                   class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                <span class="text-amber-400">★</span>
                <span>{{ product.average_rating }}</span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4">
              <NuxtLink :to="`/products/${product.id}`"
                        class="text-lg font-semibold text-gray-900 hover:text-rose-600 line-clamp-2 mb-2">
                {{ product.name }}
              </NuxtLink>

              <p class="text-sm text-gray-600 line-clamp-2 mb-3">
                {{ product.description }}
              </p>

              <div class="flex items-center justify-between mb-3">
                <p class="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                  {{ product.price }} ₽
                </p>
                <div class="flex text-amber-400 text-sm">
                  <span v-for="i in 5" :key="i">★</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-if="!catalogStore.loading && !catalogStore.products.length"
             class="card-soft p-12 text-center">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-2xl font-semibold text-gray-800 mb-2">Товары не найдены</h3>
          <p class="text-gray-600 mb-4">Попробуйте изменить параметры поиска или фильтры</p>
          <button @click="resetFilters"
                  class="btn-primary">
            Сбросить фильтры
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

const catalogStore = useCatalogStore()
const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { toast } = useToast()

const selectedSize = ref<Record<number, number>>({})
const selectedCartForAdd = ref<Record<number, number>>({})
const creatingCartName = ref('')
const errorText = ref('')
const isFilterOpen = ref(false)
const quickViewProduct = ref<any>(null)
const isQuickViewOpen = ref(false)
const activeFilter = ref<string | null>(null)

// Filter state for dropdowns
const selectedCategory = ref<number | null>(null)
const isBrandsOpen = ref(false)
const isCountriesOpen = ref(false)

const sortOptions = [
  { label: 'По популярности', value: '-average_rating' },
  { label: 'Дешевле', value: 'price' },
  { label: 'Дороже', value: '-price' },
  { label: 'По рейтингу ↑', value: 'average_rating' },
  { label: 'По рейтингу ↓', value: '-average_rating' },
]

const selectedCategoryName = computed(() => {
  if (selectedCategory.value === null) return null
  return catalogStore.categories.find(c => c.id === selectedCategory.value)?.name
})

const selectedBrandsCount = computed(() => catalogStore.filters.brandIn.length)
const selectedCountriesCount = computed(() => catalogStore.filters.countryIn.length)

const hasActiveFilters = computed(() => {
  return selectedCategory.value !== null ||
      catalogStore.filters.brandIn.length > 0 ||
      catalogStore.filters.countryIn.length > 0 ||
      catalogStore.filters.search !== ''
})

const toggleInArray = <T extends string | number>(arr: T[], value: T) => {
  const index = arr.indexOf(value)
  if (index >= 0) arr.splice(index, 1)
  else arr.push(value)
}

const handleCategoryChange = (value: number | null) => {
  selectedCategory.value = value
  if (value === null) {
    catalogStore.filters.categoryIn = []
  } else {
    catalogStore.filters.categoryIn = [value]
  }
}

const applyFilters = () => {
  catalogStore.fetchProducts()
  // Close dropdowns
  isBrandsOpen.value = false
  isCountriesOpen.value = false
}

const resetFilters = () => {
  selectedCategory.value = null
  catalogStore.filters.categoryIn = []
  catalogStore.filters.brandIn = []
  catalogStore.filters.countryIn = []
  catalogStore.filters.search = ''
  catalogStore.filters.ordering = sortOptions[0].value
  catalogStore.fetchProducts()
}

const clearCategory = () => {
  selectedCategory.value = null
  catalogStore.filters.categoryIn = []
  catalogStore.fetchProducts()
}

const removeBrand = (brandId: number) => {
  const index = catalogStore.filters.brandIn.indexOf(brandId)
  if (index >= 0) catalogStore.filters.brandIn.splice(index, 1)
  catalogStore.fetchProducts()
}

const removeCountry = (countryId: number) => {
  const index = catalogStore.filters.countryIn.indexOf(countryId)
  if (index >= 0) catalogStore.filters.countryIn.splice(index, 1)
  catalogStore.fetchProducts()
}

const init = async () => {
  await Promise.all([catalogStore.fetchReferences(), catalogStore.fetchProducts()])
  if (authStore.isAuthenticated) {
    await Promise.all([favoriteStore.fetchFavorites(), cartStore.fetchCarts()])
  }
}

onMounted(init)

const addToCart = async (productId: number) => {
  errorText.value = ''
  try {
    if (!authStore.isAuthenticated) {
      await navigateTo('/login')
      return
    }
    if (!cartStore.carts.length) {
      if (!creatingCartName.value.trim()) {
        errorText.value = 'Создайте корзину перед добавлением товара'
        return
      }
      await cartStore.createCart(creatingCartName.value)
      creatingCartName.value = ''
    }

    const product = await $fetch<any>(`${useRuntimeConfig().public.apiBase}/shop/products/${productId}/`)
    const sizeId = selectedSize.value[productId] || product.dimensions?.[0]?.id
    if (!sizeId) {
      errorText.value = 'Нет доступных размеров'
      return
    }

    const cartId = selectedCartForAdd.value[productId] || cartStore.selectedCartId || cartStore.carts[0]?.id
    if (!cartId) {
      errorText.value = 'Выберите корзину'
      return
    }

    await cartStore.addProduct(cartId, productId, sizeId, 1)
    toast('Товар добавлен в корзину! 🛍️', 'success')
  } catch (error: any) {
    errorText.value = error?.data?.detail || 'Не удалось добавить товар'
    toast(errorText.value, 'error')
  }
}

const openQuickView = async (productId: number) => {
  quickViewProduct.value = await $fetch<any>(`${useRuntimeConfig().public.apiBase}/shop/products/${productId}/`)
  isQuickViewOpen.value = true
}
</script>

<style scoped>
/* Стили для chip-фильтров */
.chip-filter {
  @apply px-4 py-2 rounded-full text-sm font-medium
  bg-rose-50 text-rose-700 border border-rose-200
  hover:bg-rose-100 transition-all duration-300;
}

.chip-filter.active {
  @apply bg-gradient-to-r from-rose-400 to-pink-500
  text-white border-transparent shadow-md shadow-rose-200;
}

/* Стили для размеров-чипов */
.size-chip {
  @apply w-12 h-12 rounded-xl flex items-center justify-center
  text-sm font-semibold bg-rose-50 text-rose-700
  border-2 border-rose-100 hover:border-rose-300
  transition-all duration-300;
}

.size-chip.active {
  @apply bg-gradient-to-br from-rose-400 to-pink-500
  text-white border-transparent shadow-md shadow-rose-200;
}

/* Анимации для дропдаунов */
.dropdown-enter-active {
  transition: all 0.3s ease-out;
}

.dropdown-leave-active {
  transition: all 0.2s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.9);
}

/* Skeleton loading animation */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>