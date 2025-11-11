Travel AI Planner
=================

AI 驱动的旅行规划 Web 应用：支持语音/文字输入，自动生成行程路线与预算估计，地图展示、费用管理，以及云端同步。

功能
- 智能行程规划：输入出发地、目的地、天数、预算、人数、偏好，生成详细行程（交通、住宿、景点、美食），含费用估算
- 路径规划：基于百度地图 API 自动获取出发地到目的地的路线信息（距离、时间、路线指引）
- 语音输入：基于浏览器 Web Speech API（可扩展接入科大讯飞）
- 地图导航：百度地图 Web SDK 显示行程 POI
- 费用预算与管理：分类记录支出、汇总与预算对比
- 用户管理与云同步：✅ 已实现
  - 注册/登录系统（邮箱密码认证）
  - 多计划保存与管理
  - 云端自动同步（计划、偏好、费用记录）
  - 多设备数据同步

技术栈
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase（认证与存储）
- 百度地图 Web 服务 API（地点检索、路径规划）
- 百度地图 Web SDK（地图展示）
- OpenAI 兼容大模型（可替换为任意兼容接口）

本地开发

1) 环境变量（创建 `.env.local`）
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://sbp-9vztdnp5bnkh8q7u.supabase.opentrust.net
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNicC05dnp0ZG5wNWJua2g4cTd1IiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjI4Nzc4OTksImV4cCI6MjA3ODQ1Mzg5OX0.CDHGXeGoY8b6UCC36JNPN-GrAyiWhSTKRe7MEZidAj0
OPENAI_API_KEY=你的OpenAI API密钥
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
BAIDU_MAP_AK=你的百度地图AK（必需，用于路径规划和地图展示）
NEXT_PUBLIC_BAIDU_MAP_AK=你的百度地图AK（可选，如果设置了会优先使用，用于地图展示）
```

2) 设置数据库
- 在 Supabase Dashboard 的 SQL Editor 中执行 `supabase-schema.sql` 文件
- 详细步骤请参考 `DATABASE_SETUP.md`

3) 安装依赖并启动
```
npm install
npm run dev
```

4) 打开 `http://localhost:3000`

注意事项
- Node.js 版本：为获得最佳兼容性，建议 Node >= 20.9
- 百度地图 AK：需要在 `.env.local` 配置 `BAIDU_MAP_AK`（用于路径规划和地图展示）
- 如果需要在客户端使用不同的 AK，可以配置 `NEXT_PUBLIC_BAIDU_MAP_AK`（用于地图展示）
- 模型：`OPENAI_API_KEY` 可为任意兼容 OpenAI 的服务商密钥

使用说明

### 用户认证
1. 点击右上角"登录"按钮
2. 注册新账户（邮箱 + 密码，至少 6 个字符）
3. 登录后即可使用云端同步功能

### 保存和管理计划
1. 生成行程后，在右侧"我的旅行计划"面板点击"保存当前计划"
2. 已保存的计划会显示在列表中，点击即可加载
3. 悬停计划卡片可看到删除按钮

### 云端同步
- 计划数据（行程、偏好、预算等）在保存时同步
- 费用记录会在修改后 1 秒内自动同步
- 所有数据自动关联到当前登录用户

后续扩展
- 语音识别切换为科大讯飞 Web SDK（通过服务端签名）
- 实时行程辅助：位置感知、离线缓存、改签与意外处理建议
- 计划分享功能
- 导出 PDF/Excel 行程单

许可证
MIT
