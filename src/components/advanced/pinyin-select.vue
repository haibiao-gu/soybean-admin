<script lang="ts" setup>
import type { SelectOption } from 'naive-ui';
import PinyinMatch from 'pinyin-match';
import { computed, h, ref } from 'vue';

defineOptions({
  name: 'PinyinSelect'
});

interface Props {
  modelValue?: string | number | Array<string | number> | null;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  filterable?: boolean;
  multiple?: boolean;
  tag?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  filterable: true,
  multiple: false,
  tag: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | Array<string | number> | null];
  'blur': [event: FocusEvent];
}>();

const searchPattern = ref('');

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
    // 选中选项后清除高亮
    searchPattern.value = '';
  }
});

// 自定义过滤函数，支持拼音搜索
function filterFunction(pattern: string, option: SelectOption) {
  if (!pattern) {
    searchPattern.value = '';
    return true;
  }

  const label = String(option.label || '');
  searchPattern.value = pattern;

  // 使用 pinyin-match 进行拼音匹配
  // match 返回数组表示匹配成功，返回 false 表示匹配失败
  const result = PinyinMatch.match(label, pattern);
  return result !== false;
}

// 高亮匹配的文本
function renderOptionLabel(option: SelectOption) {
  const label = String(option.label || '');

  if (!searchPattern.value) {
    return label;
  }

  const matchResult = PinyinMatch.match(label, searchPattern.value);

  if (!matchResult) {
    return label;
  }

  const [start, end] = matchResult as [number, number];
  const before = label.slice(0, start);
  const matched = label.slice(start, end + 1);
  const after = label.slice(end + 1);

  return h('span', {}, [
    before,
    h('span', { class: 'text-warning font-bold' }, matched),
    after
  ]);
}

// 失去焦点时清除高亮
function handleBlur(event: FocusEvent) {
  searchPattern.value = '';
  emit('blur', event);
}
</script>

<template>
  <NSelect
    v-model:value="internalValue"
    :clearable="clearable"
    :disabled="disabled"
    :filter="filterFunction"
    :filterable="filterable"
    :multiple="multiple"
    :options="options"
    :placeholder="placeholder"
    :render-label="renderOptionLabel"
    :tag="tag"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<style scoped></style>
