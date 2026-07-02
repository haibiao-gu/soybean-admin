<script lang="ts" setup>
import { $t } from "@/locales";
import { fetchConfigByGroup, fetchSaveConfig, fetchTestUpload } from '@/service/api/sys/config';
import { configMapToForm, configMapToSaveList } from "@/utils/formUtils";
import { useMessage } from 'naive-ui';
import { computed, onMounted, reactive, ref } from 'vue';

const message = useMessage();
const loading = ref(false);
const saving = ref(false);
const testing = ref(false);

interface UploadConfigForm {
  store_type: string;
  local_dir: string;
  minio_endpoint: string;
  minio_access_key: string;
  minio_secret_key: string;
  minio_bucket_name: string;
  minio_public_url: string;
}

const form = reactive<UploadConfigForm>({
  store_type: 'LOCAL',
  local_dir: '',
  minio_endpoint: '',
  minio_access_key: '',
  minio_secret_key: '',
  minio_bucket_name: '',
  minio_public_url: ''
});

const storeTypeOptions = [
  { label: '本地存储', value: 'LOCAL' },
  { label: 'MinIO', value: 'MINIO' }
];

const isMinio = computed(() => form.store_type === 'MINIO');

async function loadConfig() {
  loading.value = true;
  const { data, error } = await fetchConfigByGroup('UPLOAD');
  loading.value = false;
  if (error) return
  configMapToForm(data, form);
}

async function saveConfig() {
  saving.value = true;
  const { error } = await fetchSaveConfig(configMapToSaveList(form, 'UPLOAD'));
  saving.value = false;
  if (error) return
  message.success($t('保存成功'));
}

async function testUploadConfig() {
  testing.value = true;
  const { error } = await fetchTestUpload();
  testing.value = false;
  if (error) return
  message.success($t('上传存储配置测试通过'));
}

onMounted(() => loadConfig());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" :title="$t('上传配置')" class="card-wrapper sm:flex-1-hidden" size="small">
      <template #header-extra>
        <NButton :loading="saving" type="primary" @click="saveConfig">
          {{ $t('保存配置') }}
        </NButton>
      </template>
      <NSpin :show="loading">
        <NForm :model="form" label-placement="left" label-width="140">
          <NGrid :cols="2" :x-gap="24" responsive="screen">
            <NGi :span="2">
              <NFormItem :label="$t('存储类型')" required>
                <NRadioGroup v-model:value="form.store_type">
                  <NRadio v-for="opt in storeTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </NRadioGroup>
              </NFormItem>
            </NGi>

            <!-- 本地存储 -->
            <NGi v-if="!isMinio" :span="2">
              <NFormItem :label="$t('上传目录')" required>
                <NInput v-model:value="form.local_dir" :placeholder="$t('如 /data/upload')" />
              </NFormItem>
            </NGi>

            <!-- MinIO -->
            <template v-if="isMinio">
              <NGi>
                <NFormItem :label="$t('MinIO地址')" required>
                  <NInput v-model:value="form.minio_endpoint" :placeholder="$t('如 http://localhost:9000')" />
                </NFormItem>
              </NGi>
              <NGi>
                <NFormItem :label="$t('桶名称')" required>
                  <NInput v-model:value="form.minio_bucket_name" :placeholder="$t('如 soybean')" />
                </NFormItem>
              </NGi>
              <NGi>
                <NFormItem :label="$t('AccessKey')" required>
                  <NInput v-model:value="form.minio_access_key" :placeholder="$t('MinIO AccessKey')" />
                </NFormItem>
              </NGi>
              <NGi>
                <NFormItem :label="$t('SecretKey')" required>
                  <NInput v-model:value="form.minio_secret_key" placeholder="MinIO SecretKey" show-password-on="click" type="password" />
                </NFormItem>
              </NGi>
              <NGi :span="2">
                <NFormItem :label="$t('公网访问地址')">
                  <NInput v-model:value="form.minio_public_url" :placeholder="$t('如 http://public.example.com:9000（可选）')" />
                </NFormItem>
              </NGi>
            </template>
          </NGrid>
        </NForm>
        <NDivider title-placement="left">
          {{ $t('测试连通性') }}
        </NDivider>
        <NSpace align="center">
          <NButton :loading="testing" type="primary" @click="testUploadConfig">
            {{ $t('测试连通性') }}
          </NButton>
          <NText depth="3">
            {{ $t('测试当前存储配置是否可用') }}
          </NText>
        </NSpace>
      </NSpin>
    </NCard>
  </div>
</template>

<style scoped></style>
