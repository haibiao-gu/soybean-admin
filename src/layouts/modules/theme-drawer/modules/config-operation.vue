<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({
  name: 'ConfigOperation'
});

const themeStore = useThemeStore();

function getClipboardText() {
  const reg = /"\w+":/g;

  const json = themeStore.settingsJson;

  return json.replace(reg, match => match.replace(/"/g, ''));
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(getClipboardText());
    window.$message?.success($t('theme.configOperation.copySuccessMsg'));
  } catch {
    window.$message?.error('复制失败，请手动复制');
  }
}

function handleReset() {
  themeStore.resetStore();

  setTimeout(() => {
    window.$message?.success($t('theme.configOperation.resetSuccessMsg'));
  }, 50);
}

const dataClipboardText = computed(() => getClipboardText());
</script>

<template>
  <div class="w-full flex justify-between">
    <textarea id="themeConfigCopyTarget" v-model="dataClipboardText" class="absolute opacity-0 -z-1" />
    <NButton type="error" ghost @click="handleReset">{{ $t('theme.configOperation.resetConfig') }}</NButton>
    <NButton type="primary" @click="handleCopy">{{ $t('theme.configOperation.copyConfig') }}</NButton>
  </div>
</template>

<style scoped></style>
