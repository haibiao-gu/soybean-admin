import type { MenuTree, SysMenuType } from "@/typings/sys/menu";

// 将 SysMenuType 转换为 MenuTree（递归过滤）
export function convertToMenuTree(menu: SysMenuType): MenuTree | null {
  // 排除 status 为 DISABLED 的菜单
  if (menu.status === 'DISABLED') {
    return null;
  }

  // 排除 constant 为 Y 的菜单
  if (menu.constant === 'Y') {
    return null;
  }

  const tree: MenuTree = {
    id: menu.id,
    label: menu.menuName,
    pId: menu.parentId
  };

  // 递归转换子菜单，并过滤掉不符合条件的
  if (menu.children && menu.children.length > 0) {
    const convertedChildren = menu.children
      .map(child => convertToMenuTree(child))
      .filter((child): child is MenuTree => child !== null);

    // 如果 menuType 为 1（目录）且转换后 children 为空，则排除该节点
    if (menu.menuType === '1' && convertedChildren.length === 0) {
      return null;
    }

    if (convertedChildren.length > 0) {
      tree.children = convertedChildren;
    }
  } else if (menu.menuType === '1') {
    // 如果 menuType 为 1（目录）且原本就没有 children，也排除
    return null;
  }

  return tree;
}
