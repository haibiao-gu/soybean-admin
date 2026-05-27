NEW_FILE_CODE
<script lang="ts" setup>
import type { InputInst } from 'naive-ui';
import { nextTick, ref } from 'vue';

defineOptions({
  name: 'TableColumnEditText'
});

interface Props {
  value?: string | null;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  maxLength?: number;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  placeholder: '',
  type: 'text',
  rows: 2,
  maxLength: undefined,
  editable: true
});

interface Emits {
  (e: 'update:value', value: string | null): void;

  (e: 'change', value: string | null): void;
}

const emit = defineEmits<Emits>();

const isEdit = ref(false);
const inputRef = ref<InputInst | null>(null);
const inputValue = ref<string | null>(props.value);

function handleOnClick() {
  if (!props.editable) return;
  isEdit.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function handleChange() {
  emit('update:value', inputValue.value);
  emit('change', inputValue.value);
  isEdit.value = false;
}

function handleBlur() {
  if (inputValue.value === props.value) {
    isEdit.value = false;
  } else {
    handleChange();
  }
}
</script>

<template>
  <div :class="{ 'cursor-pointer': editable }" class="min-h-22px" @click="handleOnClick">
    <NInput
      v-if="isEdit"
      ref="inputRef"
      v-model:value="inputValue"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :rows="rows"
      :type="type"
      @blur="handleBlur"
      @keydown.enter="type === 'text' && handleChange()"
    />
    <span v-else>{{ value || '' }}</span>
  </div>
</template>

<style scoped></style>
