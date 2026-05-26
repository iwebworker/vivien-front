import type { FavoriteItem } from '~/types/api'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: [] as FavoriteItem[],
    loading: false
  }),
  getters: {
    favoriteIds: (state) => new Set(state.favorites.map((item) => item.product.id))
  },
  actions: {
    async fetchFavorites() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      this.loading = true
      try {
        const { request } = useApi()
        this.favorites = await request<FavoriteItem[]>('/shop/favorites/', 'GET', undefined, true)
      } finally {
        this.loading = false
      }
    },
    async add(productId: number) {
      const { request } = useApi()
      await request('/shop/favorites/add/', 'POST', { product_id: productId }, true)
      await this.fetchFavorites()
    },
    async remove(productId: number) {
      const { request } = useApi()
      try {
        await request(`/shop/favorites/remove/${productId}/`, 'DELETE', undefined, true)
      } catch (error: any) {
        if (error?.status !== 404 && error?.response?.status !== 404) {
          throw error
        }
      }
      await this.fetchFavorites()
    },
    async toggle(productId: number) {
      if (this.favoriteIds.has(productId)) {
        await this.remove(productId)
      } else {
        await this.add(productId)
      }
    }
  }
})
