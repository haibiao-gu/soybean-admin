import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import type { FlatResponseData } from '@sa/axios';
import type { PaginationData, TableColumnCheck, UseTableOptions } from '@sa/hooks';
import { useBoolean, useTable } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import type { PaginationProps } from 'naive-ui';
import Sortable from 'sortablejs';
import type { Ref } from 'vue';
import { computed, effectScope, onScopeDispose, reactive, shallowRef, watch } from 'vue';

export type UseNaiveTableOptions<ResponseData, ApiData, Pagination extends boolean> = Omit<
  UseTableOptions<ResponseData, ApiData, NaiveUI.TableColumn<ApiData>, Pagination>,
  'pagination' | 'getColumnChecks' | 'getColumns'
> & {
  /**
   * get column visible
   *
   * @param column
   *
   * @default true
   *
   * @returns true if the column is visible, false otherwise
   */
  getColumnVisible?: (column: NaiveUI.TableColumn<ApiData>) => boolean;
  /**
   * enable row drag and drop sorting
   *
   * @default false
   */
  enableDragSort?: boolean;
  /**
   * drag sort handle selector
   *
   * @default '.drag-handle'
   */
  dragHandleSelector?: string;
  /**
   * callback after drag sort end
   *
   * @param newData new data order
   */
  onDragSortEnd?: (newData: ApiData[]) => void | Promise<void>;
};

const SELECTION_KEY = '__selection__';

const EXPAND_KEY = '__expand__';

/**
 * 创建拖拽排序实例的公共函数
 */
function createSortable<T>(
  tbody: HTMLElement,
  options: {
    dragHandleSelector?: string;
    onDragSortEnd?: (newData: T[]) => void | Promise<void>;
  },
  state: {
    data: Ref<T[]>;
  }
) {
  // 检查是否已经有 sortable 实例
  if ((tbody as any).sortable) {
    return null;
  }

  try {
    return Sortable.create(tbody, {
      handle: options.dragHandleSelector || '.drag-handle',
      animation: 300,
      delay: 100,
      delayOnTouchOnly: true,
      swapThreshold: 0.7,
      forceFallback: false,
      fallbackClass: 'sortable-fallback',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      easing: 'cubic-bezier(1, 0, 0, 1)',
      filter: '.n-data-table-tr--summary',
      onEnd: async ({ newIndex, oldIndex }) => {
        if (newIndex !== undefined && oldIndex !== undefined && newIndex !== oldIndex) {
          const newData = [...state.data.value];
          const movedItem = newData[oldIndex];
          newData.splice(oldIndex, 1);
          newData.splice(newIndex, 0, movedItem);

          state.data.value = newData;

          await options.onDragSortEnd?.(newData);
        }
      }
    });
  } catch (e) {
    console.error('Error creating sortable:', e);
    return null;
  }
}

/**
 * 初始化拖拽排序的公共函数
 */
function initSortableCommon<T>(
  state: {
    sortableInstance: Sortable | null;
    isDestroying: boolean;
    enableDragSort: boolean;
    loading: Ref<boolean>;
    data: Ref<T[]>;
  },
  callbacks: {
    setSortableInstance: (instance: Sortable | null) => void;
    setIsDestroying: (value: boolean) => void;
    onDragSortEnd?: (newData: T[]) => void | Promise<void>;
    dragHandleSelector?: string;
  }
) {
  if (!state.enableDragSort) return;

  // 如果正在销毁或加载中，不重新初始化
  if (state.isDestroying || state.loading.value) return;

  // 先销毁旧的实例
  if (state.sortableInstance) {
    callbacks.setIsDestroying(true);
    try {
      state.sortableInstance.destroy();
    } catch (e) {
      console.warn('Error destroying sortable:', e);
    }
    callbacks.setSortableInstance(null);
    callbacks.setIsDestroying(false);
  }

  setTimeout(() => {
    const tableElement = document.querySelector('.n-data-table');
    if (!tableElement) {
      console.warn('Sortable: table element not found');
      return;
    }

    const tbody = tableElement.querySelector('tbody') as HTMLElement | null;
    if (!tbody) {
      console.warn('Sortable: tbody element not found');
      return;
    }

    const instance = createSortable(tbody, {
      dragHandleSelector: callbacks.dragHandleSelector,
      onDragSortEnd: callbacks.onDragSortEnd
    }, { data: state.data });

    if (instance) {
      callbacks.setSortableInstance(instance);
    }
  }, 100);
}

/**
 * 销毁拖拽排序实例的公共函数
 */
function destroySortableCommon(state: {
  sortableInstance: Sortable | null;
  isDestroying: boolean;
}, callbacks: {
  setSortableInstance: (instance: Sortable | null) => void;
  setIsDestroying: (value: boolean) => void;
}) {
  if (state.sortableInstance) {
    callbacks.setIsDestroying(true);
    try {
      state.sortableInstance.destroy();
    } catch (e) {
      console.warn('Error destroying sortable:', e);
    }
    callbacks.setSortableInstance(null);
    callbacks.setIsDestroying(false);
  }
}

export function useNaiveTable<ResponseData, ApiData>(options: UseNaiveTableOptions<ResponseData, ApiData, false>) {
  const scope = effectScope();
  const appStore = useAppStore();

  const result = useTable<ResponseData, ApiData, NaiveUI.TableColumn<ApiData>, false>({
    ...options,
    getColumnChecks: cols => getColumnChecks(cols, options.getColumnVisible),
    getColumns
  });

  // calculate the total width of the table this is used for horizontal scrolling
  const scrollX = computed(() => {
    return result.columns.value.reduce((acc, column) => {
      return acc + Number(column.width ?? column.minWidth ?? 120);
    }, 0);
  });

  // drag and drop sort functionality state
  let sortableInstance: Sortable | null = null;
  let isDestroying = false;

  const shouldEnableDragSort = () => {
    if (!options.enableDragSort) return false;
    return true;
  };

  const initSortable = () => {
    if (!shouldEnableDragSort()) return;

    initSortableCommon(
      {
        sortableInstance,
        isDestroying,
        enableDragSort: shouldEnableDragSort(),
        loading: result.loading,
        data: result.data
      },
      {
        setSortableInstance: (instance) => {
          sortableInstance = instance;
        },
        setIsDestroying: (value) => {
          isDestroying = value;
        },
        onDragSortEnd: options.onDragSortEnd,
        dragHandleSelector: options.dragHandleSelector
      }
    );
  };

  const destroySortable = () => {
    destroySortableCommon(
      { sortableInstance, isDestroying },
      {
        setSortableInstance: (instance) => {
          sortableInstance = instance;
        },
        setIsDestroying: (value) => {
          isDestroying = value;
        }
      }
    );
  };

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        result.reloadColumns();
      }
    );

    if (options.enableDragSort) {
      watch(
        () => [result.loading.value, result.data.value.length],
        ([newLoading, newLength]) => {
          if (!newLoading && Number(newLength) > 0) {
            initSortable();
          } else if (newLoading) {
            // 加载时销毁实例，防止拖拽
            destroySortable();
          }
        },
        { immediate: true }
      );
    }
  });

  onScopeDispose(() => {
    destroySortable();
    scope.stop();
  });

  return {
    ...result,
    scrollX,
    initSortable,
    destroySortable
  };
}

type PaginationParams = Pick<PaginationProps, 'page' | 'pageSize'>;

type UseNaivePaginatedTableOptions<ResponseData, ApiData> = UseNaiveTableOptions<ResponseData, ApiData, true> & {
  paginationProps?: Omit<PaginationProps, 'page' | 'pageSize' | 'itemCount'>;
  /**
   * whether to show the total count of the table
   *
   * @default true
   */
  showTotal?: boolean;
  onPaginationParamsChange?: (params: PaginationParams) => void | Promise<void>;
};

export function useNaivePaginatedTable<ResponseData, ApiData>(
  options: UseNaivePaginatedTableOptions<ResponseData, ApiData>
) {
  const scope = effectScope();
  const appStore = useAppStore();

  const isMobile = computed(() => appStore.isMobile);

  const showTotal = computed(() => options.showTotal ?? true);

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100, 200],
    prefix: showTotal.value ? page => $t('datatable.itemCount', { total: page.itemCount }) : undefined,
    onUpdatePage(page) {
      pagination.page = page;
    },
    onUpdatePageSize(pageSize) {
      pagination.pageSize = pageSize;
      pagination.page = 1;
    },
    ...options.paginationProps
  }) as PaginationProps;

  // this is for mobile, if the system does not support mobile, you can use `pagination` directly
  const mobilePagination = computed(() => {
    const p: PaginationProps = {
      ...pagination,
      pageSlot: isMobile.value ? 3 : 9,
      prefix: !isMobile.value && showTotal.value ? pagination.prefix : undefined
    };

    return p;
  });

  const paginationParams = computed(() => {
    const { page, pageSize } = pagination;

    return {
      page,
      pageSize
    };
  });

  const result = useTable<ResponseData, ApiData, NaiveUI.TableColumn<ApiData>, true>({
    ...options,
    pagination: true,
    getColumnChecks: cols => getColumnChecks(cols, options.getColumnVisible),
    getColumns,
    onFetched: data => {
      pagination.itemCount = data.total;
      pagination.pageSize = data.pageSize;
    }
  });

  // drag and drop sort functionality state
  let sortableInstance: Sortable | null = null;
  let isDestroying = false;

  const shouldEnableDragSort = () => {
    if (!options.enableDragSort) return false;
    return true;
  };

  const initSortable = () => {
    if (!shouldEnableDragSort()) return;

    initSortableCommon(
      {
        sortableInstance,
        isDestroying,
        enableDragSort: shouldEnableDragSort(),
        loading: result.loading,
        data: result.data
      },
      {
        setSortableInstance: (instance) => {
          sortableInstance = instance;
        },
        setIsDestroying: (value) => {
          isDestroying = value;
        },
        onDragSortEnd: options.onDragSortEnd,
        dragHandleSelector: options.dragHandleSelector
      }
    );
  };

  const destroySortable = () => {
    destroySortableCommon(
      { sortableInstance, isDestroying },
      {
        setSortableInstance: (instance) => {
          sortableInstance = instance;
        },
        setIsDestroying: (value) => {
          isDestroying = value;
        }
      }
    );
  };

  async function getDataByPage(page: number = 1) {
    if (page !== pagination.page) {
      pagination.page = page;

      return;
    }

    await result.getData();
  }

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        result.reloadColumns();
      }
    );

    if (options.enableDragSort) {
      watch(
        () => [result.loading.value, result.data.value.length],
        ([newLoading, newLength]) => {
          if (!newLoading && Number(newLength) > 0) {
            initSortable();
          } else if (newLoading) {
            // 加载时销毁实例，防止拖拽
            destroySortable();
          }
        },
        { immediate: true }
      );
    }

    watch(paginationParams, async newVal => {
      await options.onPaginationParamsChange?.(newVal);

      await result.getData();
    });
  });

  onScopeDispose(() => {
    destroySortable();
    scope.stop();
  });

  // calculate the total width of the table this is used for horizontal scrolling
  const scrollX = computed(() => {
    return result.columns.value.reduce((acc, column) => {
      return acc + Number(column.width ?? column.minWidth ?? 120);
    }, 0);
  });

  return {
    ...result,
    getDataByPage,
    pagination,
    mobilePagination,
    scrollX,
    initSortable,
    destroySortable
  };
}

export function useTableOperate<TableData>(
  data: Ref<TableData[]>,
  idKey: keyof TableData,
  getData: () => Promise<void>
) {
  const { bool: operateVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean();

  const operateType = shallowRef<NaiveUI.TableOperateType>('add');

  function handleAdd() {
    operateType.value = 'add';
    openDrawer();
  }

  /** the editing row data */
  const editingData = shallowRef<TableData | null>(null);

  function handleEdit(id: TableData[keyof TableData]) {
    operateType.value = 'edit';
    const findItem = data.value.find(item => item[idKey] === id) || null;
    editingData.value = jsonClone(findItem);

    openDrawer();
  }

  /** the checked row keys of table */
  const checkedRowKeys = shallowRef<string[]>([]);

  /** the hook after the batch delete operation is completed */
  async function onBatchDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    checkedRowKeys.value = [];

    await getData();
  }

  /** the hook after the delete operation is completed */
  async function onDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    await getData();
  }

  return {
    operateVisible,
    openDrawer,
    closeDrawer,
    operateType,
    handleAdd,
    editingData,
    handleEdit,
    checkedRowKeys,
    onBatchDeleted,
    onDeleted
  };
}

export function defaultTransform<ApiData>(
  response: FlatResponseData<any, Api.Common.PaginatingQueryRecord<ApiData>>
): PaginationData<ApiData> {
  const { data, error } = response;

  if (!error) {
    const { records, pageNumber, pageSize, totalRow } = data;

    return {
      data: records,
      pageNum: pageNumber,
      pageSize,
      total: totalRow
    };
  }

  return {
    data: [],
    pageNum: 1,
    pageSize: 10,
    total: 0
  };
}

function getColumnChecks<Column extends NaiveUI.TableColumn<any>>(
  cols: Column[],
  getColumnVisible?: (column: Column) => boolean
) {
  const checks: TableColumnCheck[] = [];

  cols.forEach(column => {
    if (isTableColumnHasKey(column)) {
      checks.push({
        key: column.key as string,
        title: column.title!,
        checked: column.defaultShow ?? true,
        fixed: column.fixed ?? 'unFixed',
        visible: getColumnVisible?.(column) ?? true
      });
    } else if (column.type === 'selection') {
      checks.push({
        key: SELECTION_KEY,
        title: $t('common.check'),
        checked: true,
        fixed: column.fixed ?? 'unFixed',
        visible: getColumnVisible?.(column) ?? false,
      });
    } else if (column.type === 'expand') {
      checks.push({
        key: EXPAND_KEY,
        title: $t('common.expandColumn'),
        checked: true,
        fixed: column.fixed ?? 'unFixed',
        visible: getColumnVisible?.(column) ?? false,
      });
    }
  });

  return checks;
}

function getColumns<Column extends NaiveUI.TableColumn<any>>(cols: Column[], checks: TableColumnCheck[]) {
  const columnMap = new Map<string, Column>();

  cols.forEach(column => {
    if (isTableColumnHasKey(column)) {
      columnMap.set(column.key as string, column);
    } else if (column.type === 'selection') {
      columnMap.set(SELECTION_KEY, column);
    } else if (column.type === 'expand') {
      columnMap.set(EXPAND_KEY, column);
    }
  });

  const filteredColumns = checks
    .filter(item => item.checked)
    .map(check => {
      return {
        ...columnMap.get(check.key),
        fixed: check.fixed
      } as Column;
    });

  return filteredColumns;
}

export function isTableColumnHasKey<T>(column: NaiveUI.TableColumn<T>): column is NaiveUI.TableColumnWithKey<T> {
  return Boolean((column as NaiveUI.TableColumnWithKey<T>).key);
}
