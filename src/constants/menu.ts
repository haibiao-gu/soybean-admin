import { IconType, MenuType } from "@/typings/sys/menu";
import { transformRecordToOption } from "@/utils/common";

export const menuTypeRecord: Record<MenuType, App.I18n.I18nKey> = {
  1: '目录',
  2: '菜单',
};

export const menuTypeTagMapRecord: Record<MenuType, NaiveUI.ThemeColor> = {
  1: 'success',
  2: 'primary',
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

export const iconTypeRecord: Record<IconType, App.I18n.I18nKey> = {
  1: 'iconify图标',
  2: '本地图标',
};

export const iconTypeTagMapRecord: Record<IconType, NaiveUI.ThemeColor> = {
  1: 'success',
  2: 'primary',
};

export const iconTypeOptions = transformRecordToOption(iconTypeRecord);

export const layoutRecord: Record<string, App.I18n.I18nKey> = {
  'base': '默认',
  'blank': '全屏',
};

export const layoutOptions = transformRecordToOption(layoutRecord);

