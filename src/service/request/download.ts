import { useAuthStore } from '@/store/modules/auth';
import { getServiceBaseURL } from '@/utils/service';
import { localStg } from '@/utils/storage';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

let refreshTokenPromise: Promise<boolean> | null = null;
let isRefreshing = false;

/**
 * 处理 Token 刷新逻辑
 *
 * 防止并发刷新，确保同一时间只有一个刷新请求在进行。
 * 刷新成功后更新本地存储的 token 和 refreshToken。
 * 如果刷新失败，则重置用户登录状态。
 *
 * @returns {Promise<boolean>} 刷新是否成功
 */
async function handleRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshTokenPromise) {
    return refreshTokenPromise;
  }

  isRefreshing = true;
  const { resetStore } = useAuthStore();
  const rToken = localStg.get('refreshToken') || '';

  try {
    const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: rToken });
    const { token, refreshToken } = response.data.data;

    localStg.set('token', token);
    localStg.set('refreshToken', refreshToken);

    return true;
  } catch (error) {
    resetStore();
    return false;
  } finally {
    setTimeout(() => {
      refreshTokenPromise = null;
      isRefreshing = false;
    }, 1000);
  }
}

/**
 * 获取当前的 Authorization Token
 *
 * 从本地存储中读取 token，如果存在则格式化为 Bearer Token 格式。
 *
 * @returns {Promise<string | null>} 格式化后的 Token 字符串，如果不存在则返回 null
 */
async function getFreshToken(): Promise<string | null> {
  const token = localStg.get('token');
  return token ? `Bearer ${token}` : null;
}

/**
 * 处理 Token 刷新请求
 *
 * 如果当前没有正在进行的刷新请求，则发起一个新的刷新请求。
 * 否则返回现有的刷新 Promise，实现请求去重。
 *
 * @returns {Promise<boolean>} 刷新是否成功
 */
async function handleTokenRefresh(): Promise<boolean> {
  if (!refreshTokenPromise) {
    refreshTokenPromise = handleRefreshToken();
  }

  return refreshTokenPromise;
}

/**
 * 处理用户登出逻辑
 *
 * 调用 auth store 的 resetStore 方法清除用户状态和本地存储的认证信息。
 */
function handleLogout() {
  const authStore = useAuthStore();
  authStore.resetStore();
}

/**
 * 解析 Blob 类型的错误响应
 *
 * 将 Blob 数据读取为文本并尝试解析为 JSON，提取错误消息。
 * 如果解析失败或读取错误，则返回默认错误消息。
 *
 * @param {Blob} blob - 包含错误信息的 Blob 对象
 * @returns {Promise<string>} 解析后的错误消息字符串
 */
async function parseBlobError(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const errorData = JSON.parse(reader.result as string);
        resolve(errorData.msg || errorData.message || '下载失败');
      } catch {
        resolve('下载失败');
      }
    };
    reader.onerror = () => {
      resolve('下载失败');
    };
    reader.readAsText(blob);
  });
}

/**
 * 显示下载错误消息
 *
 * 使用 Naive UI 的全局 message 组件显示错误提示。
 *
 * @param {string} message - 要显示的错误消息
 */
function showDownloadErrorMsg(message: string) {
  window.$message?.error(message, {
    duration: 3000
  });
}

export interface DownloadRequestConfig extends Omit<AxiosRequestConfig, 'responseType'> {
  filename?: string;
  onDownloadProgress?: (progressEvent: any) => void;
}

/**
 * 执行下载请求
 *
 * 构建默认的 axios 配置，包括 baseURL、超时时间、响应类型等。
 * 自动添加 Authorization header。
 *
 * @param {DownloadRequestConfig} config - 下载请求配置
 * @returns {Promise<AxiosResponse>} Axios 响应对象
 */
async function executeDownload(config: DownloadRequestConfig): Promise<AxiosResponse> {
  const defaultConfig: AxiosRequestConfig = {
    baseURL,
    method: 'post',
    timeout: 60 * 1000,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    },
    ...config
  };

  const token = await getFreshToken();
  if (token) {
    defaultConfig.headers = {
      ...defaultConfig.headers,
      Authorization: token
    };
  }

  return axios(defaultConfig);
}

/**
 * 处理下载过程中的错误
 *
 * 根据错误类型和 HTTP 状态码进行不同的处理：
 * - 401: 尝试刷新 token，成功则抛出重试标记，失败则登出
 * - 403: 显示权限错误
 * - 500+: 显示服务器错误
 * - Blob 错误: 解析并显示后端返回的错误消息
 * - 网络错误: 显示网络连接相关提示
 *
 * @param {any} error - 错误对象
 * @returns {Promise<never>} 此函数总是抛出异常
 */
async function handleDownloadError(error: any): Promise<never> {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 401) {
      const success = await handleTokenRefresh();
      if (success) {
        throw new Error('RETRY_AFTER_REFRESH');
      } else {
        handleLogout();
        throw new Error('认证失败，请重新登录');
      }
    }

    if (status === 403) {
      const errorMsg = data?.msg || '没有权限访问';
      showDownloadErrorMsg(errorMsg);
      throw new Error(errorMsg);
    }

    if (status >= 500) {
      const errorMsg = data?.msg || '服务器错误';
      showDownloadErrorMsg(errorMsg);
      throw new Error(errorMsg);
    }

    if (data instanceof Blob) {
      const errorMsg = await parseBlobError(data);
      showDownloadErrorMsg(errorMsg);
      throw new Error(errorMsg);
    }

    const errorMsg = data?.msg || error.message || '下载失败';
    showDownloadErrorMsg(errorMsg);
    throw new Error(errorMsg);
  }

  if (error.code === 'ECONNABORTED') {
    const errorMsg = '下载超时，请稍后重试';
    showDownloadErrorMsg(errorMsg);
    throw new Error(errorMsg);
  }

  if (error.message === 'Network Error') {
    const errorMsg = '网络错误，请检查网络连接';
    showDownloadErrorMsg(errorMsg);
    throw new Error(errorMsg);
  }

  showDownloadErrorMsg(error.message || '下载失败');
  throw error;
}

/**
 * 处理下载响应
 *
 * 检查响应内容类型，如果是 JSON 则说明是错误响应，需要解析并抛出错误。
 * 否则从响应头中提取文件名，返回 Blob 数据和文件名。
 *
 * @param {AxiosResponse} response - Axios 响应对象
 * @param {DownloadRequestConfig} config - 下载请求配置
 * @returns {Promise<{ blob: Blob; filename: string }>} 包含 Blob 数据和文件名的对象
 */
async function processResponse(response: AxiosResponse, config: DownloadRequestConfig): Promise<{ blob: Blob; filename: string }> {
  const contentType = response.headers['content-type'] as string;

  if (contentType?.includes('application/json')) {
    const errorMsg = await parseBlobError(response.data);
    showDownloadErrorMsg(errorMsg);
    throw new Error(errorMsg);
  }

  const filename = extractFilenameFromHeaders(response.headers, config.filename || 'download');

  return {
    blob: response.data as Blob,
    filename
  };
}

/**
 * 带重试机制的下载请求
 *
 * 执行下载请求，如果收到 'RETRY_AFTER_REFRESH' 错误（表示 token 已刷新），
 * 则自动重试一次请求。
 *
 * @param {DownloadRequestConfig} config - 下载请求配置
 * @returns {Promise<AxiosResponse>} Axios 响应对象
 */
async function downloadWithRetry(config: DownloadRequestConfig): Promise<AxiosResponse> {
  try {
    return await executeDownload(config);
  } catch (error: any) {
    if (error.message === 'RETRY_AFTER_REFRESH') {
      return executeDownload(config);
    }
    throw error;
  }
}

/**
 * 执行文件下载请求
 *
 * 发送下载请求并处理响应，只返回 Blob 数据。
 * 支持自动 token 刷新和重试机制。
 *
 * @param {DownloadRequestConfig} config - 下载请求配置
 * @returns {Promise<Blob>} 下载的 Blob 数据
 */
export async function downloadRequest(config: DownloadRequestConfig): Promise<Blob> {
  try {
    const response = await downloadWithRetry(config);
    const result = await processResponse(response, config);
    return result.blob;
  } catch (error: any) {
    return handleDownloadError(error);
  }
}

/**
 * 保存文件到本地
 *
 * 创建临时 URL，通过创建隐藏的 <a> 标签触发浏览器下载行为。
 * 下载完成后清理临时 URL 和 DOM 元素。
 *
 * @param {Blob} blob - 要保存的 Blob 数据
 * @param {string} filename - 保存的文件名
 */
export function saveFileAs(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 从响应头中提取文件名
 *
 * 优先解析 RFC 5987 编码的文件名（filename*），支持 UTF-8 编码的国际字符。
 * 如果不存在，则尝试解析标准的 filename 字段。
 * 如果都不存在，则返回默认文件名。
 *
 * @param {any} headers - 响应头对象
 * @param {string} [defaultFilename='download'] - 默认文件名
 * @returns {string} 提取的文件名或默认文件名
 */
export function extractFilenameFromHeaders(headers: any, defaultFilename = 'download'): string {
  const contentDisposition = headers['content-disposition'];
  if (contentDisposition) {
    const filenameStarRegex = /filename\*\s*=\s*UTF-8''([^;\n]*)/i;
    const starMatches = filenameStarRegex.exec(contentDisposition);
    if (starMatches && starMatches[1]) {
      return decodeURIComponent(starMatches[1]);
    }

    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      return decodeURIComponent(matches[1].replace(/['"]/g, ''));
    }
  }
  return defaultFilename;
}

/**
 * 执行文件下载请求并返回文件名
 *
 * 发送下载请求并处理响应，返回包含 Blob 数据和文件名的对象。
 * 支持自动 token 刷新和重试机制。
 *
 * @param {DownloadRequestConfig} config - 下载请求配置
 * @returns {Promise<{ blob: Blob; filename: string }>} 包含 Blob 数据和文件名的对象
 */
export async function downloadRequestWithFilename(config: DownloadRequestConfig): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await downloadWithRetry(config);
    return processResponse(response, config);
  } catch (error: any) {
    return handleDownloadError(error);
  }
}

