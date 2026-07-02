<script lang="ts" setup>
import { $t } from "@/locales";
import { fetchConfigByGroup, fetchSaveConfig, fetchTestMail } from '@/service/api/sys/config';
import { configMapToForm, configMapToSaveList } from "@/utils/formUtils";
import { useMessage } from 'naive-ui';
import { onMounted, reactive, ref } from 'vue';

const message = useMessage();
const loading = ref(false);
const saving = ref(false);
const testing = ref(false);

interface MailConfigForm {
  host: string;
  port: string;
  username: string;
  password: string;
  smtp_auth: string;
  starttls_enable: string;
  from: string;
}

const form = reactive<MailConfigForm>({
  host: '',
  port: '25',
  username: '',
  password: '',
  smtp_auth: 'false',
  starttls_enable: 'false',
  from: ''
});

const testTo = ref('');

async function loadConfig() {
  loading.value = true;
  const { data, error } = await fetchConfigByGroup('MAIL');
  loading.value = false;
  if (error) return
  configMapToForm(data, form);
}

async function saveConfig() {
  saving.value = true;
  const { error } = await fetchSaveConfig(configMapToSaveList(form, 'MAIL'));
  saving.value = false;
  if (error) return
  message.success($t('保存成功'));
}

async function testMailConfig() {
  if (!testTo.value) {
    message.warning($t('请输入测试收件地址'));
    return;
  }
  testing.value = true;
  const { error } = await fetchTestMail(testTo.value);
  testing.value = false;
  if (error) return
  message.success($t('测试邮件发送成功'));
}

onMounted(() => loadConfig());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" class="card-wrapper sm:flex-1-hidden" size="small" title="邮箱配置">
      <template #header-extra>
        <NButton :loading="saving" type="primary" @click="saveConfig">保存配置</NButton>
      </template>
      <NSpin :show="loading">
        <NForm :model="form" label-placement="left" label-width="140">
          <NGrid :cols="2" :x-gap="24" responsive="screen">
            <NGi>
              <NFormItem label="SMTP服务器地址" required>
                <NInput v-model:value="form.host" placeholder="如 smtp.qq.com" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="SMTP端口">
                <NInput v-model:value="form.port" placeholder="25" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="用户名">
                <NInput v-model:value="form.username" placeholder="邮箱账号" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="密码/授权码">
                <NInput v-model:value="form.password" placeholder="邮箱密码或授权码" show-password-on="click" type="password" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="SMTP认证">
                <NSwitch v-model:value="form.smtp_auth" checked-value="true" unchecked-value="false" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="STARTTLS">
                <NSwitch v-model:value="form.starttls_enable" checked-value="true" unchecked-value="false" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="发件人地址" required>
                <NInput v-model:value="form.from" placeholder="如 noreply@example.com" />
              </NFormItem>
            </NGi>
          </NGrid>
        </NForm>
        <NDivider title-placement="left">
          {{ $t('发送测试邮件') }}
        </NDivider>
        <NSpace align="center">
          <NInput v-model:value="testTo" :placeholder="$t('请输入测试收件邮箱')" style="width: 300px" />
          <NButton :loading="testing" type="primary" @click="testMailConfig">{{ $t('发送测试邮件') }}</NButton>
        </NSpace>
      </NSpin>
    </NCard>
  </div>
</template>

<style scoped></style>
