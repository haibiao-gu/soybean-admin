<script lang="ts" setup>

import OperateButtons from "@/components/advanced/operate-buttons.vue";
import { $t } from "@/locales";
import { useSysStore } from "@/store/modules/sys";
import type { MenuTree } from "@/typings/sys/menu";
import type { SysRoleMenuType } from "@/typings/sys/role";
import { ref, watch } from "vue";

defineOptions({
  name: 'SysRoleMenuTree'
});

interface Props {
  activeMenus: SysRoleMenuType[];
  roleId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', data: SysRoleMenuType[]): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const sysStore = useSysStore()

const checks = ref<string[]>([])

const menuTree = ref<MenuTree[]>([])

function closeOperate() {
  visible.value = false;
}

async function handleSubmit() {
  closeOperate();
  emit('submitted', checks.value.map(item => {
    return {
      roleId: props.roleId!,
      menuId: item
    }
  }));
}

async function initMenuTree() {
  // 设置已选中的菜单
  checks.value = props.activeMenus.map(menu => menu.menuId);

  await sysStore.initMenuTree()
  menuTree.value = sysStore.menuTree
}

watch(visible, () => {
  if (visible.value) {
    initMenuTree()
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    :close-on-esc="false"
    :mask-closable="false"
    :title="$t('权限菜单')"
    class="w-300px"
    draggable
    preset="card"
  >
    <NTree
      v-model:checked-keys="checks"
      :data="menuTree"
      block-line
      cascade
      checkable
      class="h-280px"
      default-expand-all
      expand-on-click
      key-field="id"
      show-line
      virtual-scroll
    />
    <template #footer>
      <OperateButtons @cancel="closeOperate" @confirm="handleSubmit"></OperateButtons>
    </template>
  </NModal>
</template>

<style scoped>

</style>
