import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export type CustomerPortalAccount = {
  email: string;
  password: string;
  customerId: string;
  label: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerAccountRecords = {
  accounts: CustomerPortalAccount[];
};

const recordsPath = join(process.cwd(), 'data', 'customer-accounts.json');

function ensureRecordsDir() {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readRecords(): CustomerAccountRecords {
  ensureRecordsDir();

  if (!existsSync(recordsPath)) {
    return { accounts: [] };
  }

  try {
    const stored = JSON.parse(readFileSync(recordsPath, 'utf8')) as Partial<CustomerAccountRecords>;
    return {
      accounts: Array.isArray(stored.accounts) ? stored.accounts : []
    };
  } catch {
    return { accounts: [] };
  }
}

function writeRecords(records: CustomerAccountRecords) {
  ensureRecordsDir();
  writeFileSync(recordsPath, JSON.stringify(records, null, 2), 'utf8');
}

export function getCustomerAccounts() {
  return readRecords().accounts.sort((first, second) => first.email.localeCompare(second.email));
}

export function findCustomerAccount(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  return getCustomerAccounts().find((account) => normalizeEmail(account.email) === normalizedEmail && account.password === password);
}

export function getCustomerAccountByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getCustomerAccounts().find((account) => normalizeEmail(account.email) === normalizedEmail);
}

export function saveCustomerAccount(input: {
  email: string;
  password: string;
  customerId: string;
  label?: string;
}) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const customerId = input.customerId.trim();

  if (!email || !password || !customerId) {
    return undefined;
  }

  const records = readRecords();
  const now = new Date().toISOString();
  const existing = records.accounts.find((account) => normalizeEmail(account.email) === email);
  const nextAccount: CustomerPortalAccount = {
    email,
    password,
    customerId,
    label: input.label?.trim() || email,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  records.accounts = existing
    ? records.accounts.map((account) => normalizeEmail(account.email) === email ? nextAccount : account)
    : [...records.accounts, nextAccount];

  writeRecords(records);
  return nextAccount;
}
