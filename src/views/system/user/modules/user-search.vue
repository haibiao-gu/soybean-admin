<script lang="ts" setup>
import TableSearchButtons from '@/components/advanced/table-search-buttons.vue';
import { statusOptions } from '@/constants/common';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import type { UserInfoParams } from '@/typings/sys/user';
import { jsonClone } from '@sa/utils';
import { toRaw } from 'vue';

defineOptions({
  name: 'UserSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef } = useNaiveForm();

const model = defineModel<UserInfoParams>('model', { required: true });

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
            <NFormItemGi :label="$t('用户姓名')" class="pr-24px" path="userName" span="24 s:12 m:6">
              <NInput v-model:value="model.userName" :placeholder="$t('请输入用户姓名')" clearable />
            </NFormItemGi>
            <NFormItemGi :label="$t('手机号码')" class="pr-24px" path="userPhone" span="24 s:12 m:6">
              <NInput v-model:value="model.userPhone" :placeholder="$t('请输入手机号码')" clearable />
            </NFormItemGi>
            <NFormItemGi :label="$t('状态')" class="pr-24px" path="status" span="24 s:12 m:6">
              <PinyinSelect v-model:value="model.status" :options="statusOptions" clearable />
            </NFormItemGi>
            <NFormItemGi class="pr-24px" span="24 s:12 m:6">
              <TableSearchButtons @reset="handleReset" @search="handleSearch" />
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
