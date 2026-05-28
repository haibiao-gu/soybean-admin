export type SysMenuQueryType = Api.Common.CommonRecord<{
  // 菜单ID
  menuId: string;
  // 参数名
  key: string;
  // 参数值
  value: string;
}>;

export type SysMenuQueryParams = CommonType.RecordNullable<SysMenuQueryType>;

export type SysMenuQuerySortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysMenuQueryType>>;

export type SysMenuPermissionType = Api.Common.CommonRecord<{
  // 菜单ID
  menuId: string;
  // 权限
  key: string;
  // 描述
  value: string;
}>;

export type SysMenuPermissionParams = CommonType.RecordNullable<SysMenuPermissionType>;

export type SysMenuPermissionSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysMenuPermissionType>>;

export type MenuType = '1' | '2'
export type IconType = '1' | '2'

export type SysMenuType = Api.Common.CommonRecord<{
  // 状态（1-正常，0-停用）
  status: CommonType.Status;
  // 父菜单ID（0表示根菜单）
  parentId: string;
  // 菜单类型（1:目录 2:菜单）
  menuType: MenuType;
  // 菜单名称
  menuName: string;
  // 路由名称
  routeName: string;
  // 路由路径
  routePath: string;
  // 组件路径
  component: string;
  // 图标（iconify图标名或本地图标名）
  icon: string;
  // 图标类型（1:iconify图标 2:本地图标）
  iconType: IconType;
  // 国际化key
  i18nKey: string;
  // 是否缓存（0:否 1:是）
  keepAlive: CommonType.YesOrNo;
  // 是否常量路由（0:否 1:是）
  constant: CommonType.YesOrNo;
  // 排序号
  sortOrder: number;
  // 外链地址
  href: string;
  // 是否在菜单中隐藏（0:否 1:是）
  hideInMenu: CommonType.YesOrNo;
  // 激活的菜单（用于高亮）
  activeMenu: string;
  // 是否支持多标签（0:否 1:是）
  multiTab: CommonType.YesOrNo;
  // 在tab中的固定索引
  fixedIndexInTab: number;

  query: SysMenuQueryParams[]

  permissions: SysMenuPermissionParams[]

  children: SysMenuType[]
}>;

export type SysMenuParams = CommonType.RecordNullable<SysMenuType>;

export type SysMenuSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysMenuType>>;

export type MenuTree = {
  id: string;
  label: string;
  pId: string;
  children?: MenuTree[];
  permissions?: SysMenuPermissionParams[]
};
