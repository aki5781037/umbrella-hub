import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const mails = [
  {
    id: 'abc-quotation-confirm',
    time: '09:18',
    from: 'ABC Import',
    fromEmail: 'daniel@abc-import.example',
    subject: '折叠伞报价单确认',
    status: '待回复',
    customer: 'ABC Malaysia',
    customerId: 'abc-malaysia',
    projectId: 'foldable-umbrella-malaysia',
    summary: '客户确认已收到新版折叠伞报价单，并希望进一步确认 MOQ、目标价和包装资料。',
    body: 'Hi Linda, we have received your updated quotation for the foldable umbrella project. Please help confirm whether MOQ can be reduced for the first trial order, and share the latest packing details for our internal review.',
    suggestedAction: '回复客户 MOQ 可行区间，并同步包装资料。',
    attachments: ['Foldable-Umbrella-Quotation.pdf', 'Packing-Reference.zip']
  },
  {
    id: 'korea-sample-color-feedback',
    time: '10:42',
    from: 'Korea Brand',
    fromEmail: 'minji@koreabrand.example',
    subject: '联名款样品颜色反馈',
    status: '未读',
    customer: 'Korea Brand',
    customerId: 'korea-brand',
    projectId: 'korea-cobrand-sample',
    summary: '客户反馈样品蓝色偏浅，希望调整 LOGO 位置并重新确认设计稿。',
    body: 'Hi Cathy, the blue color on the current sample looks lighter than our brand guideline. Could you adjust it darker and also move the logo slightly lower on the panel?',
    suggestedAction: '转给设计同事调整颜色和 LOGO 位置，并在项目任务中跟进。',
    attachments: ['Color-Feedback.jpg', 'Co-brand-Sample-Design.pdf']
  },
  {
    id: 'sunny-repeat-order',
    time: '11:05',
    from: 'Sunny Retail',
    fromEmail: 'omar@sunnyretail.example',
    subject: 'Golf umbrella repeat order',
    status: '已关联',
    customer: 'Sunny Retail',
    customerId: 'sunny-retail',
    projectId: 'golf-umbrella-repeat-order',
    summary: '客户准备高尔夫伞补单，询问是否沿用上一批 LOGO、手柄和物流方案。',
    body: 'Hi Tom, we would like to repeat the previous golf umbrella order. Can we use the same logo, handle and carton packing? Please also confirm the lead time and shipping option.',
    suggestedAction: '确认补单数量、库存材料和物流交期。',
    attachments: ['Repeat-Order-PI.pdf', 'Shipping-Plan.pdf']
  }
];

export const customers = [
  {
    id: 'abc-malaysia',
    name: 'ABC Malaysia',
    legalName: 'ABC Import Sdn Bhd',
    country: 'Malaysia',
    type: '批发商',
    level: 'A',
    source: '官网询盘',
    owner: 'Linda',
    status: '正在开发',
    lastContact: '2026-05-20',
    next: '2026-05-23',
    preference: '偏好轻量折叠伞，关注 MOQ 与交期。',
    contacts: [
      { name: 'Daniel Lim', title: '采购经理', email: 'daniel@abc-import.example', phone: '+60 12 000 1001', primary: true },
      { name: 'Amy Tan', title: '运营助理', email: 'amy@abc-import.example', phone: '+60 12 000 1002', primary: false }
    ],
    activities: ['09:18 收到折叠伞报价单确认邮件', '2026-05-19 已发送新版报价单', '2026-05-18 电话确认目标零售价']
  },
  {
    id: 'korea-brand',
    name: 'Korea Brand',
    legalName: 'Korea Brand Co., Ltd.',
    country: 'Korea',
    type: '品牌商',
    level: 'A',
    source: '展会',
    owner: 'Cathy',
    status: '样品沟通',
    lastContact: '2026-05-20',
    next: '2026-05-25',
    preference: '重视联名设计和样品颜色一致性。',
    contacts: [
      { name: 'Minji Kim', title: '品牌经理', email: 'minji@koreabrand.example', phone: '+82 10 0000 2001', primary: true }
    ],
    activities: ['10:42 收到样品颜色反馈', '2026-05-18 上传第二版设计稿', '2026-05-15 寄出样品']
  },
  {
    id: 'sunny-retail',
    name: 'Sunny Retail',
    legalName: 'Sunny Retail LLC',
    country: 'UAE',
    type: '零售商',
    level: 'B',
    source: '邮件开发',
    owner: 'Tom',
    status: '返单跟进',
    lastContact: '2026-05-20',
    next: '2026-05-22',
    preference: '关注高尔夫伞库存补货和物流安排。',
    contacts: [
      { name: 'Omar Ali', title: '采购负责人', email: 'omar@sunnyretail.example', phone: '+971 50 000 3001', primary: true }
    ],
    activities: ['11:05 收到大货补单邮件', '2026-05-19 确认上一批出货数量', '2026-05-17 同步海运方案']
  }
];

export const projects = [
  {
    id: 'foldable-umbrella-malaysia',
    customerId: 'abc-malaysia',
    name: '马来西亚折叠伞开发',
    customer: 'ABC Malaysia',
    type: '新客户开发',
    stage: '报价已发送',
    owner: 'Linda',
    collaborators: ['Cathy'],
    amount: 'USD 18,000',
    risk: '黄灯',
    priority: '高',
    start: '2026-05-12',
    due: '2026-05-28',
    nextAction: '等待客户确认 MOQ / 资料',
    nextFollow: '2026-05-23',
    portalVisible: true,
    timeline: ['2026-05-20 客户确认收到报价单', '2026-05-19 已发送新版报价单', '2026-05-16 完成产品参数确认'],
    tasks: [
      { title: '确认 MOQ 和目标价', status: '进行中', owner: 'Linda', due: '2026-05-23' },
      { title: '准备英文版规格表', status: '已完成', owner: 'Cathy', due: '2026-05-19' }
    ],
    files: ['Foldable-Umbrella-Quotation.pdf', 'Product-Specification.xlsx', 'Fabric-Color-Options.pdf', 'Packing-Reference.zip'],
    confirmations: [
      { title: '确认 MOQ', status: '待客户确认', due: '2026-05-23', response: '客户希望首单降低 MOQ，等待业务给出可行区间。' },
      { title: '确认伞布颜色', status: '已确认', due: '2026-05-21', response: '客户已确认优先使用藏青色，备选黑色。' }
    ],
    messages: ['客户：Please confirm if MOQ can be reduced.', 'Linda：We are checking with production team.', '客户：We prefer navy color if stock is available.']
  },
  {
    id: 'korea-cobrand-sample',
    customerId: 'korea-brand',
    name: '韩国联名款样品项目',
    customer: 'Korea Brand',
    type: 'OEM 定制',
    stage: '样品 / 方案沟通',
    owner: 'Cathy',
    collaborators: ['Linda'],
    amount: 'USD 12,500',
    risk: '绿灯',
    priority: '中',
    start: '2026-05-10',
    due: '2026-06-03',
    nextAction: '根据客户反馈调整样品颜色',
    nextFollow: '2026-05-25',
    portalVisible: true,
    timeline: ['2026-05-20 收到颜色反馈', '2026-05-18 上传第二版设计稿', '2026-05-15 样品寄出'],
    tasks: [
      { title: '调整 LOGO 位置', status: '待开始', owner: 'Cathy', due: '2026-05-24' },
      { title: '确认样品颜色差异', status: '进行中', owner: 'Cathy', due: '2026-05-25' }
    ],
    files: ['Co-brand-Sample-Design.pdf', 'Color-Feedback.jpg'],
    confirmations: [
      { title: '确认 LOGO 位置', status: '有疑问', due: '2026-05-24', response: '客户希望 LOGO 再下移 1.5cm，并查看新版效果图。' },
      { title: '确认样品颜色', status: '待客户确认', due: '2026-05-25', response: '已收到颜色反馈，等待客户确认新版色号。' }
    ],
    messages: ['客户：The blue color needs to be darker.', 'Cathy：We will prepare updated artwork.', '客户：Please move the logo slightly lower.']
  },
  {
    id: 'golf-umbrella-repeat-order',
    customerId: 'sunny-retail',
    name: '高尔夫伞大货补单',
    customer: 'Sunny Retail',
    type: '返单',
    stage: '需求确认',
    owner: 'Tom',
    collaborators: ['Linda'],
    amount: 'USD 24,000',
    risk: '红灯',
    priority: '高',
    start: '2026-05-16',
    due: '2026-05-24',
    nextAction: '确认补单数量和物流方式',
    nextFollow: '2026-05-22',
    portalVisible: true,
    timeline: ['2026-05-20 收到补单邮件', '2026-05-19 复核上一批出货数据', '2026-05-17 提供海运方案'],
    tasks: [
      { title: '确认补单数量', status: '进行中', owner: 'Tom', due: '2026-05-22' },
      { title: '同步物流交期', status: '逾期', owner: 'Tom', due: '2026-05-20' }
    ],
    files: ['Repeat-Order-PI.pdf', 'Shipping-Plan.pdf'],
    confirmations: [
      { title: '确认补单数量', status: '待客户确认', due: '2026-05-22', response: '客户正在内部确认最终补单数量。' },
      { title: '确认物流方式', status: '有疑问', due: '2026-05-22', response: '客户希望比较海运和空运的交期与费用。' }
    ],
    messages: ['客户：Can we repeat the same logo and handle?', 'Tom：Yes, we will confirm stock and lead time.', '客户：Please compare sea and air shipping options.']
  }
];

const today = '2026-05-20';

export const allTasks = projects.flatMap((project) =>
  project.tasks.map((task, index) => ({
    id: `${project.id}-${index}`,
    projectId: project.id,
    projectName: project.name,
    customer: project.customer,
    projectStage: project.stage,
    priority: project.priority,
    risk: project.risk,
    title: task.title,
    status: task.status,
    owner: task.owner,
    due: task.due
  }))
);

export const taskSummary = {
  total: allTasks.length,
  active: allTasks.filter((task) => task.status !== '已完成').length,
  overdue: allTasks.filter((task) => task.status === '逾期' || (task.status !== '已完成' && task.due < today)).length,
  today: allTasks.filter((task) => task.status !== '已完成' && task.due <= today).length
};

export const metrics = [
  { label: '今日待跟进', value: String(taskSummary.today), tone: 'text-blue-700', bg: 'bg-blue-50' },
  { label: '未读邮件', value: String(mails.filter((mail) => mail.status === '未读').length), tone: 'text-amber-700', bg: 'bg-amber-50' },
  { label: '进行中项目', value: String(projects.length), tone: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: '逾期事项', value: String(taskSummary.overdue), tone: 'text-rose-700', bg: 'bg-rose-50' }
];

export const portalProjects = projects.filter((project) => project.portalVisible);

type Customer = (typeof customers)[number];
type Project = (typeof projects)[number];

type CrmRecords = {
  customers: Customer[];
  projects: Project[];
};

const crmRecordsPath = join(process.cwd(), 'data', 'crm-records.json');

function ensureCrmRecordsDir() {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
}

function readCrmRecords(): CrmRecords {
  ensureCrmRecordsDir();

  if (!existsSync(crmRecordsPath)) {
    return { customers: [], projects: [] };
  }

  try {
    return JSON.parse(readFileSync(crmRecordsPath, 'utf8')) as CrmRecords;
  } catch {
    return { customers: [], projects: [] };
  }
}

function writeCrmRecords(records: CrmRecords) {
  ensureCrmRecordsDir();
  writeFileSync(crmRecordsPath, JSON.stringify(records, null, 2), 'utf8');
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `item-${Date.now()}`;
}

export function getCustomers() {
  return [...customers, ...readCrmRecords().customers];
}

export function getProjects() {
  return [...projects, ...readCrmRecords().projects];
}

export function getAllTasks() {
  return getProjects().flatMap((project) =>
    project.tasks.map((task, index) => ({
      id: `${project.id}-${index}`,
      projectId: project.id,
      projectName: project.name,
      customer: project.customer,
      projectStage: project.stage,
      priority: project.priority,
      risk: project.risk,
      title: task.title,
      status: task.status,
      owner: task.owner,
      due: task.due
    }))
  );
}

export function getTaskSummary() {
  const tasks = getAllTasks();

  return {
    total: tasks.length,
    active: tasks.filter((task) => task.status !== '已完成').length,
    overdue: tasks.filter((task) => task.status === '逾期' || (task.status !== '已完成' && task.due < today)).length,
    today: tasks.filter((task) => task.status !== '已完成' && task.due <= today).length
  };
}

export function getMetrics() {
  return [
    { label: '今日待跟进', value: String(getTaskSummary().today), tone: 'text-blue-700', bg: 'bg-blue-50' },
    { label: '未读邮件', value: String(mails.filter((mail) => mail.status === '未读').length), tone: 'text-amber-700', bg: 'bg-amber-50' },
    { label: '进行中项目', value: String(getProjects().length), tone: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: '逾期事项', value: String(getTaskSummary().overdue), tone: 'text-rose-700', bg: 'bg-rose-50' }
  ];
}

export function addCustomer(input: {
  name: string;
  legalName?: string;
  country: string;
  type?: string;
  level?: string;
  source?: string;
  owner: string;
  status?: string;
  next?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  preference?: string;
}) {
  const records = readCrmRecords();
  const idBase = slugify(input.name);
  const existingIds = new Set(getCustomers().map((customer) => customer.id));
  let id = idBase;
  let index = 2;

  while (existingIds.has(id)) {
    id = `${idBase}-${index}`;
    index++;
  }

  const customer: Customer = {
    id,
    name: input.name,
    legalName: input.legalName || input.name,
    country: input.country,
    type: input.type || '潜在客户',
    level: input.level || 'B',
    source: input.source || '手动新增',
    owner: input.owner,
    status: input.status || '新线索',
    lastContact: new Date().toISOString().slice(0, 10),
    next: input.next || new Date().toISOString().slice(0, 10),
    preference: input.preference || '待补充客户偏好。',
    contacts: [
      {
        name: input.contactName || '待补充联系人',
        title: input.contactTitle || '联系人',
        email: input.contactEmail || '',
        phone: input.contactPhone || '',
        primary: true
      }
    ],
    activities: [`${new Date().toISOString().slice(0, 10)} 手动新建客户档案`]
  };

  records.customers.push(customer);
  writeCrmRecords(records);
  return customer;
}

export function addProject(input: {
  customerId: string;
  name: string;
  type?: string;
  stage?: string;
  owner: string;
  collaborators?: string;
  amount?: string;
  risk?: string;
  priority?: string;
  due?: string;
  nextAction?: string;
  nextFollow?: string;
}) {
  const customer = getCustomerById(input.customerId);

  if (!customer) {
    return undefined;
  }

  const records = readCrmRecords();
  const idBase = slugify(input.name);
  const existingIds = new Set(getProjects().map((project) => project.id));
  let id = idBase;
  let index = 2;

  while (existingIds.has(id)) {
    id = `${idBase}-${index}`;
    index++;
  }

  const project: Project = {
    id,
    customerId: customer.id,
    name: input.name,
    customer: customer.name,
    type: input.type || '新客户开发',
    stage: input.stage || '新线索',
    owner: input.owner,
    collaborators: input.collaborators ? input.collaborators.split(/[,，、]/).map((item) => item.trim()).filter(Boolean) : [],
    amount: input.amount || '待评估',
    risk: input.risk || '绿灯',
    priority: input.priority || '中',
    start: new Date().toISOString().slice(0, 10),
    due: input.due || new Date().toISOString().slice(0, 10),
    nextAction: input.nextAction || '补充客户需求并建立下一步跟进计划',
    nextFollow: input.nextFollow || new Date().toISOString().slice(0, 10),
    portalVisible: true,
    timeline: [`${new Date().toISOString().slice(0, 10)} 手动新建项目`],
    tasks: [
      {
        title: input.nextAction || '补充客户需求并建立下一步跟进计划',
        status: '进行中',
        owner: input.owner,
        due: input.nextFollow || input.due || new Date().toISOString().slice(0, 10)
      }
    ],
    files: [],
    confirmations: [],
    messages: []
  };

  records.projects.push(project);
  writeCrmRecords(records);
  return project;
}

export function getCustomerById(id: string) {
  return getCustomers().find((customer) => customer.id === id);
}

export function getProjectById(id: string) {
  return getProjects().find((project) => project.id === id);
}

export function getProjectsByCustomerId(customerId: string) {
  return getProjects().filter((project) => project.customerId === customerId);
}

export function getMailById(id: string) {
  return mails.find((mail) => mail.id === id);
}
