<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9)_0%,_rgba(255,246,251,0.85)_42%,_rgba(249,247,255,0.95)_100%)]">
    <ClientOnly>
      <Transition name="fade" mode="out-in">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </Transition>
    </ClientOnly>

    <!-- Toast Notifications -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id"
             class="card-soft p-4 flex items-center gap-3 min-w-[300px] animate-slide-up"
             :class="toast.type === 'success' ? 'border-green-300 bg-green-50/90' : 'border-red-300 bg-red-50/90'">
          <span class="text-2xl">{{ toast.type === 'success' ? '✨' : '💫' }}</span>
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts } = useToast()

// Page transition styles
definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.page-enter-active, .page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-enter-active {
  animation: slideUp 0.3s ease;
}
.toast-leave-active {
  animation: slideUp 0.3s ease reverse;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>