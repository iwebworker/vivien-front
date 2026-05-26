import type { Cart } from '~/types/api'

export const useCartStore = defineStore('cart', {
    state: () => ({
        carts: [] as Cart[],
        selectedCartId: null as number | null,
        loading: false
    }),
    getters: {
        selectedCart: (state) => state.carts.find((cart) => cart.id === state.selectedCartId) || null
    },
    actions: {
        async fetchCarts() {
            const authStore = useAuthStore()
            if (!authStore.isAuthenticated) return
            this.loading = true
            try {
                const { request } = useApi()
                this.carts = await request<Cart[]>('/shop/carts/', 'GET', undefined, true)
                if (!this.selectedCartId && this.carts.length > 0 && this.carts[0]) {
                    this.selectedCartId = this.carts[0].id
                }
            } finally {
                this.loading = false
            }
        },
        async createCart(name: string) {
          const { request } = useApi()
          const created = await request<Cart>('/shop/carts/', 'POST', { name }, true)
          this.carts.push(created)
          this.selectedCartId = created.id
          return created
        },
        async renameCart(id: number, name: string) {
          const { request } = useApi()
          const updated = await request<Cart>(`/shop/carts/${id}/`, 'PATCH', { name }, true)
          const index = this.carts.findIndex((item) => item.id === id)
          if (index >= 0) this.carts[index] = updated
        },
        async deleteCart(id: number) {
          const { request } = useApi()
          await request(`/shop/carts/${id}/`, 'DELETE', undefined, true)
          this.carts = this.carts.filter((item) => item.id !== id)
          if (this.selectedCartId === id) this.selectedCartId = this.carts[0]?.id || null
        },
        async addProduct(cartId: number, productId: number, sizeId: number, quantity = 1) {
          const { request } = useApi()
          await request(`/shop/carts/${cartId}/products/add/`, 'POST', { product_id: productId, size_id: sizeId, quantity }, true)
          await this.fetchCarts()
        },
        async updatePosition(id: number, payload: { cart: number; product: number; size: number; quantity: number }) {
          const { request } = useApi()
          await request(`/shop/cart-positions/${id}/`, 'PATCH', payload, true)
          await this.fetchCarts()
        },
        async removePosition(id: number) {
          const { request } = useApi()
          await request(`/shop/cart-positions/${id}/`, 'DELETE', undefined, true)
          await this.fetchCarts()
        }
    }
})
