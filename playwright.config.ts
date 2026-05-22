import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'screenshot.spec.ts',
  timeout: 90000, // 90 秒的单次测试超时时间
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    channel: 'msedge', // 使用本地的 Edge 浏览器
  },
  projects: [
    {
      name: 'edge',
      use: { channel: 'msedge' },
    },
  ],
});
