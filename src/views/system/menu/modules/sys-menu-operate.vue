<script lang="tsx" setup>
import OperateButtons from '@/components/advanced/operate-buttons.vue';
import { statusOptions, yesOrNoOptions } from "@/constants/common";
import { iconTypeOptions, layoutOptions, menuTypeOptions } from "@/constants/menu";
import { useAuth } from "@/hooks/business/auth";
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAllSysMenuPages, fetchInsertSysMenu, fetchSysMenu, fetchUpdateSysMenu } from '@/service/api/sys/menu';
import type { SysMenuParams, SysMenuType } from '@/typings/sys/menu';
import { getLocalIcons } from "@/utils/icon";
import type { SelectOption } from "naive-ui";
import { computed, ref, watch } from 'vue';
import { getLayoutAndPage, getPathParamFromRoutePath, getRoutePathByRouteName, getRoutePathWithParam, transformLayoutAndPageToComponent } from "./shared";

defineOptions({
  name: 'SysMenuOperate'
});

export type OperateType = NaiveUI.TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit row data */
  rowId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', data: SysMenuType): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { hasAuth } = useAuth()
const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('新增菜单'),
    edit: $t('编辑菜单'),
    addChild: $t('新增子菜单')
  };
  return titles[props.operateType];
});

type Model = Pick<SysMenuParams,
  | 'status'
  | 'parentId'
  | 'menuType'
  | 'menuName'
  | 'routeName'
  | 'routePath'
  | 'component'
  | 'icon'
  | 'iconType'
  | 'i18nKey'
  | 'keepAlive'
  | 'constant'
  | 'sortOrder'
  | 'href'
  | 'hideInMenu'
  | 'activeMenu'
  | 'multiTab'
  | 'fixedIndexInTab'
> & {
  query: { key: string, value: string }[];
  permissions: { key: string, value: string }[];
  layout: string | null;
  page: string | null;
  pathParam: string | null;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    status: 'ENABLED', // 状态（1-正常，0-停用）
    parentId: '0', // 父菜单ID（0表示根菜单）
    menuType: '1', // 菜单类型（1:目录 2:菜单）
    menuName: null, // 菜单名称
    routeName: null, // 路由名称
    routePath: null, // 路由路径
    component: null, // 组件路径
    icon: null, // 图标（iconify图标名或本地图标名）
    iconType: '1', // 图标类型（1:iconify图标 2:本地图标）
    i18nKey: null, // 国际化key
    keepAlive: 'N', // 是否缓存（0:否 1:是）
    constant: 'N', // 是否常量路由（0:否 1:是）
    sortOrder: null, // 排序号
    href: null, // 外链地址
    hideInMenu: 'N', // 是否在菜单中隐藏（0:否 1:是）
    activeMenu: null, // 激活的菜单（用于高亮）
    multiTab: 'N', // 是否支持多标签（0:否 1:是）
    fixedIndexInTab: null, // 在tab中的固定索引
    query: [],
    permissions: [],
    layout: null,
    page: null,
    pathParam: null,
  };
}

type RuleKey = Extract<keyof Model,
  | 'parentId'
  | 'menuType'
  | 'menuName'
  | 'routeName'
  | 'routePath'
  | 'status'
>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  parentId: defaultRequiredRule,
  menuType: defaultRequiredRule,
  menuName: defaultRequiredRule,
  routeName: defaultRequiredRule,
  routePath: defaultRequiredRule,
  status: defaultRequiredRule,
};

const disabledMenuType = computed(() => props.operateType === 'edit');

const localIcons = getLocalIcons();
const localIconOptions = localIcons.map<SelectOption>(item => ({
  label: () => (
    <div class="flex-y-center gap-16px">
      <SvgIcon localIcon={item} class="text-icon" />
      <span>{item}</span>
    </div>
  ),
  value: item
}));

const showLayout = computed(() => model.value.parentId === '0');

const showPage = computed(() => model.value.menuType === '2');

const allPages = ref<string[]>([])

const pageOptions = computed(() => {
  const pages = [...allPages.value];

  if (model.value.routeName && !pages.includes(model.value.routeName)) {
    pages.unshift(model.value.routeName);
  }

  const opts: CommonType.Option[] = pages.map(page => ({
    label: page,
    value: page
  }));

  return opts;
});

async function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'addChild') {
    Object.assign(model.value, { parentId: props.rowId });
  }

  if (props.operateType === 'edit' && props.rowId) {
    const { data, error } = await fetchSysMenu(props.rowId);
    if (error) return;
    const { layout, page } = getLayoutAndPage(data.component);
    const { path, param } = getPathParamFromRoutePath(data.routePath);

    Object.assign(model.value, data, { layout, page, routePath: path, pathParam: param });
  }

  if (!model.value.query) {
    model.value.query = [];
  }
}

function closeOperate() {
  visible.value = false;
}

function handleUpdateRoutePathByRouteName() {
  if (model.value.routeName) {
    model.value.routePath = getRoutePathByRouteName(model.value.routeName);
  } else {
    model.value.routePath = '';
  }
}

function getSubmitParams() {
  const { layout, page, pathParam, ...params } = model.value;

  const component = transformLayoutAndPageToComponent(layout!, page!);
  const routePath = getRoutePathWithParam(model.value.routePath!, pathParam!);

  params.component = component;
  params.routePath = routePath;

  return params;
}

async function handleSubmit() {
  await validate();
  // request
  const func = props.operateType === 'edit' ? fetchUpdateSysMenu : fetchInsertSysMenu;

  const { data, error } = await func(getSubmitParams());
  if (error) return;
  window.$message?.success(props.operateType === 'add' ? $t('新增成功') : $t('修改成功'));
  closeOperate();
  emit('submitted', data);
}

async function initAllPages() {
  const { data, error } = await fetchAllSysMenuPages()
  if (error) return
  allPages.value = data
}

watch(visible, () => {
  if (visible.value) {
    initAllPages()
    handleInitModel();
    restoreValidation();
  }
});

watch(
  () => model.value.routeName,
  () => {
    handleUpdateRoutePathByRouteName();
  }
);

const hasPermission = computed(() => {
  return props.operateType === 'edit' ? !hasAuth('sys:menu:edit') : !hasAuth('sys:menu:add')
})

</script>

<template>
  <NModal
    v-model:show="visible"
    :close-on-esc="false"
    :mask-closable="false"
    :title="title"
    class="w-800px"
    draggable
    preset="card"
  >
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :label-width="100" :model="model" :rules="rules" label-placement="left" @keyup.enter="handleSubmit">
        <NGrid item-responsive responsive="screen">
          <NFormItemGi :label="$t('菜单类型')" path="menuType" span="24 m:12">
            <NRadioGroup v-model:value="model.menuType" :disabled="disabledMenuType">
              <NRadio v-for="item in menuTypeOptions" :key="item.value" :label="$t(item.label)" :value="item.value" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :label="$t('菜单名称')" path="menuName" span="24 m:12">
            <NInput v-model:value="model.menuName" :placeholder="$t('请输入菜单名称')" />
          </NFormItemGi>
          <NFormItemGi :label="$t('路由名称')" path="routeName" span="24 m:12">
            <NInput v-model:value="model.routeName" :placeholder="$t('请输入路由名称')" />
          </NFormItemGi>
          <NFormItemGi :label="$t('路由路径')" path="routePath" span="24 m:12">
            <NInput v-model:value="model.routePath" :placeholder="$t('路由路径')" disabled />
          </NFormItemGi>
          <NFormItemGi :label="$t('路径参数')" path="pathParam" span="24 m:12">
            <NInput v-model:value="model.pathParam" :placeholder="$t('请输入路径参数')" />
          </NFormItemGi>
          <NFormItemGi v-if="showLayout" :label="$t('布局')" path="layout" span="24 m:12">
            <NSelect
              v-model:value="model.layout"
              :options="layoutOptions"
              :placeholder="$t('请选择布局')"
            />
          </NFormItemGi>
          <NFormItemGi v-if="showPage" :label="$t('页面组件')" path="page" span="24 m:12">
            <NSelect
              v-model:value="model.page"
              :options="pageOptions"
              :placeholder="$t('请选择页面组件')"
              filterable
              tag
            />
          </NFormItemGi>
          <NFormItemGi :label="$t('国际化key')" path="i18nKey" span="24 m:12">
            <NInput v-model:value="model.i18nKey" :placeholder="$t('请输入国际化key')" />
          </NFormItemGi>
          <NFormItemGi :label="$t('排序')" path="order" span="24 m:12">
            <NInputNumber v-model:value="model.sortOrder" :placeholder="$t('请输入排序')" class="w-full" />
          </NFormItemGi>
          <NFormItemGi :label="$t('图标类型')" path="iconType" span="24 m:12">
            <NRadioGroup v-model:value="model.iconType">
              <NRadio
                v-for="item in iconTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :label="$t('图标')" path="icon" span="24 m:12">
            <template v-if="model.iconType === '1'">
              <NInput v-model:value="model.icon" :placeholder="$t('请输入图标')" class="flex-1">
                <template #suffix>
                  <SvgIcon v-if="model.icon" :icon="model.icon" class="text-icon" />
                </template>
              </NInput>
            </template>
            <template v-if="model.iconType === '2'">
              <NSelect
                v-model:value="model.icon"
                :options="localIconOptions"
                :placeholder="$t('请选择图标')"
              />
            </template>
          </NFormItemGi>
          <NFormItemGi :label="$t('菜单状态')" path="status" span="24 m:12">
            <NRadioGroup v-model:value="model.status">
              <NRadio
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :label="$t('缓存路由')" path="keepAlive" span="24 m:12">
            <NRadioGroup v-model:value="model.keepAlive">
              <NRadio
                v-for="item in yesOrNoOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :label="$t('常量路由')" path="constant" span="24 m:12">
            <NRadioGroup v-model:value="model.constant">
              <NRadio
                v-for="item in yesOrNoOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :label="$t('外链')" path="href" span="24 m:12">
            <NInput v-model:value="model.href" :placeholder="$t('请输入外链地址')" />
          </NFormItemGi>
          <NFormItemGi :label="$t('隐藏菜单')" path="hideInMenu" span="24 m:12">
            <NRadioGroup v-model:value="model.hideInMenu">
              <NRadio
                v-for="item in yesOrNoOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi
            v-if="model.hideInMenu"
            :label="$t('高亮的菜单')"
            path="activeMenu"
            span="24 m:12"
          >
            <NSelect
              v-model:value="model.activeMenu"
              :options="pageOptions"
              :placeholder="$t('请选择高亮的菜单')"
              clearable
              filterable
            />
          </NFormItemGi>
          <NFormItemGi :label="$t('支持多页签')" path="multiTab" span="24 m:12">
            <NRadioGroup v-model:value="model.multiTab">
              <NRadio
                v-for="item in yesOrNoOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :label="$t('固定在页签中的序号')" path="fixedIndexInTab" span="24 m:12">
            <NInputNumber
              v-model:value="model.fixedIndexInTab"
              :placeholder="$t('请输入固定在页签中的序号')"
              class="w-full"
              clearable
            />
          </NFormItemGi>
          <NFormItemGi :label="$t('权限')" span="24">
            <NDynamicInput
              v-model:value="model.permissions"
              :key-placeholder="$t('权限编码')"
              :value-placeholder="$t('权限描述')"
              preset="pair"
            >
              <template #action="{ index, create, remove }">
                <NSpace class="ml-12px">
                  <NButton size="medium" @click="() => create(index)">
                    <icon-ic-round-plus class="text-icon" />
                  </NButton>
                  <NButton size="medium" @click="() => remove(index)">
                    <icon-ic-round-remove class="text-icon" />
                  </NButton>
                </NSpace>
              </template>
            </NDynamicInput>
          </NFormItemGi>
          <NFormItemGi :label="$t('路由参数')" span="24">
            <NDynamicInput
              v-model:value="model.query"
              :key-placeholder="$t('参数名')"
              :value-placeholder="$t('参数值')"
              preset="pair"
            >
              <template #action="{ index, create, remove }">
                <NSpace class="ml-12px">
                  <NButton size="medium" @click="() => create(index)">
                    <icon-ic-round-plus class="text-icon" />
                  </NButton>
                  <NButton size="medium" @click="() => remove(index)">
                    <icon-ic-round-remove class="text-icon" />
                  </NButton>
                </NSpace>
              </template>
            </NDynamicInput>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NScrollbar>
    <template #footer>
      <OperateButtons :hide-confirm="hasPermission" @cancel="closeOperate" @confirm="handleSubmit" />
    </template>
  </NModal>
</template>

<style scoped></style>
