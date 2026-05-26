interface AuthPayload {
  id: number
  email: string
  access: string
  refresh: string
}

interface UserProfileUpdatePayload {
  first_name?: string
  last_name?: string
  patronymic?: string
  email?: string
  address?: string
  phone_number?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    refreshToken: '',
    profile: null as null | Record<string, any>
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken)
  },
  actions: {
    persist() {
      if (!import.meta.client) return
      localStorage.setItem('vivien_access', this.accessToken)
      localStorage.setItem('vivien_refresh', this.refreshToken)
    },
    loadPersisted() {
      if (!import.meta.client) return
      this.accessToken = localStorage.getItem('vivien_access') || ''
      this.refreshToken = localStorage.getItem('vivien_refresh') || ''
    },
    clearPersisted() {
      if (!import.meta.client) return
      localStorage.removeItem('vivien_access')
      localStorage.removeItem('vivien_refresh')
    },
    async bootstrap() {
      if (!import.meta.client) return
      this.loadPersisted()
      if (!this.accessToken && this.refreshToken) {
        await this.refreshAccess()
      }
      if (this.accessToken) {
        await this.fetchProfile()
      }
    },
    async login(email: string, password: string) {
      const { request } = useApi()
      const data = await request<{ access: string; refresh: string }>('/token/', 'POST', { email, password })
      this.accessToken = data.access
      this.refreshToken = data.refresh
      this.persist()
      await this.fetchProfile()
    },
    async register(email: string, password: string) {
      const { request } = useApi()
      const data = await request<AuthPayload>('/register/', 'POST', { email, password })
      this.accessToken = data.access
      this.refreshToken = data.refresh
      this.persist()
      await this.fetchProfile()
    },
    async fetchProfile() {
      const { request } = useApi()
      this.profile = await request('/auth/', 'GET', undefined, true)
    },
    async updateProfile(payload: UserProfileUpdatePayload) {
      const { request } = useApi()
      this.profile = await request('/user/update/', 'PATCH', payload, true)
      return this.profile
    },
    async refreshAccess() {
      if (!this.refreshToken) return false
      const { request } = useApi()
      try {
        const data = await request<{ access: string }>('/token/refresh/', 'POST', { refresh: this.refreshToken })
        this.accessToken = data.access
        this.persist()
        return true
      } catch {
        this.logout()
        return false
      }
    },
    logout() {
      this.accessToken = ''
      this.refreshToken = ''
      this.profile = null
      this.clearPersisted()
      navigateTo('/login')
    }
  }
})
