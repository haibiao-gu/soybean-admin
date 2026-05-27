<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({
  name: 'TableSearchButtons'
});

interface Props {
  hideReset?: boolean;
  hideSearch?: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'reset'): void;

  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

function handleReset() {
  emit('reset');
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <NFlex class="w-full" justify="end">
    <slot name="prefix"></slot>
    <slot name="default">
      <NButton v-if="!hideReset" @click="handleReset">
        <template #icon>
          <icon-ic-round-refresh class="text-icon" />
        </template>
        {{ $t('common.reset') }}
      </NButton>
      <NButton v-if="!hideSearch" ghost type="primary" @click="handleSearch">
        <template #icon>
          <icon-ic-round-search class="text-icon" />
        </template>
        {{ $t('common.search') }}
      </NButton>
    </slot>
    <slot name="suffix"></slot>
  </NFlex>
</template>

<style scoped></style>
