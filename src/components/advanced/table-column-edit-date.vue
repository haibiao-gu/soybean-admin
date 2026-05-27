<script lang="ts" setup>
import type { DatePickerInst } from 'naive-ui';
import { nextTick, ref } from 'vue';

defineOptions({
  name: 'TableColumnEditDate'
});

interface Props {
  value?: string | null;
  placeholder?: string;
  type?: 'date' | 'datetime' | 'year' | 'month' | 'daterange' | 'datetimerange' | 'monthrange';
  format?: string;
  editable?: boolean;
  clearable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  placeholder: '',
  type: 'date',
  format: 'yyyy-MM-dd HH:mm:ss',
  editable: true,
  clearable: false
});

interface Emits {
  (e: 'update:value', value: string | null): void;

  (e: 'change', value: string | null): void;
}

const emit = defineEmits<Emits>();

const isEdit = ref(false);
const datePickerRef = ref<DatePickerInst | null>(null);
const dateValue = ref<string | null>(props.value);

function handleOnClick() {
  if (!props.editable) return;
  isEdit.value = true;
  nextTick(() => {
    datePickerRef.value?.focus();
  });
}

function handleChange() {
  emit('update:value', dateValue.value);
  emit('change', dateValue.value);
  isEdit.value = false;
}

function handleBlur() {
  if (dateValue.value === props.value) {
    isEdit.value = false;
  } else {
    handleChange();
  }
}

function formatDate(value?: string | null): string {
  if (!value) return '-';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (props.type === 'datetime' || props.type === 'datetimerange') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  if (props.type === 'year') {
    return `${year}`;
  }

  if (props.type === 'month' || props.type === 'monthrange') {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${day}`;
}
</script>

<template>
  <div :class="{ 'cursor-pointer': editable }" class="min-h-22px" @click="handleOnClick">
    <NDatePicker
      v-if="isEdit"
      ref="datePickerRef"
      v-model:formatted-value="dateValue"
      :clearable="clearable"
      :placeholder="placeholder"
      :type="type"
      :value-format="format"
      @blur="handleBlur"
      @update:formatted-value="handleChange"
    />
    <span v-else>{{ formatDate(value) }}</span>
  </div>
</template>

<style scoped></style>
