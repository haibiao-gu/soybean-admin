<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({
  name: 'TableFilterCheck'
});

interface Props {
  modelValue?: string[];
  options: CommonType.Option[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
});

interface Emits {
  (event: 'filterChange', value: string[] | null): void;
}

const emit = defineEmits<Emits>();

const value = ref<string[] | null>(props.modelValue);
</script>

<template>
  <div class="wrapper">
    <NScrollbar style="max-height: 240px">
      <NCheckboxGroup v-model:value="value">
        <NSpace vertical>
          <NCheckbox v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </NSpace>
      </NCheckboxGroup>
    </NScrollbar>
    <NDivider />
    <NSpace>
      <NButton size="tiny" @click="emit('filterChange', null)">
        {{ $t('common.reset') }}
      </NButton>
      <NButton size="tiny" type="primary" @click="emit('filterChange', value)">
        {{ $t('common.confirm') }}
      </NButton>
    </NSpace>
  </div>
</template>

<style scoped>
.wrapper {
  padding: 15px;
}

.n-divider {
  margin: 10px 0;
}
</style>
