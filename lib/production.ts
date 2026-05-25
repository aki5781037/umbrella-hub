import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ensureBackupSchedulerStarted } from '@/lib/backup';
import { getCustomerById } from '@/lib/data';
import type {
  ParsedOrderDetails,
  ParsedProductionDocument,
  ParsedProductionSpec,
  ProductionDocumentType
} from '@/lib/production-document-parser';

export const productionStages = [
  '接单确认',
  '定金/合同',
  '产前准备',
  '物料采购',
  '生产中',
  '验货',
  '包装入库',
  '出货/单证',
  '已完成'
] as const;

export type ProductionStage = (typeof productionStages)[number];

export type ProductionAttachment = {
  name: string;
  storedName: string;
  uploadedAt: string;
  stage?: ProductionStage;
  documentType?: ProductionDocumentType;
  parsedDocument?: ParsedProductionDocument;
};

export type ProductionTaskStatus = '已完成' | '进行中' | '待开始';

export type ProductionTask = {
  id: string;
  title: string;
  status: ProductionTaskStatus;
  due: string;
  createdBy: 'system' | 'admin';
  createdAt?: string;
};

export type ProductionComment = {
  id: string;
  authorRole: 'admin' | 'customer';
  authorName: string;
  body: string;
  createdAt: string;
};

export type ProductionOrder = {
  id: string;
  customerId: string;
  customer: string;
  country: string;
  orderNo: string;
  product: string;
  quantity: string;
  amount: string;
  owner: string;
  factory: string;
  stage: ProductionStage | '已结束';
  priority: '高' | '中' | '低';
  risk: '红灯' | '黄灯' | '绿灯';
  progress: number;
  due: string;
  shipDate: string;
  nextAction: string;
  milestones: Array<{
    title: string;
    status: '已完成' | '进行中' | '待开始';
    due: string;
  }>;
  checks: string[];
  timeline: string[];
  recognizedOrderDetails?: ParsedOrderDetails;
  productionSpec?: ParsedProductionSpec;
  tasks?: ProductionTask[];
  comments?: ProductionComment[];
  attachments?: ProductionAttachment[];
  closedAt?: string;
};

export const productionOrders: ProductionOrder[] = [
  {
    id: 'po-abc-260518',
    customerId: 'abc-malaysia',
    customer: 'ABC Malaysia',
    country: 'Malaysia',
    orderNo: 'PO-ABC-260518',
    product: '21寸三折自动伞',
    quantity: '12,000 pcs',
    amount: 'USD 28,600',
    owner: 'Linda',
    factory: '义乌 A 厂',
    stage: '物料采购',
    priority: '高',
    risk: '红灯',
    progress: 36,
    due: '2026-06-18',
    shipDate: '2026-06-25',
    nextAction: '确认伞布到料时间，并催供应商提供骨架库存照片。',
    milestones: [
      { title: '客户 PO 和 PI 已确认', status: '已完成', due: '2026-05-18' },
      { title: '定金到账确认', status: '已完成', due: '2026-05-20' },
      { title: '面料色号和包装稿确认', status: '进行中', due: '2026-05-24' },
      { title: '伞骨和手柄采购', status: '待开始', due: '2026-05-28' },
      { title: '产前样确认', status: '待开始', due: '2026-06-02' }
    ],
    checks: ['合同/PI', '定金', '面料', '伞骨', '包装稿', '产前样', '验货', '报关资料'],
    timeline: ['2026-05-23 已催供应商确认伞布交期', '2026-05-22 客户确认包装唛头', '2026-05-20 财务确认定金到账']
  },
  {
    id: 'po-korea-260512',
    customerId: 'korea-brand',
    customer: 'Korea Brand',
    country: 'Korea',
    orderNo: 'PO-KR-260512',
    product: '联名款直杆伞',
    quantity: '8,000 pcs',
    amount: 'USD 19,800',
    owner: 'Cathy',
    factory: '绍兴 B 厂',
    stage: '生产中',
    priority: '中',
    risk: '黄灯',
    progress: 58,
    due: '2026-06-05',
    shipDate: '2026-06-12',
    nextAction: '跟进 LOGO 印刷首件照片，确认后继续批量生产。',
    milestones: [
      { title: '产前样已确认', status: '已完成', due: '2026-05-21' },
      { title: 'LOGO 印刷首件确认', status: '进行中', due: '2026-05-25' },
      { title: '主体生产完成 50%', status: '进行中', due: '2026-05-29' },
      { title: '安排中期检查', status: '待开始', due: '2026-06-01' }
    ],
    checks: ['合同/PI', '定金', '面料', '印刷', '产前样', '生产', '验货', '出货'],
    timeline: ['2026-05-23 工厂反馈伞面已开始印刷', '2026-05-21 客户确认产前样', '2026-05-18 已下达生产通知']
  },
  {
    id: 'po-sunny-260520',
    customerId: 'sunny-retail',
    customer: 'Sunny Retail',
    country: 'UAE',
    orderNo: 'PO-SR-260520',
    product: '高尔夫伞返单',
    quantity: '5,000 pcs',
    amount: 'USD 24,000',
    owner: 'Tom',
    factory: '宁波 C 厂',
    stage: '验货',
    priority: '高',
    risk: '黄灯',
    progress: 74,
    due: '2026-05-28',
    shipDate: '2026-06-02',
    nextAction: '确认验货时间，准备装箱单和客户指定唛头。',
    milestones: [
      { title: '生产完成', status: '已完成', due: '2026-05-22' },
      { title: '预约验货', status: '进行中', due: '2026-05-24' },
      { title: '整理装箱资料', status: '待开始', due: '2026-05-26' },
      { title: '安排拖车和报关', status: '待开始', due: '2026-05-29' }
    ],
    checks: ['合同/PI', '定金', '生产', '验货', '装箱单', '订舱', '报关', '提单'],
    timeline: ['2026-05-23 已通知验货员预留时间', '2026-05-22 工厂反馈大货完成', '2026-05-20 客户确认沿用旧 LOGO']
  },
  {
    id: 'po-ocean-260510',
    customerId: 'ocean-retail',
    customer: 'Ocean Retail',
    country: 'Australia',
    orderNo: 'PO-OR-260510',
    product: '儿童透明伞',
    quantity: '10,000 pcs',
    amount: 'USD 17,200',
    owner: 'Mia',
    factory: '台州 D 厂',
    stage: '出货/单证',
    priority: '中',
    risk: '绿灯',
    progress: 86,
    due: '2026-05-30',
    shipDate: '2026-06-03',
    nextAction: '等待货代确认入仓单，并发送 CI/PL 给客户确认。',
    milestones: [
      { title: '验货通过', status: '已完成', due: '2026-05-22' },
      { title: '货物入仓', status: '进行中', due: '2026-05-27' },
      { title: '发送 CI/PL', status: '待开始', due: '2026-05-28' },
      { title: '确认提单草稿', status: '待开始', due: '2026-06-04' }
    ],
    checks: ['合同/PI', '生产', '验货', '入仓', 'CI', 'PL', '报关', '提单'],
    timeline: ['2026-05-23 货代反馈等待入仓号', '2026-05-22 验货通过', '2026-05-21 包装入库完成']
  }
];

type ProductionRecords = {
  orders?: ProductionOrder[];
  orderUpdates?: Record<string, ProductionOrder>;
};

const recordsPath = join(process.cwd(), 'data', 'production-records.json');

function ensureProductionRecordsDir() {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
}

function readProductionRecords(): ProductionRecords {
  ensureProductionRecordsDir();

  if (!existsSync(recordsPath)) {
    return { orders: [], orderUpdates: {} };
  }

  try {
    const stored = JSON.parse(readFileSync(recordsPath, 'utf8')) as Partial<ProductionRecords>;
    return {
      orders: Array.isArray(stored.orders) ? stored.orders : [],
      orderUpdates: stored.orderUpdates && typeof stored.orderUpdates === 'object' ? stored.orderUpdates : {}
    };
  } catch {
    return { orders: [], orderUpdates: {} };
  }
}

function writeProductionRecords(records: ProductionRecords) {
  ensureProductionRecordsDir();
  writeFileSync(recordsPath, JSON.stringify(records, null, 2), 'utf8');
}

function normalizeRecordId(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export function orderIsClosed(order: ProductionOrder) {
  return order.stage === '已结束' || Boolean(order.closedAt);
}

function taskIdFor(orderId: string, index: number) {
  return `${orderId}-task-${index}`;
}

function newRecordId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `order-${Date.now()}`;
}

function defaultTasksForOrder(order: ProductionOrder): ProductionTask[] {
  return order.milestones.map((item, index) => ({
    id: taskIdFor(order.id, index),
    title: item.title,
    status: item.status,
    due: item.due,
    createdBy: 'system' as const
  }));
}

function normalizeOrder(order: ProductionOrder): ProductionOrder {
  return {
    ...order,
    tasks: Array.isArray(order.tasks) ? order.tasks : defaultTasksForOrder(order),
    comments: Array.isArray(order.comments) ? order.comments : []
  };
}

function mergeOrderUpdate(order: ProductionOrder, records: ProductionRecords) {
  const update = records.orderUpdates?.[order.id];
  return normalizeOrder(update ? { ...order, ...update } : order);
}

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function progressForStage(stage: ProductionStage) {
  const stageIndex = productionStages.indexOf(stage);
  if (stageIndex < 0) {
    return 0;
  }

  return Math.round(((stageIndex + 1) / productionStages.length) * 100);
}

function nextActionForStage(stage: ProductionStage) {
  const actions: Record<ProductionStage, string> = {
    接单确认: '确认客户 PO、产品规格和内部负责人。',
    '定金/合同': '跟进合同签回和定金到账。',
    产前准备: '确认产前样、包装稿、色号和生产资料。',
    物料采购: '跟进面料、伞骨、手柄和包装物料到料时间。',
    生产中: '跟进大货生产进度和关键工序照片。',
    验货: '预约验货并准备验货标准、装箱资料。',
    包装入库: '确认包装完成、入仓时间和装箱单。',
    '出货/单证': '安排出货、报关和客户单证确认。',
    已完成: '订单生产流程已完成，等待归档或结束订单。'
  };

  return actions[stage];
}

function allProductionOrderBases(records: ProductionRecords) {
  return [...productionOrders, ...(records.orders || [])];
}

function updateProductionOrder(orderId: string, updater: (order: ProductionOrder) => ProductionOrder) {
  ensureBackupSchedulerStarted();
  const normalizedId = normalizeRecordId(orderId);
  const records = readProductionRecords();
  const currentOrder = allProductionOrderBases(records)
    .map((order) => mergeOrderUpdate(order, records))
    .find((order) => order.id === normalizedId);

  if (!currentOrder) {
    return undefined;
  }

  const nextOrder = normalizeOrder(updater(currentOrder));
  records.orderUpdates = {
    ...(records.orderUpdates || {}),
    [normalizedId]: nextOrder
  };
  writeProductionRecords(records);
  return nextOrder;
}

export function getProductionOrders(customerId?: string, options?: { includeClosed?: boolean }) {
  ensureBackupSchedulerStarted();
  const records = readProductionRecords();
  const orders = allProductionOrderBases(records).map((order) => mergeOrderUpdate(order, records));
  const filteredOrders = options?.includeClosed ? orders : orders.filter((order) => !orderIsClosed(order));

  return customerId ? filteredOrders.filter((order) => order.customerId === customerId) : filteredOrders;
}

export function getProductionOrderById(orderId: string) {
  const normalizedId = normalizeRecordId(orderId);
  return getProductionOrders(undefined, { includeClosed: true }).find((order) => order.id === normalizedId);
}

export function addProductionOrder(input: {
  customerId: string;
  orderNo: string;
  product: string;
  quantity?: string;
  amount?: string;
  owner: string;
  factory?: string;
  priority?: string;
  risk?: string;
  due?: string;
  shipDate?: string;
  nextAction?: string;
  taskLines?: string;
}) {
  ensureBackupSchedulerStarted();
  const customer = getCustomerById(input.customerId);

  if (!customer) {
    return undefined;
  }

  const orderNo = input.orderNo.trim();
  const product = input.product.trim();
  const owner = input.owner.trim();

  if (!orderNo || !product || !owner) {
    return undefined;
  }

  const records = readProductionRecords();
  const existingIds = new Set(allProductionOrderBases(records).map((order) => order.id));
  const idBase = slugify(orderNo || product);
  let id = idBase.startsWith('po-') ? idBase : `po-${idBase}`;
  let index = 2;

  while (existingIds.has(id)) {
    id = `${idBase}-${index}`;
    if (!id.startsWith('po-')) {
      id = `po-${id}`;
    }
    index++;
  }

  const due = input.due?.trim() || input.shipDate?.trim() || todayText();
  const shipDate = input.shipDate?.trim() || due;
  const taskLines = input.taskLines
    ? input.taskLines.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    : [];
  const taskTitles = taskLines.length > 0 ? taskLines : [
    '确认客户 PO / PI 信息',
    '确认定金或付款安排',
    '确认物料、包装和生产资料',
    '安排生产排期',
    '准备验货和出货资料'
  ];
  const milestones = taskTitles.map((title, taskIndex) => ({
    title,
    status: taskIndex === 0 ? '进行中' as const : '待开始' as const,
    due
  }));
  const order: ProductionOrder = normalizeOrder({
    id,
    customerId: customer.id,
    customer: customer.name,
    country: customer.country,
    orderNo,
    product,
    quantity: input.quantity?.trim() || '待确认',
    amount: input.amount?.trim() || '待确认',
    owner,
    factory: input.factory?.trim() || '待分配工厂',
    stage: '接单确认',
    priority: input.priority === '高' || input.priority === '低' ? input.priority : '中',
    risk: input.risk === '红灯' || input.risk === '黄灯' ? input.risk : '绿灯',
    progress: progressForStage('接单确认'),
    due,
    shipDate,
    nextAction: input.nextAction?.trim() || nextActionForStage('接单确认'),
    milestones,
    checks: ['合同/PI', '定金', '面料', '伞骨', '包装稿', '产前样', '验货', '报关资料'],
    timeline: [`${todayText()} 手动新建生产订单：${orderNo}`],
    comments: [],
    attachments: []
  });

  records.orders = [...(records.orders || []), order];
  writeProductionRecords(records);
  return order;
}

export function updateProductionOrderStage(orderId: string, stage: string) {
  const nextStage = stage.trim();

  if (!productionStages.some((item) => item === nextStage)) {
    return undefined;
  }

  return updateProductionOrder(orderId, (order) => {
    if (orderIsClosed(order)) {
      return order;
    }

    const typedStage = nextStage as ProductionStage;

    return {
      ...order,
      stage: typedStage,
      progress: progressForStage(typedStage),
      risk: typedStage === '已完成' ? '绿灯' : order.risk,
      nextAction: nextActionForStage(typedStage),
      timeline: [...order.timeline, `${todayText()} 生产流程推进到：${typedStage}`]
    };
  });
}

export function updateProductionOrderTask(orderId: string, taskId: string, done: boolean) {
  const cleanTaskId = taskId.trim();

  if (!cleanTaskId) {
    return undefined;
  }

  return updateProductionOrder(orderId, (order) => {
    const currentTasks = order.tasks || [];

    if (orderIsClosed(order) || !currentTasks.some((task) => task.id === cleanTaskId)) {
      return order;
    }

    const tasks = currentTasks.map((task) => (
      task.id === cleanTaskId
        ? { ...task, status: done ? '已完成' as const : '进行中' as const }
        : task
    ));
    const targetTask = tasks.find((task) => task.id === cleanTaskId);

    return {
      ...order,
      tasks,
      timeline: [...order.timeline, `${todayText()} ${done ? '完成' : '重新打开'}生产子任务：${targetTask?.title || cleanTaskId}`]
    };
  });
}

export function addProductionOrderTask(orderId: string, input: { title: string; due?: string }) {
  const title = input.title.trim();
  const due = input.due?.trim() || todayText();

  if (!title) {
    return undefined;
  }

  return updateProductionOrder(orderId, (order) => {
    if (orderIsClosed(order)) {
      return order;
    }

    const task: ProductionTask = {
      id: newRecordId('task'),
      title,
      status: '待开始',
      due,
      createdBy: 'admin',
      createdAt: new Date().toISOString()
    };

    return {
      ...order,
      tasks: [...(order.tasks || []), task],
      timeline: [...order.timeline, `${todayText()} 新增生产子任务：${title}`]
    };
  });
}

export function deleteProductionOrderTask(orderId: string, taskId: string) {
  const cleanTaskId = taskId.trim();

  if (!cleanTaskId) {
    return undefined;
  }

  return updateProductionOrder(orderId, (order) => {
    const currentTasks = order.tasks || [];

    if (orderIsClosed(order) || !currentTasks.some((task) => task.id === cleanTaskId)) {
      return order;
    }

    const deletedTask = currentTasks.find((task) => task.id === cleanTaskId);

    return {
      ...order,
      tasks: currentTasks.filter((task) => task.id !== cleanTaskId),
      timeline: [...order.timeline, `${todayText()} 删除生产子任务：${deletedTask?.title || cleanTaskId}`]
    };
  });
}

export function addProductionOrderAttachment(orderId: string, fileName: string, storedName: string) {
  return addProductionOrderDocument(orderId, fileName, storedName);
}

export function addProductionOrderDocument(orderId: string, fileName: string, storedName: string, input?: {
  stage?: string;
  documentType?: ProductionDocumentType;
  parsedDocument?: ParsedProductionDocument;
}) {
  const cleanFileName = fileName.trim();
  const cleanStoredName = storedName.trim();

  if (!cleanFileName || !cleanStoredName) {
    return undefined;
  }

  return updateProductionOrder(orderId, (order) => {
    if (orderIsClosed(order)) {
      return order;
    }

    const stage = productionStages.find((item) => item === input?.stage);
    const parsedDocument = input?.parsedDocument;
    const orderDetails = parsedDocument?.orderDetails || {};
    const productionSpec = parsedDocument?.productionSpec || {};
    const recognizedOrderDetails = {
      ...(order.recognizedOrderDetails || {}),
      ...orderDetails
    };
    const mergedProductionSpec = {
      ...(order.productionSpec || {}),
      ...productionSpec
    };
    const attachments = [
      ...(order.attachments || []).filter((file) => file.storedName !== cleanStoredName),
      {
        name: cleanFileName,
        storedName: cleanStoredName,
        uploadedAt: new Date().toISOString(),
        stage,
        documentType: input?.documentType,
        parsedDocument
      }
    ];
    const recognizedFields = [
      orderDetails.customerName ? `客户：${orderDetails.customerName}` : '',
      orderDetails.quantity ? `数量：${orderDetails.quantity}` : '',
      orderDetails.amount ? `金额：${orderDetails.amount}` : '',
      orderDetails.deliveryDate ? `交期：${orderDetails.deliveryDate}` : '',
      productionSpec.umbrellaFabric ? `伞面：${productionSpec.umbrellaFabric}` : '',
      productionSpec.frameMaterial ? `伞骨：${productionSpec.frameMaterial}` : '',
      productionSpec.packaging ? `包装：${productionSpec.packaging}` : ''
    ].filter(Boolean);

    return {
      ...order,
      customer: orderDetails.customerName || order.customer,
      orderNo: orderDetails.orderNo || order.orderNo,
      quantity: orderDetails.quantity || order.quantity,
      amount: orderDetails.amount || order.amount,
      shipDate: orderDetails.deliveryDate || order.shipDate,
      recognizedOrderDetails,
      productionSpec: mergedProductionSpec,
      attachments,
      timeline: [
        ...order.timeline,
        `${todayText()} 上传${documentTypeLabel(input?.documentType)}：${cleanFileName}${recognizedFields.length ? `，自动识别 ${recognizedFields.join('、')}` : ''}`
      ]
    };
  });
}

function documentTypeLabel(documentType?: ProductionDocumentType) {
  if (documentType === 'contract') return '合同';
  if (documentType === 'production_sheet') return '生产单';
  return '生产资料';
}

export function getProductionOrderAttachment(orderId: string, storedName: string) {
  const order = getProductionOrderById(orderId);
  const attachment = order?.attachments?.find((item) => item.storedName === storedName);

  if (!order || !attachment) {
    return undefined;
  }

  return { order, attachment };
}

export function addProductionOrderComment(orderId: string, input: {
  authorRole: 'admin' | 'customer';
  authorName: string;
  body: string;
}) {
  const body = input.body.trim();
  const authorName = input.authorName.trim() || (input.authorRole === 'customer' ? '客户' : '内部同事');

  if (!body) {
    return undefined;
  }

  return updateProductionOrder(orderId, (order) => ({
    ...order,
    comments: [
      ...(order.comments || []),
      {
        id: newRecordId('comment'),
        authorRole: input.authorRole,
        authorName,
        body: body.slice(0, 1000),
        createdAt: new Date().toISOString()
      }
    ],
    timeline: [...order.timeline, `${todayText()} ${authorName} 添加订单评论`]
  }));
}

export function closeProductionOrder(orderId: string) {
  return updateProductionOrder(orderId, (order) => ({
    ...order,
    stage: '已结束',
    risk: '绿灯',
    progress: 100,
    nextAction: '订单已结束，生产资料已归档。',
    closedAt: new Date().toISOString(),
    timeline: [...order.timeline, `${todayText()} 订单已结束`]
  }));
}
