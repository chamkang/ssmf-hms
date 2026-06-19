import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

/**
 * Read the current user's permission set (shared from the server by
 * HandleInertiaRequests) and expose `can()` for gating UI.
 *
 * The server is the source of truth — every route is also protected by
 * Spatie `permission:` middleware. This only hides UI the user can't use.
 */
export function usePermissions() {
    const permissions = (usePage().props as unknown as PageProps).auth.permissions ?? [];

    const can = (permission: string | string[]): boolean => {
        const needed = Array.isArray(permission) ? permission : [permission];
        return needed.some((p) => permissions.includes(p));
    };

    return { permissions, can };
}
