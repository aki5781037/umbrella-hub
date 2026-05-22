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
    label: '客户门户账号'
  }
} as const;

export function normalizeNextPath(value: FormDataEntryValue | string | null | undefined) {
  const nextPath = typeof value === 'string' && value.startsWith('/') ? value : '/';
  return nextPath.startsWith('/login') ? '/' : nextPath;
}

export function findAccount(email: string, password: string) {
  return Object.values(accounts).find((account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password);
}
