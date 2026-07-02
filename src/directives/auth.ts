import type { App, DirectiveBinding } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

/**
 * v-auth directive — conditionally render elements based on user permissions.
 *
 * Usage:
 *   <NButton v-auth="['admin', 'edit']">Edit</NButton>
 *   <div v-auth="['admin']">Admin only content</div>
 *
 * The element is removed from the DOM if the user lacks all specified permissions.
 */
export function setupAuthDirective(app: App) {
  app.directive('auth', {
    mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
      const authStore = useAuthStore();
      const requiredPermissions = binding.value;

      if (!requiredPermissions || !Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return;
      }

      const hasPermission = requiredPermissions.some(perm =>
        authStore.userInfo.permissions.includes(perm)
      );

      if (!hasPermission) {
        el.parentNode?.removeChild(el);
      }
    }
  });
}
