import { downloadRequestWithFilename, saveFileAs } from '@/service/request/download';
import type { AxiosProgressEvent } from 'axios';

/**
 * 文件下载配置接口
 *
 * @property {string} [filename] - 自定义文件名，如果未提供则使用后端返回或默认名称
 * @property {(progressEvent: AxiosProgressEvent) => void} [onProgress] - 下载进度回调函数
 * @property {(blob: Blob, filename: string) => void} [onSuccess] - 下载成功回调函数
 * @property {(error: unknown) => void} [onError] - 下载失败回调函数
 */
export interface DownloadConfig {
  filename?: string;
  onProgress?: (progressEvent: AxiosProgressEvent) => void;
  onSuccess?: (blob: Blob, filename: string) => void;
  onError?: (error: unknown) => void;
}

/**
 * 文件下载工具类
 *
 * 提供统一的文件下载功能，支持进度监控、错误处理和自动保存。
 * 所有方法均为静态方法，可直接调用。
 */
export class FileDownloader {
  /**
   * 下载文件并返回 Blob 数据
   *
   * @param {string} url - 下载接口 URL
   * @param {Record<string, any>} [params] - URL 查询参数
   * @param {Record<string, any>} [data] - 请求体数据
   * @param {DownloadConfig} [config] - 下载配置选项
   * @returns {Promise<Blob>} 下载的 Blob 数据
   */
  static async download(
    url: string,
    params?: Record<string, any>,
    data?: Record<string, any>,
    config?: DownloadConfig
  ): Promise<Blob> {
    const result = await this.downloadWithFilename(url, params, data, config);
    return result.blob;
  }

  /**
   * 下载文件并返回包含 Blob 和文件名的对象
   *
   * 执行下载请求，验证响应数据，并在成功时调用 onSuccess 回调。
   * 如果发生错误，先调用 onError 回调，然后重新抛出错误。
   *
   * @param {string} url - 下载接口 URL
   * @param {Record<string, any>} [params] - URL 查询参数
   * @param {Record<string, any>} [data] - 请求体数据
   * @param {DownloadConfig} [config] - 下载配置选项
   * @returns {Promise<{ blob: Blob; filename: string }>} 包含 Blob 数据和文件名的对象
   * @throws {Error} 当下载失败或文件为空时抛出错误
   */
  static async downloadWithFilename(
    url: string,
    params?: Record<string, any>,
    data?: Record<string, any>,
    config?: DownloadConfig
  ): Promise<{ blob: Blob; filename: string }> {
    try {
      const result = await downloadRequestWithFilename({
        url,
        method: 'post',
        params,
        data,
        filename: config?.filename,
        onDownloadProgress: config?.onProgress
      });

      if (!result.blob || result.blob.size === 0) {
        throw new Error('下载的文件为空');
      }

      if (config?.onSuccess) {
        config.onSuccess(result.blob, result.filename);
      }

      return result;
    } catch (error) {
      if (config?.onError) {
        config.onError(error);
      }
      throw error;
    }
  }

  /**
   * 保存 Blob 数据为文件
   *
   * 触发浏览器下载行为，将 Blob 数据保存为指定文件名的文件。
   *
   * @param {Blob} blob - 要保存的 Blob 数据
   * @param {string} filename - 保存的文件名
   */
  static saveAs(blob: Blob, filename: string): void {
    saveFileAs(blob, filename);
  }

  /**
   * 下载文件并自动保存到本地
   *
   * 组合了下载和保存两个步骤，适用于直接触发浏览器下载的场景。
   *
   * @param {string} url - 下载接口 URL
   * @param {Record<string, any>} [params] - URL 查询参数
   * @param {Record<string, any>} [data] - 请求体数据
   * @param {DownloadConfig} [config] - 下载配置选项
   * @returns {Promise<void>}
   */
  static async downloadAndSave(
    url: string,
    params?: Record<string, any>,
    data?: Record<string, any>,
    config?: DownloadConfig
  ): Promise<void> {
    const result = await this.downloadWithFilename(url, params, data, config);
    this.saveAs(result.blob, result.filename);
  }

  /**
   * 计算下载进度百分比
   *
   * @param {AxiosProgressEvent} progressEvent - Axios 进度事件对象
   * @returns {number} 进度百分比（0-100）
   */
  static getProgressPercent(progressEvent: AxiosProgressEvent): number {
    if (!progressEvent.total) return 0;
    return Math.round((progressEvent.loaded * 100) / progressEvent.total);
  }
}

