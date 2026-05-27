<script lang="ts" setup>

import OperateButtons from "@/components/advanced/operate-buttons.vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import { $t } from "@/locales";
import { fetchChangeSysUserPassword } from "@/service/api/sys/user";
import { computed, ref, watch } from "vue";

defineOptions({
  name: 'UserChangePassword'
});

interface Props {
  userId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();

type Model = {
  id: string | null, // 用户ID
  password: string | null,// 新密码
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: props.userId!,
    password: null,
  };
}

type RuleRecord = Partial<Record<keyof Model, App.Global.FormRule[]>>;

const rules = computed<RuleRecord>(() => {
  const { formRules } = useFormRules();

  return {
    password: formRules.pwd,
  };
});

async function handleInitModel() {
  model.value = createDefaultModel();
}

function closeOperate() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const { error } = await fetchChangeSysUserPassword({ ...model.value })
  if (error) return
  emit('submitted');
  closeOperate()
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});

</script>

<template>
  <NModal
    v-model:show="visible"
    :close-on-esc="false"
    :mask-closable="false"
    :title="$t('修改密码')"
    class="w-400px"
    draggable
    preset="card"
  >
    <NForm
      ref="formRef"
      :model="model"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      @keyup.enter="handleSubmit"
    >
      <NFormItem :label="$t('新密码')" path="password">
        <NInput
          v-model:value="model.password"
          :placeholder="$t('请输入新密码')"
          clearable
          show-password-on="click"
          type="password"
        ></NInput>
      </NFormItem>
    </NForm>
    <template #footer>
      <OperateButtons @cancel="closeOperate" @confirm="handleSubmit" />
    </template>
  </NModal>
</template>

<style scoped>

</style>
