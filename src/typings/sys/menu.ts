export type SysMenuQueryType = Api.Common.CommonRecord<{
  menuId: string; // 菜单ID
  key: string; // 参数名
  value: string; // 参数值
}>;

export type SysMenuQueryParams = CommonType.RecordNullable<SysMenuQueryType>;

export type SysMenuQuerySortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysMenuQueryType>>;

export type MenuType = '1' | '2'
export type IconType = '1' | '2'

export type SysMenuType = Api.Common.CommonRecord<{
  status: CommonType.Status; // 状态（1-正常，0-停用）
  parentId: string; // 父菜单ID（0表示根菜单）
  menuType: MenuType; // 菜单类型（1:目录 2:菜单）
  menuName: string; // 菜单名称
  routeName: string; // 路由名称
  routePath: string; // 路由路径
  component: string; // 组件路径
  icon: string; // 图标（iconify图标名或本地图标名）
  iconType: IconType; // 图标类型（1:iconify图标 2:本地图标）
  i18nKey: string; // 国际化key
  keepAlive: CommonType.YesOrNo; // 是否缓存（0:否 1:是）
  constant: CommonType.YesOrNo; // 是否常量路由（0:否 1:是）
  sortOrder: number; // 排序号
  href: string; // 外链地址
  hideInMenu: CommonType.YesOrNo; // 是否在菜单中隐藏（0:否 1:是）
  activeMenu: string; // 激活的菜单（用于高亮）
  multiTab: CommonType.YesOrNo; // 是否支持多标签（0:否 1:是）
  fixedIndexInTab: number; // 在tab中的固定索引

  query: SysMenuQueryParams[]

  children: SysMenuType[]
}>;

export type SysMenuParams = CommonType.RecordNullable<SysMenuType>;

export type SysMenuSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysMenuType>>;

export type MenuTree = {
  id: string;
  label: string;
  pId: string;
  children?: MenuTree[];
};
