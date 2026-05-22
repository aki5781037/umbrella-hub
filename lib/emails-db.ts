import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { getCustomers, getProjects, mails as seedMails } from './data';

// 定义邮件数据类型
export type MailItem = {
  id: string;
  time: string;
  from: string;
  fromEmail: string;
  subject: string;
  status: '未读' | '待回复' | '已关联' | '已回复';
  customer?: string;
  customerId?: string;
  projectId?: string;
  summary: string;
  body: string;
  suggestedAction?: string;
  attachments?: string[];
};

// 存储路径定义
const dataDir = join(process.cwd(), 'data');
const emailsPath = join(dataDir, 'emails.json');
const configPath = join(dataDir, 'mail-config.json');

// 初始化目录
function ensureDataDir() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// ----------------------------------------------------
// 1. IMAP 邮箱连接凭证管理
// ----------------------------------------------------

export type MailConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  secure: boolean;
};

/**
 * 获取邮箱配置信息（脱敏）
 */
export function getMailConfig(): MailConfig | null {
  ensureDataDir();
  if (!existsSync(configPath)) {
    return null;
  }
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as MailConfig;
    return config;
  } catch {
    return null;
  }
}

/**
 * 获取邮箱明文配置（包含密码，内部使用）
 */
export function getMailConfigPlain(): MailConfig | null {
  ensureDataDir();
  if (!existsSync(configPath)) {
    return null;
  }
  try {
    const content = readFileSync(configPath, 'utf8');
    return JSON.parse(content) as MailConfig;
  } catch {
    return null;
  }
}

/**
 * 保存邮箱配置
 */
export function saveMailConfig(config: MailConfig) {
  ensureDataDir();
  // 如果密码是遮蔽状态且已经有旧配置，保留旧配置的密码
  if (config.password === '******') {
    const oldConfig = getMailConfigPlain();
    if (oldConfig) {
      config.password = oldConfig.password;
    }
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

// ----------------------------------------------------
// 2. 邮件本地 JSON 数据库管理
// ----------------------------------------------------

/**
 * 读取本地邮件列表，若为空则以 data.ts 中的 mails 作为种子数据填充
 */
export function readMails(): MailItem[] {
  ensureDataDir();
  if (!existsSync(emailsPath)) {
    // 写入种子数据并返回
    const initialMails = seedMails as MailItem[];
    writeFileSync(emailsPath, JSON.stringify(initialMails, null, 2), 'utf8');
    return initialMails;
  }
  try {
    return JSON.parse(readFileSync(emailsPath, 'utf8')) as MailItem[];
  } catch {
    return seedMails as MailItem[];
  }
}

/**
 * 写入本地邮件列表
 */
export function writeMails(mails: MailItem[]) {
  ensureDataDir();
  writeFileSync(emailsPath, JSON.stringify(mails, null, 2), 'utf8');
}

/**
 * 追加单封邮件到顶部
 */
export function addMail(mail: MailItem) {
  const currentMails = readMails();
  // 防重校验：通过 id 或者 from+subject 联合判断
  const exists = currentMails.some(
    (m) => m.id === mail.id || (m.fromEmail === mail.fromEmail && m.subject === mail.subject && m.time === mail.time)
  );
  if (!exists) {
    currentMails.unshift(mail);
    writeMails(currentMails);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// 3. 智能关联与匹配算法 (Smart Association Engine)
// ----------------------------------------------------

/**
 * 智能匹配发件人到客户与项目
 * @param mail 待关联的解析后邮件数据
 */
export function associateMail(mail: Partial<MailItem>): MailItem {
  const matchedMail = { ...mail } as MailItem;
  const fromEmailLower = (matchedMail.fromEmail || '').toLowerCase();
  
  if (!fromEmailLower) {
    return matchedMail;
  }

  const customers = getCustomers();
  const projects = getProjects();
  let matchedCust: (typeof customers)[number] | undefined = undefined;

  // 算法1：直接通过发件人邮箱匹配客户联系人列表中的 primary 或其他联系人邮箱
  matchedCust = customers.find((c) =>
    c.contacts.some((contact) => contact.email.toLowerCase() === fromEmailLower)
  );

  // 算法2：若精确邮箱没有匹配上，则尝试通过邮箱域名做模糊匹配
  if (!matchedCust) {
    const fromDomain = fromEmailLower.split('@')[1];
    if (fromDomain && !['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'qq.com', '163.com', '126.com'].includes(fromDomain)) {
      matchedCust = customers.find((c) =>
        c.contacts.some((contact) => {
          const contactDomain = contact.email.toLowerCase().split('@')[1];
          return contactDomain === fromDomain;
        })
      );
    }
  }

  // 如果成功关联到客户公司
  if (matchedCust) {
    matchedMail.customerId = matchedCust.id;
    matchedMail.customer = matchedCust.name;
    matchedMail.status = '待回复'; // 新关联客户来信默认为待回复

    // 算法3：进一步匹配该客户旗下的所有项目，依据项目 ID (PRJ-xxx) 或项目关键词
    const custProjects = projects.filter((p) => p.customerId === matchedCust!.id);
    
    // 3.1 尝试直接从主题或正文提取项目 ID (支持全匹配或模糊包含)
    let matchedProj = custProjects.find((p) => {
      const pIdLower = p.id.toLowerCase();
      return (
        matchedMail.subject.toLowerCase().includes(pIdLower) ||
        matchedMail.body.toLowerCase().includes(pIdLower)
      );
    });

    // 3.2 尝试从项目名称中提取关键字进行匹配
    if (!matchedProj) {
      matchedProj = custProjects.find((p) => {
        // 过滤掉外贸常用后缀词，剩下核心产品词，如“折叠伞开发” -> “折叠伞”
        const coreKeyword = p.name.replace(/(开发|项目|大货|补单|订单|定制|样品|款|系列)/g, '').trim();
        if (coreKeyword.length >= 2) {
          return (
            matchedMail.subject.includes(coreKeyword) ||
            matchedMail.body.includes(coreKeyword)
          );
        }
        return false;
      });
    }

    if (matchedProj) {
      matchedMail.projectId = matchedProj.id;
      matchedMail.status = '已关联';
    }
  }

  return matchedMail;
}
