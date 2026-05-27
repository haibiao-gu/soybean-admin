export type SysRoleMenuType = {
  roleId: string; // 角色ID
  menuId: string; // 菜单ID
};

export type SysRoleMenuParams = CommonType.RecordNullable<SysRoleMenuType>;

export type SysRoleMenuSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysRoleMenuType>>;

export type SysRoleType = Api.Common.CommonRecord<{
  roleName: string; // 角色名称
  roleCode: string; // 角色编码
  description: string; // 角色描述

  menus: SysRoleMenuParams[]
}>;

export type SysRoleParams = CommonType.RecordNullable<SysRoleType>;

export type SysRoleSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysRoleType>>;
