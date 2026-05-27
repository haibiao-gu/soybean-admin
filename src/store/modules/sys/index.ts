import { SetupStoreId } from "@/enum";
import { fetchSysMenuTree } from "@/service/api/sys/menu";
import { fetchSysRoleList } from "@/service/api/sys/role";
import type { MenuTree } from "@/typings/sys/menu";
import { defineStore } from "pinia";
import { ref } from "vue";
import { convertToMenuTree } from "./shared";

export const useSysStore = defineStore(SetupStoreId.Sys, () => {

  const roleOptions = ref<CommonType.Option[]>([])

  async function initRoleOptions() {
    const { data, error } = await fetchSysRoleList({}, {})
    if (error) return
    roleOptions.value = data.map(item => ({
      label: item.roleName,
      value: item.id
    }))
  }

  const menuTree = ref<MenuTree[]>([])

  async function initMenuTree() {
    const { data, error } = await fetchSysMenuTree()
    if (error) return

    // 转换数据格式，并过滤掉 null 值
    menuTree.value = data
      .map(item => convertToMenuTree(item))
      .filter((item): item is MenuTree => item !== null);
  }

  function init() {
    initRoleOptions()
    initMenuTree()
  }

  init()

  return {
    roleOptions,
    initRoleOptions,
    menuTree,
    initMenuTree,
  }
})
