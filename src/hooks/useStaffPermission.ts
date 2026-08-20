import { useApp } from '../store/AppContext';
import { STAFF_PERMISSIONS, StaffPermission } from '../types';

export function useStaffPermission(permission: StaffPermission): boolean {
  const { user } = useApp();
  if (user?.role !== 'admin') return false;
  if (user.customPermissions && Array.isArray(user.customPermissions)) {
    return user.customPermissions.includes(permission);
  }
  const staffRole = user.staffRole || 'super_admin'; // fallback: admins pre-existentes = super_admin
  return STAFF_PERMISSIONS[staffRole]?.includes(permission) ?? false;
}

export function useStaffPermissions(): Record<StaffPermission, boolean> {
  const { user } = useApp();
  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    return {
      canAssignRoles: false,
      canManagePlans: false,
      canManagePaymentAccounts: false,
      canApproveKyc: false,
      canManageUsers: false,
      canViewTransactions: false,
      canManageSupport: false,
    };
  }

  const staffRole = user?.staffRole || 'super_admin';
  const permissions = (user?.customPermissions && Array.isArray(user.customPermissions))
    ? user.customPermissions
    : (STAFF_PERMISSIONS[staffRole] || []);

  return {
    canAssignRoles: permissions.includes('canAssignRoles'),
    canManagePlans: permissions.includes('canManagePlans'),
    canManagePaymentAccounts: permissions.includes('canManagePaymentAccounts'),
    canApproveKyc: permissions.includes('canApproveKyc'),
    canManageUsers: permissions.includes('canManageUsers'),
    canViewTransactions: permissions.includes('canViewTransactions'),
    canManageSupport: permissions.includes('canManageSupport'),
  };
}
