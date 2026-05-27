<script lang="ts" setup>
import { appendUnit } from "@/utils/common";
import type { InputNumberInst } from 'naive-ui';
import { nextTick, ref } from 'vue';

defineOptions({
  name: 'TableColumnEditNumber'
});

interface Props {
  value?: number | null;
  precision?: number;
  showButton?: boolean;
  min?: number;
  max?: number;
  prefix?: string | null;
  suffix?: string | null;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  precision: undefined,
  showButton: false,
  min: undefined,
  max: undefined,
  prefix: '',
  suffix: '',
  editable: true
});

interface Emits {
  (e: 'update:value', value: number | null): void;

  (e: 'change', value: number | null): void;
}

const emit = defineEmits<Emits>();

const isEdit = ref(false);
const inputRef = ref<InputNumberInst | null>(null);
const inputValue = ref<number | null>(props.value);

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
    <NInputNumber
      v-if="isEdit"
      ref="inputRef"
      v-model:value="inputValue"
      :max="max"
      :min="min"
      :precision="precision"
      :show-button="showButton"
      @blur="handleBlur"
      @keydown.enter="handleChange"
    >
      <template v-if="prefix" #prefix>
        {{ prefix }}
      </template>
      <template v-if="suffix" #suffix>
        {{ suffix }}
      </template>
    </NInputNumber>
    <NFlex v-else :justify="prefix?'space-between':'end'" :wrap="false">
      <span v-if="prefix">
        {{ prefix }}
      </span>
      <span>{{ appendUnit(value!, suffix!, precision!) }}</span>
    </NFlex>
  </div>
</template>

<style scoped></style>
