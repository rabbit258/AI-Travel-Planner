Travel AI Planner
=================

AI 驱动的旅行规划 Web 应用：支持语音/文字输入，自动生成行程路线与预算估计，地图展示、费用管理，以及云端同步。

功能
- 智能行程规划：输入目的地、天数、预算、人数、偏好，生成详细行程（交通、住宿、景点、美食），含费用估算
- 语音输入：基于浏览器 Web Speech API（可扩展接入科大讯飞）
- 地图导航：高德地图 Web SDK 显示行程 POI
- 费用预算与管理：分类记录支出、汇总与预算对比
- 用户管理与云同步：对接 Supabase（待配置）

技术栈
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase（认证与存储）
- 高德地图 Web SDK
- OpenAI 兼容大模型（可替换为任意兼容接口）

本地开发
1) 环境变量（创建 `.env.local`）
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=AIzaSyBW7n6r0zYBG3R_D--fI3u9QjYYWMzPOXw
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_AMAP_KEY=
```

2) 安装依赖并启动
```
npm install
npm run dev
```

3) 打开 `http://localhost:3000`

注意事项
- Node.js 版本：为获得最佳兼容性，建议 Node >= 20.9
- 地图：需要在 `.env.local` 配置 `NEXT_PUBLIC_AMAP_KEY`
- 模型：`OPENAI_API_KEY` 可为任意兼容 OpenAI 的服务商密钥

后续扩展
- 接入 Supabase 认证与用户数据表，实现计划与账单的云端同步
- 语音识别切换为科大讯飞 Web SDK（通过服务端签名）
- 实时行程辅助：位置感知、离线缓存、改签与意外处理建议

许可证
MIT
