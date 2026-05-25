import ExcelJS from 'exceljs';

export type ProductionDocumentType = 'contract' | 'production_sheet' | 'other';

export type ParsedOrderDetails = {
  customerName?: string;
  quantity?: string;
  amount?: string;
  deliveryDate?: string;
  orderNo?: string;
};

export type ParsedProductionSpec = {
  umbrellaFabric?: string;
  frameMaterial?: string;
  packaging?: string;
  wovenLabel?: string;
  hangTag?: string;
  carton?: string;
  handle?: string;
  printing?: string;
  notes?: string;
};

export type ParsedProductionDocument = {
  documentType: ProductionDocumentType;
  textPreview: string;
  orderDetails: ParsedOrderDetails;
  productionSpec: ParsedProductionSpec;
  recognizedLabels: string[];
};

type CellPair = {
  label: string;
  value: string;
};

const orderFieldLabels: Array<{ field: keyof ParsedOrderDetails; labels: string[] }> = [
  { field: 'customerName', labels: ['客户', '客户名称', '客人', 'buyer', 'customer', 'client'] },
  { field: 'quantity', labels: ['数量', '订单数量', '下单数量', 'qty', 'quantity', 'order qty', 'order quantity'] },
  { field: 'amount', labels: ['金额', '订单金额', '合同金额', '总金额', 'amount', 'total amount', 'total'] },
  { field: 'deliveryDate', labels: ['交货日期', '交期', '交货期', '出货日期', 'delivery date', 'shipment date', 'ship date', 'etd'] },
  { field: 'orderNo', labels: ['订单号', '合同号', 'po', 'po no', 'po no.', 'order no', 'order number'] }
];

const specFieldLabels: Array<{ field: keyof ParsedProductionSpec; labels: string[] }> = [
  { field: 'umbrellaFabric', labels: ['伞面', '伞布', '面料', '布料', 'canopy', 'fabric', 'umbrella fabric'] },
  { field: 'frameMaterial', labels: ['伞骨', '骨架', '中棒', '伞架', 'frame', 'rib', 'ribs', 'shaft'] },
  { field: 'packaging', labels: ['包装', '包装方式', '内包装', 'packing', 'package', 'packaging'] },
  { field: 'wovenLabel', labels: ['布标', '水洗标', '织唛', 'woven label', 'label'] },
  { field: 'hangTag', labels: ['吊牌', '挂牌', 'hang tag', 'hangtag'] },
  { field: 'carton', labels: ['外箱', '纸箱', '箱规', 'carton', 'master carton'] },
  { field: 'handle', labels: ['手柄', '伞柄', 'handle'] },
  { field: 'printing', labels: ['印刷', 'logo', 'logo印刷', 'print', 'printing'] },
  { field: 'notes', labels: ['备注', '特殊要求', '生产备注', 'remark', 'remarks', 'notes'] }
];

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/^[:：\-\s]+|[:：\-\s]+$/g, '')
    .trim();
}

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[\s:：\-_/\\().,，。]+/g, '');
}

function normalizeDateValue(value: string) {
  const cleaned = cleanText(value);
  const iso = cleaned.match(/\b(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  }

  const slash = cleaned.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
  if (slash) {
    return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
  }

  return cleaned;
}

function maybeSplitLabelValue(value: string): CellPair | undefined {
  const match = value.match(/^([^:：]{2,40})[:：]\s*(.+)$/);
  if (!match) {
    return undefined;
  }

  return {
    label: cleanText(match[1]),
    value: cleanText(match[2])
  };
}

function labelMatches(label: string, aliases: string[]) {
  const normalized = normalizeLabel(label);
  return aliases.some((alias) => normalized.includes(normalizeLabel(alias)));
}

function setOrderField(details: ParsedOrderDetails, field: keyof ParsedOrderDetails, value: string) {
  const cleanValue = field === 'deliveryDate' ? normalizeDateValue(value) : cleanText(value);
  if (cleanValue && !details[field]) {
    details[field] = cleanValue;
  }
}

function setSpecField(spec: ParsedProductionSpec, field: keyof ParsedProductionSpec, value: string) {
  const cleanValue = cleanText(value);
  if (cleanValue && !spec[field]) {
    spec[field] = cleanValue;
  }
}

function applyPairs(pairs: CellPair[]) {
  const orderDetails: ParsedOrderDetails = {};
  const productionSpec: ParsedProductionSpec = {};
  const recognizedLabels: string[] = [];

  pairs.forEach((pair) => {
    orderFieldLabels.forEach(({ field, labels }) => {
      if (labelMatches(pair.label, labels)) {
        setOrderField(orderDetails, field, pair.value);
        recognizedLabels.push(pair.label);
      }
    });

    specFieldLabels.forEach(({ field, labels }) => {
      if (labelMatches(pair.label, labels)) {
        setSpecField(productionSpec, field, pair.value);
        recognizedLabels.push(pair.label);
      }
    });
  });

  return {
    orderDetails,
    productionSpec,
    recognizedLabels: Array.from(new Set(recognizedLabels)).slice(0, 20)
  };
}

function regexFallback(rawText: string, parsed: ReturnType<typeof applyPairs>) {
  const orderPatterns: Array<[keyof ParsedOrderDetails, RegExp]> = [
    ['customerName', /(?:客户名称|客户|客人|customer|buyer|client)\s*[:：]?\s*([^\n\r,，;；]{2,80})/i],
    ['quantity', /(?:订单数量|下单数量|数量|qty|quantity|order qty)\s*[:：]?\s*([0-9][0-9,.\s]*(?:pcs|把|件|支|只)?)/i],
    ['amount', /(?:订单金额|合同金额|总金额|金额|total amount|amount|total)\s*[:：]?\s*((?:usd|rmb|cny|eur|¥|\$)?\s*[0-9][0-9,.\s]*)/i],
    ['deliveryDate', /(?:交货日期|交期|出货日期|delivery date|shipment date|ship date|etd)\s*[:：]?\s*([0-9]{4}[-/.年][0-9]{1,2}[-/.月][0-9]{1,2}|[0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{4})/i],
    ['orderNo', /(?:订单号|合同号|po no\.?|order no\.?|order number)\s*[:：]?\s*([A-Z0-9][A-Z0-9\-_/]{3,40})/i]
  ];

  const specPatterns: Array<[keyof ParsedProductionSpec, RegExp]> = [
    ['umbrellaFabric', /(?:伞面|伞布|面料|canopy|fabric)\s*[:：]?\s*([^\n\r,，;；]{2,100})/i],
    ['frameMaterial', /(?:伞骨|骨架|中棒|frame|ribs?|shaft)\s*[:：]?\s*([^\n\r,，;；]{2,100})/i],
    ['packaging', /(?:包装方式|包装|packing|packaging)\s*[:：]?\s*([^\n\r;；]{2,140})/i],
    ['wovenLabel', /(?:布标|水洗标|织唛|woven label)\s*[:：]?\s*([^\n\r,，;；]{2,100})/i],
    ['hangTag', /(?:吊牌|挂牌|hang ?tag)\s*[:：]?\s*([^\n\r,，;；]{2,100})/i],
    ['carton', /(?:外箱|纸箱|箱规|carton)\s*[:：]?\s*([^\n\r;；]{2,140})/i],
    ['handle', /(?:手柄|伞柄|handle)\s*[:：]?\s*([^\n\r,，;；]{2,100})/i],
    ['printing', /(?:印刷|logo|printing|print)\s*[:：]?\s*([^\n\r;；]{2,140})/i]
  ];

  orderPatterns.forEach(([field, pattern]) => {
    const match = rawText.match(pattern);
    if (match) {
      setOrderField(parsed.orderDetails, field, match[1]);
    }
  });

  specPatterns.forEach(([field, pattern]) => {
    const match = rawText.match(pattern);
    if (match) {
      setSpecField(parsed.productionSpec, field, match[1]);
    }
  });
}

async function readExcelText(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);

  const lines: string[] = [];
  const pairs: CellPair[] = [];

  workbook.worksheets.forEach((worksheet) => {
    worksheet.eachRow((row) => {
      const rowValues: string[] = [];
      row.eachCell({ includeEmpty: false }, (cell) => {
        const value = cleanText(cell.text || cell.value);
        if (value) {
          rowValues.push(value);
        }
      });

      rowValues.forEach((value) => {
        const split = maybeSplitLabelValue(value);
        if (split) {
          pairs.push(split);
        }
      });

      for (let index = 0; index < rowValues.length - 1; index++) {
        const label = cleanText(rowValues[index]);
        const value = cleanText(rowValues[index + 1]);
        if (label && value && label.length <= 40) {
          pairs.push({ label, value });
        }
      }

      if (rowValues.length > 0) {
        lines.push(rowValues.join(' | '));
      }
    });
  });

  return { rawText: lines.join('\n'), pairs };
}

function readPlainText(buffer: Buffer) {
  const rawText = buffer.toString('utf8');
  const pairs = rawText
    .split(/\r?\n/)
    .map((line) => maybeSplitLabelValue(line))
    .filter((item): item is CellPair => Boolean(item));

  return { rawText, pairs };
}

export async function parseProductionDocument(input: {
  fileName: string;
  buffer: Buffer;
  documentType: ProductionDocumentType;
}): Promise<ParsedProductionDocument> {
  const extension = input.fileName.toLowerCase().split('.').pop();
  const extracted = extension === 'xlsx' ? await readExcelText(input.buffer) : readPlainText(input.buffer);
  const parsed = applyPairs(extracted.pairs);
  regexFallback(extracted.rawText, parsed);

  return {
    documentType: input.documentType,
    textPreview: extracted.rawText.slice(0, 1200),
    orderDetails: parsed.orderDetails,
    productionSpec: parsed.productionSpec,
    recognizedLabels: parsed.recognizedLabels
  };
}
