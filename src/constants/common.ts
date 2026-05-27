import { $t } from "@/locales";
import { transformRecordToOption } from '@/utils/common';

export const yesOrNoRecord: Record<CommonType.YesOrNo, App.I18n.I18nKey> = {
  Y: $t('common.yesOrNo.yes'),
  N: $t('common.yesOrNo.no')
};

export const yesOrNoTagMapRecord: Record<CommonType.YesOrNo, NaiveUI.ThemeColor> = {
  Y: 'success',
  N: 'error'
};

export const yesOrNoOptions = transformRecordToOption(yesOrNoRecord);

export const statusRecord: Record<CommonType.Status, App.I18n.I18nKey> = {
  ENABLED: '正常',
  DISABLED: '停用'
};

export const statusTagMapRecord: Record<CommonType.Status, NaiveUI.ThemeColor> = {
  ENABLED: 'success',
  DISABLED: 'error'
};

export const statusOptions = transformRecordToOption(statusRecord);
