<script setup lang="ts">
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()
const { toast } = useToast()

const { isAuthenticated } = storeToRefs(authStore)
const isMobileMenuOpen = ref(false)

onMounted(async () => {
  await authStore.bootstrap()
  if (isAuthenticated.value) {
    await Promise.allSettled([
      favoriteStore.fetchFavorites(),
      cartStore.fetchCarts()
    ])
  }
})

const handleLogout = async () => {
  authStore.logout()
  toast('До новых встреч! ✨', 'success')
}

const navLinks = [
  { to: '/', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное', badge: computed(() => favoriteStore.favorites.length) },
  { to: '/carts', label: 'Корзины', badge: computed(() => cartStore.carts.length) },
  { to: '/orders', label: 'Заказы' },
  { to: '/profile', label: 'Профиль' },
  { to: '/questions', label: 'Поддержка' },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Animated Header -->
    <header class="sticky top-0 z-50 backdrop-blur-xl border-b border-white/40 bg-white/65 shadow-md shadow-rose-100/30">
      <div class="container-soft">
        <div class="flex items-center justify-between py-4">
          <!-- Logo -->
          <NuxtLink to="/" class="group flex items-center gap-2">
            <span class="text-3xl animate-float">🌺</span>
            <span class="text-2xl font-['Playfair_Display'] font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              Vivien
            </span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-3">
            <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
                      class="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-rose-100/50 group"
                      active-class="bg-rose-100/80 text-rose-700">
              {{ link.label }}
              <span v-if="link.badge"
                    class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse">
                {{ link.badge.value }}
              </span>
            </NuxtLink>
          </nav>

          <!-- Auth & Mobile -->
          <div class="flex items-center gap-3">
            <NuxtLink v-if="!isAuthenticated" to="/login"
                      class="btn-primary text-sm hidden sm:inline-flex">
              Войти ✨
            </NuxtLink>
            <button v-else @click="handleLogout"
                    class="btn-secondary text-sm hidden sm:inline-flex">
              Выйти 🌙
            </button>

            <!-- Mobile Menu Button -->
            <button @click="isMobileMenuOpen = !isMobileMenuOpen"
                    class="lg:hidden p-2 rounded-md hover:bg-rose-100/50">
              <span class="text-2xl">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <Transition name="slide">
          <nav v-if="isMobileMenuOpen" class="lg:hidden py-4 border-t border-rose-100/50">
            <div class="space-y-2">
              <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
                        @click="isMobileMenuOpen = false"
                        class="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium hover:bg-rose-100/50"
                        active-class="bg-rose-100/80 text-rose-700">
                <span>{{ link.icon }} {{ link.label }}</span>
                <span v-if="link.badge" class="badge">{{ link.badge.value }}</span>
              </NuxtLink>
              <div class="px-4 pt-2">
                <NuxtLink v-if="!isAuthenticated" to="/login"
                          @click="isMobileMenuOpen = false"
                          class="btn-primary w-full text-center block">
                  Войти ✨
                </NuxtLink>
                <button v-else @click="handleLogout(); isMobileMenuOpen = false"
                        class="btn-secondary w-full">
                  Выйти 🌙
                </button>
              </div>
            </div>
          </nav>
        </Transition>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-soft py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/20 bg-white/40 backdrop-blur-xl mt-12">
      <div class="container-soft py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-['Playfair_Display'] font-bold text-rose-600 mb-4">🌺 Vivien</h3>
            <p class="text-sm text-gray-600">Ваш проводник в мир элегантной моды. Качественная одежда с душой.</p>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Помощь</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><NuxtLink to="/questions" class="hover:text-rose-600">Вопросы и ответы</NuxtLink></li>
              <li><NuxtLink to="/orders" class="hover:text-rose-600">Мои заказы</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Контакты</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>📧 support@vivien.ru</li>
              <li>📱 8 (800) 123-45-67</li>
              <li>🕐 Пн-Вс: 10:00 - 22:00</li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-rose-100/50 text-center text-xs text-gray-500">
          © 2025 Vivien. Все права защищены. Создано с ❤️
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>