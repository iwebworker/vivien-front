// composables/useToast.ts
interface Toast {
    id: number
    message: string
    type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now()
        toasts.value.push({ id, message, type })

        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id)
        }, 3000)
    }

    return {
        toasts: readonly(toasts),
        toast: addToast
    }
}