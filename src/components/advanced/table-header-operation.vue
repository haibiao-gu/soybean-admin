<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({
  name: 'TableHeaderOperation'
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledDelete?: boolean;
  loading?: boolean;

  showDragSort?: boolean;
  enableDragSort?: boolean;

  showExport?: boolean;
  showAdd?: boolean;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableDragSort: false,
  showExport: false
});

interface Emits {
  (e: 'add'): void;

  (e: 'delete'): void;

  (e: 'refresh'): void;

  (e: 'update:enableDragSort', value: boolean): void;

  (e: 'export'): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function batchDelete() {
  emit('delete');
}

function refresh() {
  emit('refresh');
}

function toggleDragSort() {
  emit('update:enableDragSort', !props.enableDragSort);
}

function handleExport() {
  emit('export');
}
</script>

<template>
  <NSpace :align="itemAlign" class="lt-sm:w-200px" justify="end" wrap>
    <slot name="prefix"></slot>
    <slot name="default">
      <NButton v-if="showAdd" ghost size="small" type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t('common.add') }}
      </NButton>
      <NPopconfirm v-if="showDelete" @positive-click="batchDelete">
        <template #trigger>
          <NButton :disabled="disabledDelete" ghost size="small" type="error">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>
      <NButton v-if="showExport" size="small" @click="handleExport">
        <template #icon>
          <icon-mdi-microsoft-excel class="text-icon" />
        </template>
        {{ $t('导出Excel') }}
      </NButton>
      <NButton size="small" @click="refresh">
        <template #icon>
          <icon-mdi-refresh :class="{ 'animate-spin': loading }" class="text-icon" />
        </template>
        {{ $t('common.refresh') }}
      </NButton>
      <TableColumnSetting v-model:columns="columns" />
      <NButton v-if="showDragSort" :type="enableDragSort ? 'primary' : 'default'" size="small" @click="toggleDragSort">
        {{ enableDragSort ? $t('关闭排序') : $t('开启排序') }}
      </NButton>
    </slot>
    <slot name="suffix"></slot>
  </NSpace>
</template>

<style scoped></style>
