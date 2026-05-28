<script lang="tsx" setup>
import OperateButtons from "@/components/advanced/operate-buttons.vue";
import { $t } from "@/locales";
import { useSysStore } from "@/store/modules/sys";
import type { MenuTree } from "@/typings/sys/menu";
import type { SysRoleMenuType, SysRolePermissionType } from "@/typings/sys/role";
import type { TreeOption } from 'naive-ui';
import { ref, watch } from "vue";

defineOptions({
  name: 'SysRoleMenuTree'
});

interface Props {
  activeMenus: SysRoleMenuType[];
  activePermissions: SysRolePermissionType[];
  roleId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', data: { menus: SysRoleMenuType[], permissions: SysRolePermissionType[] }): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const sysStore = useSysStore()

const menuChecks = ref<string[]>([])
const permissionChecks = ref<string[]>([])

const menuTree = ref<MenuTree[]>([])

function closeOperate() {
  visible.value = false;
}

async function handleSubmit() {
  closeOperate();
  emit('submitted', {
    menus: menuChecks.value.map(item => {
      return {
        roleId: props.roleId!,
        menuId: item
      }
    }),
    permissions: permissionChecks.value.map(item => {
      return {
        roleId: props.roleId!,
        permissionKey: item
      }
    })
  });
}

async function initMenuTree() {
  // 设置已选中的菜单
  menuChecks.value = props.activeMenus?.map(item => item.menuId) || [];
  permissionChecks.value = props.activePermissions?.map(item => item.permissionKey) || [];

  await sysStore.initMenuTree()
  menuTree.value = sysStore.menuTree
  console.log(menuTree.value)
}

watch(visible, () => {
  if (visible.value) {
    initMenuTree()
  }
});

// 转换为TreeOption类型
function transformToTreeOptions(data: MenuTree[]): TreeOption[] {
  return data.map(menu => {
    const option: TreeOption = {
      key: menu.id,
      label: menu.label,
      children: menu.children ? transformToTreeOptions(menu.children) : [],
      suffix: addSuffix(menu)
    };

    return option;
  });
}

// 添加后缀
function addSuffix(menu: MenuTree) {
  // 把按钮添加为后缀
  return () => {
    const box = menu.permissions?.map(permission => (
      <NGi>
        <NCheckbox value={permission.key!} label={permission.value!}></NCheckbox>
      </NGi>
    ));
    return (
      <NCheckboxGroup v-model:value={permissionChecks.value}>
        <NGrid cols={3} y-gap={8} x-gap={12}>
          {box}
        </NGrid>
      </NCheckboxGroup>
    );
  };
}

</script>

<template>
  <NModal
    v-model:show="visible"
    :close-on-esc="false"
    :mask-closable="false"
    :title="$t('权限菜单')"
    class="w-500px"
    draggable
    preset="card"
  >
    <NTree
      v-model:checked-keys="menuChecks"
      :data="transformToTreeOptions(menuTree)"
      block-line
      cascade
      checkable
      class="h-380px"
      default-expand-all
      expand-on-click
      show-line
      virtual-scroll
    ></NTree>
    <template #footer>
      <OperateButtons @cancel="closeOperate" @confirm="handleSubmit"></OperateButtons>
    </template>
  </NModal>
</template>

<style scoped>
:deep(.n-tree-node-content ) {
  align-items: flex-start;
}
</style>
