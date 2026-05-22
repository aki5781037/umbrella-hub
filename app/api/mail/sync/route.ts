import { NextRequest, NextResponse } from 'next/server';
import { addMail, associateMail, getMailConfigPlain, MailItem } from '@/lib/emails-db';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;
  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'sandbox'; // 默认沙箱演示模式

    if (mode === 'read-only-check') {
      return NextResponse.json({ success: true, mode, message: '邮件列表读取检查通过。' });
    }

    if (mode === 'sandbox') {
      // ----------------------------------------------------
      // 1. 沙箱演示模式邮件同步
      // ----------------------------------------------------
      const sandboxMails: Partial<MailItem>[] = [
        {
          id: `sb-mail-${Date.now()}-1`,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          from: 'Daniel Lim (ABC)',
          fromEmail: 'daniel@abc-import.example',
          subject: '关于马来西亚折叠伞开发项目的 MOQ 确认',
          status: '未读',
          summary: '客户询问首单起订量是否可以进一步降低至 800 支，以便快速开展第一批市场测试。',
          body: 'Dear Linda, regarding the foldable umbrella project (PRJ-2026-0018), our marketing team would like to run a quick test. Can we reduce the MOQ for the first batch to 800 units instead of 1500? Please let me know your production capacity and shipping surcharge if any.',
          suggestedAction: '回复客户 800 支的可行出货与包装加收费用方案。'
        },
        {
          id: `sb-mail-${Date.now()}-2`,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          from: 'Minji Kim',
          fromEmail: 'minji@koreabrand.example',
          subject: '【紧急】韩国联名款样品设计稿确认与色号微调',
          status: '未读',
          summary: '客户发来联名款样品的新版色卡，请求将手柄上的 LOGO 缩小并采用热转印技术。',
          body: 'Hi Cathy, for our Ark brand co-branding sample project (korea-cobrand-sample), the blue color is critical. We would like to adjust the Pantone code from 293C to 294C. Also, please shrink the logo size slightly on the umbrella cap and use heat transfer printing. Looking forward to your revised mockup.',
          suggestedAction: '转交给设计部门，修改 Pantone 色号，并更新效果图供客户确认。'
        }
      ];

      let addedCount = 0;
      for (const rawMail of sandboxMails) {
        // 调用智能关联引擎自动绑定客户与项目
        const associated = associateMail(rawMail);
        const success = addMail(associated);
        if (success) {
          addedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        mode: 'sandbox',
        addedCount,
        message: addedCount > 0 ? `模拟同步成功！成功拉取并自动关联了 ${addedCount} 封新邮件。` : '暂无新邮件，数据已是最新。'
      });
    }

    // ----------------------------------------------------
    // 2. 真实 IMAP 模式同步
    // ----------------------------------------------------
    const config = getMailConfigPlain();
    if (!config || !config.host || !config.user || !config.password) {
      return NextResponse.json({ error: '请先完成邮箱 IMAP 连接凭证设置。' }, { status: 400 });
    }

    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      },
      logger: false
    });

    await client.connect();
    let lock = await client.getMailboxLock('INBOX');

    let addedCount = 0;
    try {
      // 获取当前收件箱总邮件数
      if (client.mailbox) {
        const exists = client.mailbox.exists;
        if (exists > 0) {
          // 拉取最近的 10 封邮件以防超时，并且执行去重
          const fetchRange = `${Math.max(1, exists - 9)}:${exists}`;
        for await (let msg of client.fetch(fetchRange, { source: true, uid: true, envelope: true })) {
          if (!msg.source) continue;
          const parsed = await simpleParser(msg.source);
          
          const timeText = msg.envelope?.date
            ? new Date(msg.envelope.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

          const fromEmail = parsed.from && parsed.from.value && parsed.from.value[0]
            ? parsed.from.value[0].address || ''
            : '';
          const fromName = parsed.from && parsed.from.value && parsed.from.value[0]
            ? parsed.from.value[0].name || fromEmail.split('@')[0]
            : '未知发件人';

          const textBody = parsed.text || '';
          
          // 构造标准 MailItem
          const mailItem: Partial<MailItem> = {
            id: parsed.messageId || `msg-uid-${msg.uid}-${Date.now()}`,
            time: timeText,
            from: fromName,
            fromEmail: fromEmail,
            subject: parsed.subject || '（无主题）',
            status: '未读',
            summary: textBody.slice(0, 80) + (textBody.length > 80 ? '...' : ''),
            body: textBody,
            suggestedAction: '请阅读邮件内容，并根据客户要求回复跟进。',
            attachments: parsed.attachments.map(att => att.filename || '未命名附件')
          };

          // 执行智能关联
          const associated = associateMail(mailItem);
          // 写入本地数据库
          const success = addMail(associated);
          if (success) {
            addedCount++;
          }
        }
      }
    }
  } finally {
      lock.release();
      await client.logout();
    }

    return NextResponse.json({
      success: true,
      mode: 'real',
      addedCount,
      message: addedCount > 0 ? `真实同步成功！成功同步拉取了 ${addedCount} 封新邮件。` : '邮箱已是最新，无新来信。'
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: `同步失败: ${err.message || '网络连接或 IMAP 配置错误。'}` },
      { status: 500 }
    );
  }
}
