import { fetchRefreshToken } from '@/service/api/auth';
import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { encryptToken } from '@sa/utils';
import type { RequestInstanceState } from './type';

const ACTIVITY_INTERVAL = 10 * 60 * 1000;

type ActivityListener = (isActivity: boolean) => void;

let listeners: ActivityListener[] = [];

export function initActivityMonitor(state: RequestInstanceState) {
  state.lastActiveTime = Date.now();
  state.activityTimer = null;

  startActivityMonitor(state);
}

function startActivityMonitor(state: RequestInstanceState) {
  if (state.activityTimer) {
    clearTimeout(state.activityTimer);
  }

  state.activityTimer = setTimeout(() => {
    const timeSinceLastActive = Date.now() - state.lastActiveTime;

    if (timeSinceLastActive >= ACTIVITY_INTERVAL) {
      console.log('[Activity Monitor] User inactive, notifying listeners');
      notifyListeners(false);
      state.activityTimer = null;
      return;
    }

    startActivityMonitor(state);
  }, ACTIVITY_INTERVAL);
}

export function updateActivityTime(state: RequestInstanceState, isUserActivity = true) {
  if (!isUserActivity) {
    return;
  }

  const wasInactive = !state.activityTimer;
  state.lastActiveTime = Date.now();

  if (wasInactive) {
    notifyListeners(true);
  }

  startActivityMonitor(state);
}

export function onActivityChange(listener: ActivityListener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notifyListeners(isActivity: boolean) {
  listeners.forEach(listener => {
    try {
      listener(isActivity);
    } catch (error) {
      console.error('[Activity Monitor] Listener error:', error);
    }
  });
}

export function getAuthorization() {
  const authStore = useAuthStore();
  const token = authStore.token;
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/** refresh token */
async function handleRefreshToken() {
  const { resetStore } = useAuthStore();

  const rToken = localStg.get('refreshToken') || '';
  const { error, data } = await fetchRefreshToken(rToken);
  if (!error) {
    const encryptedToken = await encryptToken(data.token);
    localStg.set('token', encryptedToken);
    return true;
  }

  resetStore();

  return false;
}

export async function handleExpiredRequest(state: RequestInstanceState) {
  if (!state.refreshTokenPromise) {
    state.refreshTokenPromise = handleRefreshToken();
  }

  const success = await state.refreshTokenPromise;

  setTimeout(() => {
    state.refreshTokenPromise = null;
  }, 1000);

  return success;
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}

export function handleDownloadError(state: RequestInstanceState, error: any) {
  let message = '下载失败';

  if (error.response?.data) {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string);
          message = errorData.msg || errorData.message || message;
          showErrorMsg(state, message);
        } catch {
          showErrorMsg(state, message);
        }
      };
      reader.onerror = () => {
        showErrorMsg(state, message);
      };
      reader.readAsText(error.response.data);
      return;
    } catch {
      // ignore parse error
    }
  }

  if (error.message) {
    message = error.message;
  }

  showErrorMsg(state, message);
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getFilenameFromHeaders(headers: any, defaultFilename = 'download'): string {
  const contentDisposition = headers['content-disposition'];
  if (contentDisposition) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      return decodeURIComponent(matches[1].replace(/['"]/g, ''));
    }
  }
  return defaultFilename;
}

