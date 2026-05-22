import { test } from '@playwright/test';

test('capture dashboards', async ({ page }) => {
  // 设置视口大小为 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });

  try {
    // 1. 访问登录页面
    console.log('正在导航至登录页面...');
    await page.goto('http://localhost:3000/login', { timeout: 60000 });
    console.log(`当前页面 URL: ${page.url()}`);

    // 2. 打印当前页面标题以作诊断
    const title = await page.title();
    console.log(`当前页面标题: ${title}`);

    // 保存一张诊断用的初始页面截图
    const diagPath = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\ed0a80bc-e13e-4ff3-99f5-4e7774a927c0\\diagnostic_login_page.png';
    await page.screenshot({ path: diagPath });
    console.log(`已保存登录页诊断截图至: ${diagPath}`);

    // 3. 填写演示账号
    console.log('正在填写演示账号凭证...');
    await page.fill('input[name="email"]', 'admin@arkumbrella.com', { timeout: 10000 });
    await page.fill('input[name="password"]', 'Umbrella2026!', { timeout: 10000 });

    // 4. 点击登录并等待页面跳转
    console.log('正在登录...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);

    console.log(`登录后当前页面 URL: ${page.url()}`);

    // 5. 跳转到首页 (驾驶舱)
    console.log('正在导航至外贸业务驾驶舱首页...');
    await page.goto('http://localhost:3000/', { timeout: 30000 });
    console.log('等待页面流光动画与网格特效加载...');
    await page.waitForTimeout(4000); // 等待 4 秒，让动画和科技网格特效充分展示
    
    // 截图保存到 artifacts 目录
    const dashboardPath = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\ed0a80bc-e13e-4ff3-99f5-4e7774a927c0\\dashboard_live.png';
    console.log(`正在保存驾驶舱首页截图至: ${dashboardPath}`);
    await page.screenshot({ path: dashboardPath, fullPage: true });

    // 6. 跳转到邮件页面
    console.log('正在导航至邮件中心...');
    await page.goto('http://localhost:3000/mail', { timeout: 30000 });
    console.log('等待邮件与重置工具组件就绪...');
    await page.waitForTimeout(3000); // 等待 3 秒
    
    const mailPath = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\ed0a80bc-e13e-4ff3-99f5-4e7774a927c0\\mail_live.png';
    console.log(`正在保存邮件中心截图至: ${mailPath}`);
    await page.screenshot({ path: mailPath, fullPage: true });
    
    console.log('所有科技感 UI 真实渲染截图已成功捕获！');
  } catch (error) {
    console.error('发生错误:', error);
    const errorPath = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\ed0a80bc-e13e-4ff3-99f5-4e7774a927c0\\error_screenshot.png';
    await page.screenshot({ path: errorPath });
    console.log(`已将错误时的屏幕保存至: ${errorPath}`);
    throw error;
  }
});
