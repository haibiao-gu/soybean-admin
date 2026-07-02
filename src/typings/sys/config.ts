export type SysConfigGroupType = 'MAIL' | 'UPLOAD';

export interface SysConfigType {
  id: string;
  configGroup: SysConfigGroupType;
  configKey: string;
  configValue: string;
  description: string;
}
