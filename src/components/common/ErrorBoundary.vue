<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

defineOptions({
  name: 'ErrorBoundary'
});

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((err: unknown, _instance, info: string) => {
  hasError.value = true;

  if (err instanceof Error) {
    errorMessage.value = err.message;
  } else {
    errorMessage.value = String(err);
  }

  console.error(`[ErrorBoundary] ${info}:`, err);

  // Prevent error propagation to parent
  return false;
});

function handleRetry() {
  hasError.value = false;
  errorMessage.value = '';
}
</script>

<template>
  <slot v-if="!hasError" />
  <div v-else class="flex-center flex-col h-full min-h-200px gap-16px px-16px">
    <div class="text-48px text-[var(--n-text-color-3)] line-height-1em">
      <i class="i-fluent-error-circle-20-regular" />
    </div>
    <h2 class="text-18px font-500 text-[var(--n-text-color-2)]">
      页面加载异常
    </h2>
    <p class="text-14px text-[var(--n-text-color-3)] max-w-400px text-center">
      {{ errorMessage || '组件渲染出错，请尝试刷新页面' }}
    </p>
    <NButton type="primary" @click="handleRetry">
      重试
    </NButton>
  </div>
</template>

<style scoped>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
