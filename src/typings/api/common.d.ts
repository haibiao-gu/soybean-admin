/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingParams {
      /** current page number */
      pageNumber: number;
      /** page size */
      pageSize: number;
    }

    /**
     * 定义查询排序的接口
     *
     * @template K - 排序所依据的列的键的类型
     */
    interface SortParams<K> {
      /** 指定排序所依据的列的键 */
      columnKey: K;
      /** 指定排序的顺序 可以是 'ascend'（升序）、'descend'（降序）或未定义 */
      order: 'ascend' | 'descend' | 'none' | undefined;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingParams {
      records: T[];
      totalRow: number;
    }

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: string;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record version */
      version: number;
    } & T;
  }
}
