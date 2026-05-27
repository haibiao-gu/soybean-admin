import type { SysRoleParams, SysRoleSortParams, SysRoleType } from '@/typings/sys/role';
import { request } from '../../request';

export function fetchSysRolePage(
  data: SysRoleParams,
  pagination: Api.Common.PaginatingParams,
  sort: SysRoleSortParams
) {
  return request<Api.Common.PaginatingQueryRecord<SysRoleType>>({
    url: '/sys/role/page',
    params: {
      ...pagination,
      ...sort
    },
    data
  });
}

export function fetchSysRoleList(
  data: SysRoleParams,
  sort: SysRoleSortParams
) {
  return request<SysRoleType[]>({
    url: '/sys/role/list',
    params: {
      ...sort
    },
    data
  });
}

export function fetchSysRole(id: string) {
  return request<SysRoleType>({
    url: '/sys/role/get',
    params: {
      id
    }
  });
}

export function fetchInsertSysRole(data: Partial<SysRoleParams>) {
  return request<SysRoleType>({
    url: '/sys/role/create',
    data
  });
}

export function fetchUpdateSysRole(data: Partial<SysRoleParams>) {
  return request<SysRoleType>({
    url: '/sys/role/update',
    data
  });
}

export function fetchDeleteSysRole(ids: string[]) {
  return request<string[]>({
    url: '/sys/role/delete',
    data: ids
  });
}
