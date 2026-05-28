<script lang="tsx" setup>
import TableColumnOperation from '@/components/advanced/table-column-operation.vue';
import { statusRecord, statusTagMapRecord } from '@/constants/common';
import { useAuth } from "@/hooks/business/auth";
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteSysUser, fetchSysUserPage } from '@/service/api/sys/user';
import { useAppStore } from '@/store/modules/app';
import { useSysStore } from "@/store/modules/sys";
import type { UserInfoParams, UserInfoSortParams } from '@/typings/sys/user';
import type { DataTableSortState } from 'naive-ui';
import { reactive } from 'vue';
import UserOperate from './modules/user-operate.vue';
import UserSearch from './modules/user-search.vue';

const { hasAuth } = useAuth()
const appStore = useAppStore();
const sysStore = useSysStore()

const paginatingParams = reactive<Api.Common.PaginatingParams>({
  pageNumber: 1,
  pageSize: 20
});

const sortParams = reactive<UserInfoSortParams>({
  columnKey: null,
  order: null
});

const searchParams = reactive<UserInfoParams>({
  userName: null,
  userPhone: null,
  status: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchSysUserPage(searchParams, paginatingParams, sortParams),
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
        key: 'userAvatar',
        title: $t('头像'),
        align: 'center',
        width: 64,
        render: row => <NAvatar src={row.userAvatar} />
      },
      {
        key: 'userName',
        title: $t('用户姓名'),
        align: 'center',
        sorter: true,
        minWidth: 100
      },
      {
        key: 'userPhone',
        title: $t('手机号码'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'roles',
        title: $t('角色'),
        align: 'center',
        minWidth: 120,
        render: row => {
          const roles = row.roles.map(item => {
            const option = sysStore.roleOptions.find(e => e.value === item.roleId);
            return option && <NTag bordered={false} class="justify-center">
              {option.label}
            </NTag>
          })

          return <NFlex justify="space-around">
            {roles}
          </NFlex>
        }
      },
      {
        key: 'status',
        title: $t('状态'),
        sorter: true,
        align: 'center',
        minWidth: 120,
        render: row => <NTag type={statusTagMapRecord[row.status]}>{statusRecord[row.status]}</NTag>
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        render: row => (
          <TableColumnOperation
            showEdit
            showDelete={hasAuth('sys:user:delete')}
            onEdit={() => edit(row.id)}
            onDelete={() => handleDelete(row.id)}
          />
        )
      }
    ]
  });

const { operateVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

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
  const { error } = await fetchDeleteSysUser(checkedRowKeys.value);
  if (error) return
  onBatchDeleted();
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteSysUser([id]);
  if (error) return
  onDeleted();
}

function edit(id: string) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :bordered="false" :title="$t('用户列表')" class="card-wrapper sm:flex-1-hidden" size="small">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('sys:user:add')"
          :show-delete="hasAuth('sys:user:delete')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
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
      <UserOperate
        v-model:visible="operateVisible"
        :operate-type="operateType"
        :row-id="editingData?.id"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
