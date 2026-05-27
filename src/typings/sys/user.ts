export type SysUserRoleType = {
  userId: string; // 用户ID
  roleId: string; // 角色ID
};

export type SysUserRoleParams = CommonType.RecordNullable<SysUserRoleType>;

export type SysUserRoleSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof SysUserRoleType>>;

export type UserInfoType = Api.Common.CommonRecord<{
  userName: string; // 用户姓名
  userPhone: string; // 手机号码
  userAvatar: string; // 头像
  status: CommonType.Status; // 状态

  roles: SysUserRoleParams[]
}>;

export type UserInfoParams = CommonType.RecordNullable<UserInfoType>;

export type UserInfoSortParams = CommonType.RecordNullable<Api.Common.SortParams<keyof UserInfoType>>;
