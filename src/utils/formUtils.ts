import { SysConfigGroupType, SysConfigType } from '@/typings/sys/config';

export function configMapToForm<T extends object>(list: SysConfigType[], form: T) {
  list.forEach(item => {
    const key = item.configKey as keyof T;
    if (key in form) {
      (form as any)[key] = item.configValue || '';
    }
  });
}

export function configMapToSaveList<T extends object>(form: T, configGroup: SysConfigGroupType): SysConfigType[] {
  return Object.entries(form).map(([key, value]) => ({
    id: '',
    configGroup,
    configKey: key,
    configValue: value as string || '',
    description: ''
  }));
}
