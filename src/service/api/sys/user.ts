import type { UserInfoParams, UserInfoSortParams, UserInfoType } from '@/typings/sys/user';
import { FileDownloader } from "@/utils/download";
import { request } from '../../request';

export function fetchSysUserPage(
  data: UserInfoParams,
  pagination: Api.Common.PaginatingParams,
  sort: UserInfoSortParams
) {
  return request<Api.Common.PaginatingQueryRecord<UserInfoType>>({
    url: '/sys/user/page',
    params: {
      ...pagination,
      ...sort
    },
    data
  });
}

export function fetchExportSysUser(
  data: UserInfoParams,
  sort: UserInfoSortParams
) {
  return FileDownloader.downloadAndSave('/sys/user/export', sort, data);
}

export function fetchSysUser(id: string) {
  return request<UserInfoType>({
    url: '/sys/user/get',
    params: {
      id
    }
  });
}

export function fetchInsertSysUser(data: Partial<UserInfoParams>) {
  return request<UserInfoType>({
    url: '/sys/user/create',
    data
  });
}

export function fetchUpdateSysUser(data: Partial<UserInfoParams>) {
  return request<UserInfoType>({
    url: '/sys/user/update',
    data
  });
}

export function fetchDeleteSysUser(ids: string[]) {
  return request<string[]>({
    url: '/sys/user/delete',
    data: ids
  });
}

export function fetchChangeSysUserPassword(data: Partial<UserInfoParams>) {
  return request<void>({
    url: '/sys/user/changePassword',
    data
  });
}
