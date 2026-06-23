<script lang="tsx" setup>
import TableColumnOperation from '@/components/advanced/table-column-operation.vue';
import { useAuth } from "@/hooks/business/auth";
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteSysRole, fetchExportSysRole, fetchSysRolePage } from '@/service/api/sys/role';
import { useAppStore } from '@/store/modules/app';
import type { SysRoleParams, SysRoleSortParams } from '@/typings/sys/role';
import type { DataTableSortState } from 'naive-ui';
import { reactive } from 'vue';
import SysRoleOperate from './modules/sys-role-operate.vue';
import SysRoleSearch from './modules/sys-role-search.vue';

const { hasAuth } = useAuth()
const appStore = useAppStore();

const paginatingParams = reactive<Api.Common.PaginatingParams>({
  pageNumber: 1,
  pageSize: 20
});

const sortParams = reactive<SysRoleSortParams>({
  columnKey: null,
  order: null
});

const searchParams = reactive<SysRoleParams>({
  roleName: null,
  roleCode: null,
  description: null,
});

const { columns, columnChecks, data: tableData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchSysRolePage(searchParams, paginatingParams, sortParams),
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      paginatingParams.pageNumber = params.page!;
      paginatingParams.pageSize = params.pageSize!;
    },
    columns: () => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'roleName',
        title: $t('角色名称'),
        align: 'center',
        width: 64,
      },
      {
        key: 'roleCode',
        title: $t('角色编码'),
        align: 'center',
        width: 64,
      },
      {
        key: 'description',
        title: $t('角色描述'),
        align: 'center',
        width: 64,
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        render: row => (
          <TableColumnOperation
            showEdit
            showDelete={hasAuth('sys:role:delete')}
            onEdit={() => edit(row.id)}
            onDelete={() => handleDelete(row.id)}
          />
        )
      }
    ]
  });

const { operateVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(tableData, 'id', getData);

// 排序
async function handleSort(options: DataTableSortState) {
  if (options.order) {
    Object.assign(sortParams, options);
  } else {
    sortParams.order = 'none';
  }
  await getData();
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteSysRole(checkedRowKeys.value);
  if (error) return
  onBatchDeleted();
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteSysRole([id]);
  if (error) return
  onDeleted();
}

function edit(id: string) {
  handleEdit(id);
}

async function handleExport() {
  await fetchExportSysRole(searchParams, sortParams)
}

</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SysRoleSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :bordered="false" :title="$t('系统角色')" class="card-wrapper sm:flex-1-hidden" size="small">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('sys:role:add')"
          :show-delete="hasAuth('sys:role:delete')"
          :show-export="hasAuth('sys:role:export')"
          :show-import="hasAuth('sys:role:import')"
          import-url="/sys/role/import"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
          @uploaded="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="tableData"
        :flex-height="!appStore.isMobile"
        :loading="loading"
        :pagination="mobilePagination"
        :row-key="row => row.id"
        :scroll-x="scrollX"
        class="sm:h-full"
        remote
        size="small"
        @update-sorter="handleSort"
      />
      <SysRoleOperate
        v-model:visible="operateVisible"
        :operate-type="operateType"
        :row-id="editingData?.id"
        @submitted="() => getDataByPage()"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
