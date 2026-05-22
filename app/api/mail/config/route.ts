import { NextRequest, NextResponse } from 'next/server';
import { getMailConfig, saveMailConfig } from '@/lib/emails-db';
import { ImapFlow } from 'imapflow';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;
  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const config = getMailConfig();
  if (!config) {
    return NextResponse.json({ config: null });
  }

  // 密码脱敏返回
  return NextResponse.json({
    config: {
      ...config,
      password: config.password ? '******' : ''
    }
  });
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;
  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { host, port, user, password, secure } = body;

    if (!host || !port || !user) {
      return NextResponse.json({ error: '请填写完整的连接参数。' }, { status: 400 });
    }

    const newConfig = {
      host: String(host),
      port: Number(port),
      user: String(user),
      password: password === '******' ? '******' : String(password),
      secure: Boolean(secure)
    };

    // 只有当密码不是 '******' 占位符且不为空时，才进行实际的物理连接测试
    if (newConfig.password && newConfig.password !== '******') {
      try {
        const client = new ImapFlow({
          host: newConfig.host,
          port: newConfig.port,
          secure: newConfig.secure,
          auth: {
            user: newConfig.user,
            pass: newConfig.password
          },
          logger: false
        });

        // 尝试建立连接 (在 5 秒内超时)
        const connectPromise = client.connect();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('连接超时，请检查主机与端口。')), 6000)
        );

        await Promise.race([connectPromise, timeoutPromise]);
        await client.logout();
      } catch (err: any) {
        return NextResponse.json(
          { error: `连接邮箱服务失败: ${err.message || '凭证或服务器地址错误。'}` },
          { status: 400 }
        );
      }
    }

    // 保存配置
    saveMailConfig(newConfig);
    return NextResponse.json({ success: true, message: '邮箱配置已成功保存并连通测试通过！' });
  } catch (err: any) {
    return NextResponse.json({ error: `保存失败: ${err.message}` }, { status: 500 });
  }
}
