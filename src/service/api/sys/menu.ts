import type { SysMenuParams, SysMenuSortParams, SysMenuType } from '@/typings/sys/menu';
import { request } from '../../request';

export function fetchSysMenuPage(
  data: SysMenuParams,
  pagination: Api.Common.PaginatingParams,
  sort: SysMenuSortParams
) {
  return request<Api.Common.PaginatingQueryRecord<SysMenuType>>({
    url: '/sys/menu/page',
    params: {
      ...pagination,
      ...sort
    },
    data
  });
}

export function fetchSysMenuList(
  data: SysMenuParams,
  sort: SysMenuSortParams
) {
  return request<SysMenuType[]>({
    url: '/sys/menu/list',
    params: {
      ...sort
    },
    data
  });
}

export function fetchSysMenu(id: string) {
  return request<SysMenuType>({
    url: '/sys/menu/get',
    params: {
      id
    }
  });
}

export function fetchInsertSysMenu(data: Partial<SysMenuParams>) {
  return request<SysMenuType>({
    url: '/sys/menu/create',
    data
  });
}

export function fetchUpdateSysMenu(data: Partial<SysMenuParams>) {
  return request<SysMenuType>({
    url: '/sys/menu/update',
    data
  });
}

export function fetchDeleteSysMenu(ids: string[]) {
  return request<string[]>({
    url: '/sys/menu/delete',
    data: ids
  });
}

export function fetchResetSysMenuSortOrder(ids: string[]) {
  return request<string[]>({
    url: '/sys/menu/resetSortOrder',
    data: ids
  });
}

export function fetchSysMenuTree() {
  return request<SysMenuType[]>({
    url: '/sys/menu/tree',
  });
}

export function fetchAllSysMenuPages() {
  return request<string[]>({
    url: '/sys/menu/allPages',
  });
}
