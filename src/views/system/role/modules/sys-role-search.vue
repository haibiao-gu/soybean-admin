<script lang="ts" setup>
import TableSearchButtons from '@/components/advanced/table-search-buttons.vue';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import type { SysRoleParams } from '@/typings/sys/role';
import { jsonClone } from '@sa/utils';
import { toRaw } from 'vue';

defineOptions({
  name: 'SysRoleSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef } = useNaiveForm();

const model = defineModel<SysRoleParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function handleReset() {
  resetModel();
  emit('search');
}

async function handleSearch() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" class="card-wrapper" size="small">
    <NCollapse default-expanded-names="search">
      <NCollapseItem :title="$t('common.search')" name="search">
        <NForm ref="formRef" :label-width="80" :model="model" label-placement="left" @keyup.enter="handleSearch">
          <NGrid item-responsive responsive="screen">
            <NFormItemGi :label="$t('角色名称')" class="pr-24px" path="roleName" span="24 s:12 m:6">
              <NInput v-model:value="model.roleName" :placeholder="$t('请输入角色名称')" clearable />
            </NFormItemGi>
            <NFormItemGi :label="$t('角色编码')" class="pr-24px" path="roleCode" span="24 s:12 m:6">
              <NInput v-model:value="model.roleCode" :placeholder="$t('请输入角色编码')" clearable />
            </NFormItemGi>
            <NFormItemGi class="pr-24px" span="24 s:12 m:12">
              <TableSearchButtons @reset="handleReset" @search="handleSearch" />
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
