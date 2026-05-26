type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const isAbsoluteUrl = (url: string) => /^https?:\/\//.test(url)

export const useMediaUrl = (path: string | null | undefined) => {
  if (!path) {
    return ''
  }
  if (isAbsoluteUrl(path)) {
    return path
  }
  const { public: publicConfig } = useRuntimeConfig()
  return `${publicConfig.mediaBase}${path.startsWith('/') ? '' : '/'}${path}`
}

export const useApi = () => {
    const { public: publicConfig } = useRuntimeConfig()
    const authStore = useAuthStore()

    const request = async <T>(
        url: string,
        method: Method = 'GET',
        body?: Record<string, any> | FormData | null,
        withAuth = false
    ): Promise<T> => {
        const doFetch = async (token?: string) =>
            $fetch<T>(`${publicConfig.apiBase}${url}`, {
                method,
                body: body as any,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined
            })

        try {
            const access = withAuth ? authStore.accessToken : undefined
            return await doFetch(access)
        } catch (error: any) {
            const is401 = error?.status === 401 || error?.response?.status === 401
            if (withAuth && is401 && authStore.refreshToken) {
                const renewed = await authStore.refreshAccess()
                if (renewed) {
                    return doFetch(authStore.accessToken)
                }
            }
            throw error
        }
    }

    return { request }
}
