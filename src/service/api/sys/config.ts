import { SysConfigGroupType, SysConfigType } from '@/typings/sys/config';
import { request } from '../../request';

export function fetchConfigByGroup(group: SysConfigGroupType) {
  return request<SysConfigType[]>({
    url: '/sys/config/getByGroup',
    params: { group }
  });
}

export function fetchSaveConfig(data: SysConfigType[]) {
  return request<void>({
    url: '/sys/config/save',
    data
  });
}

export function fetchTestMail(to: string) {
  return request<void>({
    url: '/sys/config/testMail',
    data: { to }
  });
}

export function fetchTestUpload() {
  return request<void>({
    url: '/sys/config/testUpload'
  });
}
