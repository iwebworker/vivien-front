import type { Order } from '~/types/api'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [] as Order[],
    loading: false
  }),
  actions: {
    async fetchOrders() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      this.loading = true
      try {
        const { request } = useApi()
        this.orders = await request<Order[]>('/shop/orders/', 'GET', undefined, true)
      } finally {
        this.loading = false
      }
    },
    async createFromCart(cartId: number, address: string) {
      const { request } = useApi()
      const order = await request<Order>('/shop/orders/', 'POST', { cart_id: cartId, address }, true)
      this.orders = [order, ...this.orders]
      return order
    }
  }
})
