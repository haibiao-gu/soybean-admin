<script lang="tsx" setup>
import TableColumnOperation from '@/components/advanced/table-column-operation.vue';
import { statusRecord, statusTagMapRecord, yesOrNoRecord, yesOrNoTagMapRecord } from "@/constants/common";
import { menuTypeRecord, menuTypeTagMapRecord } from "@/constants/menu";
import { useAuth } from "@/hooks/business/auth";
import { useNaiveTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteSysMenu, fetchExportSysMenu, fetchSysMenuTree } from '@/service/api/sys/menu';
import { useAppStore } from '@/store/modules/app';
import { useBoolean } from "@sa/hooks";
import { ref } from "vue";
import type { OperateType } from "./modules/sys-menu-operate.vue";
import SysMenuOperate from "./modules/sys-menu-operate.vue";

const { hasAuth } = useAuth()
const appStore = useAppStore();

const { columns, columnChecks, data: tableData, getData, loading, scrollX } =
  useNaiveTable({
    api: () => fetchSysMenuTree(),
    transform: response => response.data!,
    columns: () => [
      {
        type: 'selection',
        align: 'center',
        fixed: 'left',
        width: 48
      },
      {
        key: 'menuType',
        title: $t('菜单类型'),
        align: 'center',
        fixed: 'left',
        width: 120,
        render: row => <NTag type={menuTypeTagMapRecord[row.menuType]}>{menuTypeRecord[row.menuType]}</NTag>
      },
      {
        key: 'sortOrder',
        title: $t('common.index'),
        align: 'center',
        width: 64,
      },
      {
        key: 'icon',
        title: $t('图标'),
        align: 'center',
        width: 64,
        render: row => {
          const icon = row.iconType === '1' ? row.icon : undefined;

          const localIcon = row.iconType === '2' ? row.icon : undefined;

          return (
            <div class="flex-center">
              <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
            </div>
          );
        }
      },
      {
        key: 'menuName',
        title: $t('菜单名称'),
        align: 'center',
        fixed: 'left',
        width: 120,
      },
      {
        key: 'routeName',
        title: $t('路由名称'),
        align: 'center',
        width: 220,
      },
      {
        key: 'status',
        title: $t('状态'),
        align: 'center',
        width: 64,
        render: row => <NTag type={statusTagMapRecord[row.status]}>{statusRecord[row.status]}</NTag>
      },
      {
        key: 'keepAlive',
        title: $t('是否缓存'),
        align: 'center',
        width: 80,
        render: row => <NTag type={yesOrNoTagMapRecord[row.keepAlive]}>{yesOrNoRecord[row.keepAlive]}</NTag>
      },
      {
        key: 'hideInMenu',
        title: $t('是否隐藏'),
        align: 'center',
        width: 80,
        render: row => <NTag type={yesOrNoTagMapRecord[row.hideInMenu]}>{yesOrNoRecord[row.hideInMenu]}</NTag>
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        titleAlign: 'center',
        align: 'right',
        fixed: 'right',
        width: 230,
        render: row => (
          <TableColumnOperation
            justify="end"
            showEdit
            showDelete={hasAuth('sys:menu:delete')}
            onEdit={() => handleEdit(row.id)} onDelete={() => handleDelete(row.id)}
          >
            {{
              prefix: () => row.menuType === '1' && hasAuth('sys:menu:add') &&
                <NButton
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => handleAddChildMenu(row.id)}
                >
                  {$t('添加子菜单')}
                </NButton>
            }}
          </TableColumnOperation>
        )
      }
    ]
  });

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(tableData, 'id', getData);

async function handleBatchDelete() {
  const { error } = await fetchDeleteSysMenu(checkedRowKeys.value);
  if (error) return
  onBatchDeleted();
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteSysMenu([id]);
  if (error) return
  onDeleted();
}

const operateType = ref<OperateType>('add');
const rowId = ref<string | null>(null);

const { bool: operateVisible, setTrue: openOperate } = useBoolean();

function handleAdd() {
  operateType.value = 'add';
  rowId.value = null
  openOperate();
}

function handleEdit(id: string) {
  operateType.value = 'edit';
  rowId.value = id
  openOperate();
}

async function handleExport() {
  await fetchExportSysMenu({}, {})
}

function handleAddChildMenu(id: string) {
  operateType.value = 'addChild';
  rowId.value = id
  openOperate();
}

</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" :title="$t('系统菜单')" class="card-wrapper sm:flex-1-hidden" size="small">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('sys:menu:add')"
          :show-delete="hasAuth('sys:menu:delete')"
          :show-export="hasAuth('sys:menu:export')"
          :show-import="hasAuth('sys:menu:import')"
          import-url="/sys/menu/import"
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
        :row-key="row => row.id"
        :scroll-x="scrollX"
        class="sm:h-full"
        remote
        size="small"
      />
      <SysMenuOperate
        v-model:visible="operateVisible"
        :operate-type="operateType"
        :row-id="rowId"
        @submitted="() => getData()"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
