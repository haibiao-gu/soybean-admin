export type SysRoleMenuType = {
  // 角色ID
  roleId: string;
  // 菜单ID
  menuId: string;
};

export type SysRoleMenuParams = CommonType.RecordNullable<SysRoleMenuType>;

export type SysRoleMenuSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysRoleMenuType>>;

export type SysRolePermissionType = {
  // 角色ID
  roleId: string;
  // 权限
  permissionKey: string;
};

export type SysRolePermissionParams = CommonType.RecordNullable<SysRolePermissionType>;

export type SysRolePermissionSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysRolePermissionType>>;

export type SysRoleType = Api.Common.CommonRecord<{
  // 角色名称
  roleName: string;
  // 角色编码
  roleCode: string;
  // 角色描述
  description: string;

  menus: SysRoleMenuParams[]

  permissions: SysRolePermissionParams[]
}>;

export type SysRoleParams = CommonType.RecordNullable<SysRoleType>;

export type SysRoleSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysRoleType>>;
