<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({
  name: 'OperateButtons'
});

interface Props {
  hideCancel?: boolean;
  hideConfirm?: boolean;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'around' | 'evenly';
}

defineProps<Props>();

interface Emits {
  (e: 'cancel'): void;

  (e: 'confirm'): void;
}

const emit = defineEmits<Emits>();

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  emit('confirm');
}
</script>

<template>
  <NFlex :justify="justify?justify:'end'" class="w-full">
    <slot name="prefix"></slot>
    <slot name="default">
      <NButton v-if="!hideCancel" @click="handleCancel">{{ $t('common.cancel') }}</NButton>
      <NButton v-if="!hideConfirm" type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</NButton>
    </slot>
    <slot name="suffix"></slot>
  </NFlex>
</template>

<style scoped></style>
