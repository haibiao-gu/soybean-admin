<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({
  name: 'TableColumnOperation'
});

interface Props {
  showEdit?: boolean;
  showDelete?: boolean;
  disabledDelete?: boolean;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'around' | 'evenly';
}

defineProps<Props>();

interface Emits {
  (e: 'edit'): void;

  (e: 'delete'): void;
}

const emit = defineEmits<Emits>();

function handleEdit() {
  emit('edit');
}

function handleDelete() {
  emit('delete');
}
</script>

<template>
  <NFlex :justify="justify?justify:'center'">
    <slot name="prefix"></slot>
    <slot name="default">
      <NButton v-if="showEdit" ghost size="small" type="primary" @click="handleEdit">
        {{ $t('common.edit') }}
      </NButton>
      <NPopconfirm v-if="showDelete" @positive-click="handleDelete">
        <template #trigger>
          <NButton :disabled="disabledDelete" ghost size="small" type="error">
            {{ $t('common.delete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>
    </slot>
    <slot name="suffix"></slot>
  </NFlex>
</template>

<style scoped></style>
