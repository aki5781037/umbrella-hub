'use client';

import { useMemo, useState } from 'react';

type CustomerOption = {
  id: string;
  name: string;
  country: string;
  owner: string;
};

const projectTemplates = [
  {
    key: 'inquiry',
    name: '新客户询盘',
    description: '首次需求、规格和报价机会',
    flow: ['记录需求', '确认规格', '核算报价', '发送报价', '跟进反馈'],
    tasks: ['记录客户核心需求', '确认规格和 MOQ', '核算报价', '发送报价资料', '跟进客户反馈'],
    stage: '需求确认',
    nextAction: '确认客户规格、MOQ 和目标价。'
  },
  {
    key: 'quotation',
    name: '报价项目',
    description: '产品、数量、包装和价格确认',
    flow: ['确认产品', '确认数量/包装', '核价', '发报价', '等客户决定'],
    tasks: ['确认产品型号', '确认数量和包装', '核算成本价格', '发送报价单', '跟进客户决定'],
    stage: '报价准备中',
    nextAction: '确认产品数量、包装和目标价格。'
  },
  {
    key: 'sample',
    name: '打样项目',
    description: '样品需求、材料、寄样和反馈',
    flow: ['确认需求', '供应商材料', '打样', '寄样', '客户反馈'],
    tasks: ['确认样品需求', '跟供应商确认材料', '安排快递取样', '填写快递单号', '跟进客户反馈'],
    stage: '样品 / 方案沟通',
    nextAction: '确认样品需求并跟供应商落实材料。'
  },
  {
    key: 'design',
    name: '新设计开发',
    description: '图案、款式和客户修改确认',
    flow: ['收集需求', '出设计', '内部确认', '发客户', '修改/定稿'],
    tasks: ['收集设计要求', '输出第一版设计', '内部检查', '发送客户确认', '记录修改意见'],
    stage: '样品 / 方案沟通',
    nextAction: '整理客户设计要求并输出第一版方案。'
  },
  {
    key: 'bulk',
    name: '大货订单',
    description: '定金、排产、生产和出货',
    flow: ['确认订单', '收定金', '排产', '生产跟进', '验货/出货'],
    tasks: ['确认 PI 和订单信息', '跟进定金到账', '确认排产时间', '跟进生产进度', '安排验货和出货'],
    stage: '商务谈判',
    nextAction: '确认订单信息、定金和排产计划。'
  },
  {
    key: 'material',
    name: '物料跟进',
    description: '面料、伞骨、包装等到料确认',
    flow: ['确认物料', '联系供应商', '获取交期', '到料确认'],
    tasks: ['确认物料清单', '联系供应商', '获取价格和交期', '确认到料状态'],
    stage: '需求确认',
    nextAction: '确认物料清单并联系供应商反馈交期。'
  },
  {
    key: 'supplier',
    name: '供应商协作',
    description: '价格、交期、照片和执行跟进',
    flow: ['发出需求', '等待回复', '确认价格/交期', '执行跟进'],
    tasks: ['发出供应商需求', '等待供应商回复', '确认价格和交期', '记录执行结果'],
    stage: '等待客户决定',
    nextAction: '向供应商发出需求并等待价格、交期回复。'
  },
  {
    key: 'courier',
    name: '快递寄样',
    description: '收件信息、取件、单号和签收',
    flow: ['确认收件信息', '安排取件', '获取单号', '跟踪签收'],
    tasks: ['确认收件地址', '安排快递取件', '获取快递单号', '跟踪签收状态'],
    stage: '样品 / 方案沟通',
    nextAction: '确认收件信息并安排快递取件。'
  },
  {
    key: 'shipping',
    name: '出货物流',
    description: '订舱、报关、发货和单证',
    flow: ['确认出货时间', '订舱/物流', '报关资料', '发货', '单证确认'],
    tasks: ['确认出货时间', '安排订舱或物流', '准备报关资料', '跟踪发货', '确认单证'],
    stage: '商务谈判',
    nextAction: '确认出货时间并安排物流方案。'
  },
  {
    key: 'payment',
    name: '收款跟进',
    description: '定金、尾款、到账和提醒',
    flow: ['确认金额', '发送付款信息', '等待付款', '到账确认'],
    tasks: ['确认应收金额', '发送付款信息', '提醒客户付款', '确认到账'],
    stage: '等待客户决定',
    nextAction: '确认应收金额并发送付款信息。'
  },
  {
    key: 'docs',
    name: '单证资料',
    description: 'PI、CI、PL、合同和产地证',
    flow: ['确认资料', '制作单证', '内部检查', '发客户', '确认无误'],
    tasks: ['确认单证需求', '制作资料', '内部检查', '发送客户', '记录确认结果'],
    stage: '报价准备中',
    nextAction: '确认客户需要的单证资料并开始制作。'
  },
  {
    key: 'after-sale',
    name: '售后问题',
    description: '客诉、证据、方案和关闭',
    flow: ['记录问题', '收集证据', '内部核查', '给方案', '关闭问题'],
    tasks: ['记录客户问题', '收集图片或视频证据', '内部核查原因', '给出处理方案', '确认关闭'],
    stage: '需求确认',
    nextAction: '记录售后问题并收集客户证据。'
  }
];

export function NewProjectForm({ customers }: { customers: CustomerOption[] }) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('sample');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [priority, setPriority] = useState('高');
  const selectedTemplate = projectTemplates.find((template) => template.key === selectedTemplateKey) || projectTemplates[0];
  const selectedCustomer = customers.find((customer) => customer.id === customerId) || customers[0];

  const defaultProjectName = useMemo(() => {
    if (!selectedCustomer) return selectedTemplate.name;
    return `${selectedCustomer.name} - ${selectedTemplate.name}`;
  }, [selectedCustomer, selectedTemplate.name]);

  return (
    <form action="/api/projects" method="post" className="rounded-2xl border border-line bg-white shadow-panel">
      <input type="hidden" name="type" value={selectedTemplate.name} />
      <input type="hidden" name="stage" value={selectedTemplate.stage} />
      <input type="hidden" name="risk" value={priority === '高' ? '黄灯' : '绿灯'} />
      <input type="hidden" name="templateTasks" value={selectedTemplate.tasks.join('\n')} />

      <div className="border-b border-line p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <label className="text-sm font-semibold text-ink">
            客户 *
            <select
              name="customerId"
              required
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-soft px-4 py-3 outline-none focus:border-brand"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name} · {customer.country}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink">
            负责人 *
            <input name="owner" required key={selectedCustomer?.id || 'owner'} defaultValue={selectedCustomer?.owner || ''} className="mt-2 w-full rounded-xl border border-line bg-soft px-4 py-3 outline-none focus:border-brand" />
          </label>
          <div className="text-sm font-semibold text-ink">
            优先级
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['高', '中', '低'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPriority(item)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold ${priority === item ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-line bg-soft text-muted'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <input type="hidden" name="priority" value={priority} />
          </div>
          <label className="text-sm font-semibold text-ink">
            截止时间
            <input name="due" type="date" defaultValue="2026-05-28" className="mt-2 w-full rounded-xl border border-line bg-soft px-4 py-3 outline-none focus:border-brand" />
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <label className="text-sm font-semibold text-ink">
            项目名称 *
            <input name="name" required key={defaultProjectName} defaultValue={defaultProjectName} className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>
          <label className="text-sm font-semibold text-ink">
            协作人
            <input name="collaborators" placeholder="例如 Cathy、Tom" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>
          <label className="text-sm font-semibold text-ink">
            预计金额
            <input name="amount" placeholder="例如 USD 18,000" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section>
          <div className="mb-3">
            <h3 className="text-lg font-bold text-ink">选择项目类型</h3>
            <p className="mt-1 text-sm text-muted">外贸高频事项做成模板，创建后再在项目详情里补充具体小任务。</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {projectTemplates.map((template) => {
              const selected = template.key === selectedTemplateKey;

              return (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => setSelectedTemplateKey(template.key)}
                  className={`rounded-2xl border p-4 text-left transition hover:border-blue-200 hover:bg-blue-50 ${selected ? 'border-blue-300 bg-blue-50 shadow-sm shadow-blue-100' : 'border-line bg-white'}`}
                >
                  <p className="font-bold text-ink">{template.name}</p>
                  <p className="mt-2 text-sm leading-5 text-muted">{template.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-line bg-soft p-5">
          <h3 className="text-lg font-bold text-ink">自动生成流程</h3>
          <p className="mt-1 text-sm text-muted">{selectedTemplate.name} · 精简模板</p>
          <div className="mt-4 space-y-2">
            {selectedTemplate.flow.map((step, index) => (
              <div key={step} className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-brand">
                {index + 1}. {step}
              </div>
            ))}
          </div>

          <h4 className="mt-5 font-bold text-ink">默认子任务</h4>
          <div className="mt-3 space-y-2">
            {selectedTemplate.tasks.map((task) => (
              <div key={task} className="grid grid-cols-[18px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-white p-3 text-sm">
                <span className="h-4 w-4 rounded border border-slate-300" />
                <span className="font-semibold text-ink">{task}</span>
                <span className="text-xs font-bold text-muted">自动</span>
              </div>
            ))}
          </div>

          <label className="mt-5 block text-sm font-semibold text-ink">
            下一步动作
            <textarea name="nextAction" rows={4} defaultValue={selectedTemplate.nextAction} key={selectedTemplate.key} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand" />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            下次跟进
            <input name="nextFollow" type="date" defaultValue="2026-05-24" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand" />
          </label>
        </aside>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-line p-6">
        <a href="/projects" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-soft">取消</a>
        <button type="submit" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100">创建项目</button>
      </div>
    </form>
  );
}
