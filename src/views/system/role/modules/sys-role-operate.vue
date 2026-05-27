<script lang="ts" setup>
import OperateButtons from '@/components/advanced/operate-buttons.vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchInsertSysRole, fetchSysRole, fetchUpdateSysRole } from '@/service/api/sys/role';
import type { SysRoleMenuType, SysRoleParams, SysRoleType } from '@/typings/sys/role';
import { computed, ref, watch } from 'vue';
import { useBoolean } from "~/packages/hooks";
import SysRoleMenuTree from "./sys-role-menu-tree.vue";

defineOptions({
  name: 'SysRoleOperate'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', data: SysRoleType): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('新增角色'),
    edit: $t('编辑角色')
  };
  return titles[props.operateType];
});

type Model = Pick<SysRoleParams,
  | 'roleName'
  | 'roleCode'
  | 'description'
> & {
  menus: SysRoleMenuType[];
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roleName: null, // 角色名称
    roleCode: null, // 角色编码
    description: null, // 角色描述
    menus: [],
  };
}

type RuleKey = Extract<keyof Model,
  | 'roleName'
  | 'roleCode'
>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  roleName: defaultRequiredRule,
  roleCode: defaultRequiredRule,
};

async function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowId) {
    const { data, error } = await fetchSysRole(props.rowId);
    if (error) return;
    Object.assign(model.value, data);
  }

  if (!model.value.menus) {
    model.value.menus = [];
  }
}

function closeOperate() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  const func = props.operateType === 'add' ? fetchInsertSysRole : fetchUpdateSysRole;

  const { data, error } = await func(model.value);
  if (error) return;
  window.$message?.success(props.operateType === 'add' ? $t('新增成功') : $t('修改成功'));
  closeOperate();
  emit('submitted', data);
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});

const { bool: roleMenuVisible, setTrue: openRoleMenu } = useBoolean();

function handleRoleMenuSubmitted(val: SysRoleMenuType[]) {
  model.value.menus = val;
}

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
      <NFormItem :label="$t('角色名称')" path="roleName">
        <NInput v-model:value="model.roleName" :placeholder="$t('请输入角色名称')" clearable />
      </NFormItem>
      <NFormItem :label="$t('角色编码')" path="roleCode">
        <NInput v-model:value="model.roleCode" :placeholder="$t('请输入角色编码')" clearable />
      </NFormItem>
      <NFormItem :label="$t('角色描述')" path="description">
        <NInput v-model:value="model.description" :placeholder="$t('请输入角色描述')" clearable type="textarea" />
      </NFormItem>
    </NForm>
    <template #footer>
      <OperateButtons @cancel="closeOperate" @confirm="handleSubmit">
        <template #prefix>
          <NButton @click="openRoleMenu">
            {{ $t('配置菜单') }}
          </NButton>
        </template>
      </OperateButtons>
    </template>
    <SysRoleMenuTree v-model:visible="roleMenuVisible" :active-menus="model.menus" :role-id="rowId" @submitted="handleRoleMenuSubmitted" />
  </NModal>
</template>

<style scoped></style>
