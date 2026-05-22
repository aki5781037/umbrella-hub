# 关键证据
- `app/api/customers/route.ts` POST 调用 `addCustomer()`，然后 303 重定向到 `/customers/${customer.id}`。
- `app/customers/[id]/page.tsx` 调用 `getCustomerById(params.id)`，返回空时执行 `notFound()`。
- `app/customers/page.tsx` 已设置 `export const dynamic = 'force-dynamic';`，客户详情页未设置。

# 命令结果
- `git status --short` 初始为空。
- `data/crm-records.json` 已存在新增客户记录，说明保存写入发生过。
- `npm.cmd run build` 通过，构建输出显示 `/customers/[id]` 为动态服务端渲染。
- 本地 `http://127.0.0.1:3100/api/customers` POST 返回 `303`，重定向到 `/customers/verify-customer-1779436349377`。
- 访问该详情页返回 `200`，页面内容包含新建客户名。
- 用户复测的 `/customers/%E6%B3%95%E5%9B%BDs-2` 曾返回 `404`，记录文件中存在真实 ID `法国s-2`。
- 对查询 ID 做 `decodeURIComponent` 后，浏览器刷新当前 URL 显示 `法国S` 客户详情。
- 中文客户名 `法国验证1779436708583` 新建后重定向到 `/customers/1779436708583`，详情页返回 `200`。

# 失败尝试
- 暂无。

# 决策原因
- 详情页需要和列表页一样每次请求读取最新文件数据，避免新增后访问详情页命中静态缓存导致 404。
- 动态路由参数可能以 URL 编码形式进入查询层，查询前需要安全解码；新 ID 避免继续生成中文路径可减少编码差异。
