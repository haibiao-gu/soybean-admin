<script lang="ts" setup>
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchChangePassword } from "@/service/api";
import { useAuthStore } from "@/store/modules/auth";
import { computed, ref, watch } from 'vue';

defineOptions({ name: 'ChangePassword' });

const visible = defineModel<boolean>('visible', { default: false });

const { formRef, validate, restoreValidation } = useNaiveForm();
const { formRules, createConfirmPwdRule } = useFormRules();
const authStore = useAuthStore()

type Model = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}

type RuleKey = Extract<keyof Model, 'oldPassword' | 'newPassword' | 'confirmPassword'>;

const rules = computed<Partial<Record<RuleKey, App.Global.FormRule[]>>>(() => {
  return {
    oldPassword: formRules.pwd,
    newPassword: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.value.newPassword)
  };
});

async function handleInitModel() {
  model.value = createDefaultModel();
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { error } = await fetchChangePassword(model.value.oldPassword, model.value.newPassword, authStore.userInfo.phone);
  if (error) return;
  window.$message?.success($t('common.modifySuccess'));
  authStore.resetStore()
  closeDrawer();
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="$t('修改密码')" class="w-360px" preset="card">
    <NForm ref="formRef" :label-width="100" :model="model" :rules="rules" label-placement="left">
      <NFormItem :label="$t('原密码')" path="oldPassword">
        <NInput
          v-model:value="model.oldPassword"
          :placeholder="$t('请输入原密码')"
          type="password"
        />
      </NFormItem>
      <NFormItem :label="$t('新密码')" path="newPassword">
        <NInput
          v-model:value="model.newPassword"
          :placeholder="$t('请输入新密码')"
          type="password"
        />
      </NFormItem>
      <NFormItem :label="$t('再次确认')" path="confirmPassword">
        <NInput
          v-model:value="model.confirmPassword"
          :placeholder="$t('请再次确认新密码')"
          type="password"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <OperateButtons @cancel="closeDrawer" @confirm="handleSubmit" />
    </template>
  </NModal>
</template>

<style scoped></style>
