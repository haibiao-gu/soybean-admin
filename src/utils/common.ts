import { $t } from '@/locales';

/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label
  })) as CommonType.Option<keyof T, T[keyof T]>[];
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string, App.I18n.I18nKey>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label)
  }));
}

/**
 * Toggle html class
 *
 * @param className
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * 在输入元素的光标位置插入文本
 *
 * @param inputElement - 本地输入元素
 * @param text - 插入文本
 * @param currentValue - 输入的当前值
 * @returns 新值中插入光标位置的文本
 */
export function insertTextAtCursor(inputElement: HTMLInputElement, text: string, currentValue: string): string {
  const start = inputElement.selectionStart || 0;
  const end = inputElement.selectionEnd || 0;

  const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

  setTimeout(() => {
    inputElement.focus();
    const newPosition = start + text.length;
    inputElement.setSelectionRange(newPosition, newPosition);
  }, 0);

  return newValue;
}
