import { findCustomerAccount, getCustomerAccountByEmail } from '@/lib/customer-accounts';

export const accounts = {
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@arkumbrella.com',
    password: process.env.ADMIN_PASSWORD ?? 'Umbrella2026!',
    role: 'admin',
    label: '内部管理账号'
  },
  customer: {
    email: process.env.PORTAL_EMAIL ?? 'customer@example.com',
    password: process.env.PORTAL_PASSWORD ?? 'Portal2026!',
    role: 'customer',
    label: '客户门户账号',
    customerId: process.env.PORTAL_CUSTOMER_ID ?? 'abc-malaysia'
  }
} as const;

export function normalizeNextPath(value: FormDataEntryValue | string | null | undefined) {
  const nextPath = typeof value === 'string' && value.startsWith('/') ? value : '/';
  return nextPath.startsWith('/login') ? '/' : nextPath;
}

export function findAccount(email: string, password: string) {
  const staticAccount = Object.values(accounts).find((account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password);

  if (staticAccount) {
    return staticAccount;
  }

  const customerAccount = findCustomerAccount(email, password);
  return customerAccount ? { ...customerAccount, role: 'customer' as const } : undefined;
}

export function getCustomerIdForIdentity(identity?: string | null) {
  if (!identity) {
    return undefined;
  }

  const normalizedIdentity = (() => {
    try {
      return decodeURIComponent(identity.trim());
    } catch {
      return identity.trim();
    }
  })();
  const account = Object.values(accounts).find((item) => item.email.toLowerCase() === normalizedIdentity.toLowerCase());
  if (account && 'customerId' in account) {
    return account.customerId;
  }

  return getCustomerAccountByEmail(normalizedIdentity)?.customerId;
}
