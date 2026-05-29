<script lang="ts" setup>
import OperateButtons from '@/components/advanced/operate-buttons.vue';
import { statusOptions } from '@/constants/common';
import { useAuth } from "@/hooks/business/auth";
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchInsertSysUser, fetchSysUser, fetchUpdateSysUser } from '@/service/api/sys/user';
import { useSysStore } from "@/store/modules/sys";
import type { SysUserRoleType, UserInfoParams } from '@/typings/sys/user';
import { computed, ref, watch } from 'vue';
import UserChangePassword from "./user-change-password.vue";

defineOptions({
  name: 'UserOperate'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { hasAuth } = useAuth()
const sysStore = useSysStore()

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('新增用户'),
    edit: $t('编辑用户')
  };
  return titles[props.operateType];
});

type Model = Pick<UserInfoParams, 'id' | 'userName' | 'userPhone' | 'status'> & { roles: SysUserRoleType[] };

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: null,
    userName: null,
    userPhone: null,
    status: 'ENABLED',
    roles: []
  };
}

type RuleKey = Extract<keyof Model, 'userName' | 'userPhone'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  userName: defaultRequiredRule,
  userPhone: defaultRequiredRule
};

const selectedRoles = ref<string[]>([])

async function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowId) {
    const { data, error } = await fetchSysUser(props.rowId);
    if (error) return;
    Object.assign(model.value, data);
  }

  if (!model.value.roles) {
    model.value.roles = [];
  }
  selectedRoles.value = model.value.roles.map(item => item.roleId)
}

function closeOperate() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  const func = props.operateType === 'add' ? fetchInsertSysUser : fetchUpdateSysUser;

  model.value.roles = selectedRoles.value.map(item => {
    return {
      userId: props.rowId!,
      roleId: item
    }
  })

  const { error } = await func(model.value);
  if (error) return;
  window.$message?.success(props.operateType === 'add' ? $t('新增成功') : $t('修改成功'));
  closeOperate();
  emit('submitted');
}

const roleOptions = ref<CommonType.Option[]>([])

async function initRoleOptions() {
  await sysStore.initRoleOptions()
  roleOptions.value = sysStore.roleOptions
}

watch(visible, () => {
  if (visible.value) {
    initRoleOptions();
    handleInitModel();
    restoreValidation();
  }
});

const changePasswordVisible = ref<boolean>(false);

const hasPermission = computed(() => {
  return props.operateType === 'edit' ? !hasAuth('sys:user:edit') : !hasAuth('sys:user:add')
})

</script>

<template>
  <NModal
    v-model:show="visible"
    :close-on-esc="false"
    :mask-closable="false"
    :title="title"
    class="w-400px"
    draggable
    preset="card"
  >
    <NForm ref="formRef" :model="model" :rules="rules" @keyup.enter="handleSubmit">
      <NFormItem :label="$t('用户姓名')" path="userName">
        <NInput v-model:value="model.userName" :placeholder="$t('请输入用户姓名')" clearable />
      </NFormItem>
      <NFormItem :label="$t('手机号码')" path="userPhone">
        <NInput v-model:value="model.userPhone" :placeholder="$t('请输入手机号码')" clearable />
      </NFormItem>
      <NFormItem :label="$t('角色')" path="roles">
        <PinyinSelect
          v-model:value="selectedRoles"
          :options="roleOptions"
          :placeholder="$t('请选择角色')"
          clearable
          multiple
        />
      </NFormItem>
      <NFormItem :label="$t('状态')" path="status">
        <NFlex class="w-full" justify="space-between">
          <NRadioGroup v-model:value="model.status" name="status">
            <NRadioButton v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </NRadioGroup>
          <NButton @click="changePasswordVisible=true">
            {{ $t('修改密码') }}
          </NButton>
        </NFlex>
      </NFormItem>
    </NForm>
    <template #footer>
      <OperateButtons :hide-confirm="hasPermission" @cancel="closeOperate" @confirm="handleSubmit" />
    </template>
    <UserChangePassword v-if="hasAuth('sys:user:resetPassword')" v-model:visible="changePasswordVisible" :user-id="model.id" />
  </NModal>
</template>

<style scoped></style>
