<script lang="ts" setup>
import { useSvgIcon } from '@/hooks/common/icon';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import { useAuthStore } from '@/store/modules/auth';
import { useBoolean } from "@sa/hooks";
import type { VNode } from 'vue';
import { computed } from 'vue';

defineOptions({
  name: 'UserAvatar'
});

const authStore = useAuthStore();
const { bool: visible, setTrue: openModal } = useBoolean();
const { routerPushByKey, toLogin } = useRouterPush();
const { SvgIconVNode } = useSvgIcon();

function loginOrRegister() {
  toLogin();
}

type DropdownKey = 'logout' | 'changePassword';

type DropdownOption =
  | {
  key: DropdownKey;
  label: string;
  icon?: () => VNode;
}
  | {
  type: 'divider';
  key: string;
};

const options = computed(() => {
  const opts: DropdownOption[] = [
    {
      label: $t('修改密码'),
      key: 'changePassword',
      icon: SvgIconVNode({ localIcon: 'password', fontSize: 18 })
    },
    {
      label: $t('common.logout'),
      key: 'logout',
      icon: SvgIconVNode({ icon: 'ph:sign-out', fontSize: 18 })
    }
  ];

  return opts;
});

function logout() {
  window.$dialog?.info({
    title: $t('common.tip'),
    content: $t('common.logoutConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      authStore.resetStore();
    }
  });
}

function handleDropdown(key: DropdownKey) {
  if (key === 'logout') {
    logout();
  } else if (key === 'changePassword') {
    openModal()
  } else {
    // If your other options are jumps from other routes, they will be directly supported here
    routerPushByKey(key);
  }
}
</script>

<template>
  <NButton v-if="!authStore.isLogin" quaternary @click="loginOrRegister">
    {{ $t('page.login.common.loginOrRegister') }}
  </NButton>
  <NDropdown v-else :options="options" placement="bottom" trigger="click" @select="handleDropdown">
    <div>
      <ButtonIcon>
        <SvgIcon class="text-icon-large" icon="ph:user-circle" />
        <span class="text-16px font-medium">{{ authStore.userInfo.nickname }}</span>
      </ButtonIcon>
    </div>
  </NDropdown>
  <ChangePassword v-model:visible="visible" />
</template>

<style scoped></style>
