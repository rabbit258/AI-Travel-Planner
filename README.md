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

Docker 镜像
-----------

GitHub Actions 会使用 `docker/build-push-action@v5` 构建并推送镜像到私有/公有仓库（例如 `***/1604456428/homework`）。在任意主机上拉取并运行镜像的步骤如下：

1. **拉取镜像**
   ```
   docker pull <registry>/<namespace>/homework:latest
   ```

2. **准备环境变量**
   推荐创建 `env.prod` 文件集中管理变量：
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_SUPABASE_URL=... # 必填
   NEXT_PUBLIC_SUPABASE_ANON_KEY=... # 必填
   OPENAI_API_KEY=...           # 若需行程生成
   OPENAI_BASE_URL=...
   OPENAI_MODEL=qwen-plus
   BAIDU_MAP_AK=...             # 若需路径规划
   NEXT_PUBLIC_BAIDU_MAP_AK=... # 若需地图展示
   ```
   - **必填**：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。镜像内置容错机制，在缺失时会以占位 Supabase 客户端启动，前端功能仍可浏览但无法登录/保存数据。
   - **可选**：模型与地图 AK 可按需覆盖；如未提供，对应功能会在运行时提示。

3. **启动容器**
   ```
   docker run -d \
     --name travel-ai-planner \
     --env-file ./env.prod \
     -p 3000:3000 \
     <registry>/<namespace>/homework:latest
   ```
   - 进程以非 root `node` 用户运行，默认监听 `3000` 端口。
   - 若部署在云主机/内网，可配合 `nginx` 或 LB 暴露 HTTPS。

4. **自定义构建（可选）**
   ```
   docker build -t travel-ai-planner:local .
   docker run --rm -p 3000:3000 --env-file ./env.prod travel-ai-planner:local
   ```
   这将在本地使用当前代码重新构建镜像，便于调试 CI/CD 以外的改动。

本地开发

1) 环境变量（创建 `.env.local`）
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
OPENAI_API_KEY=<your-model-api-key>
OPENAI_BASE_URL=<your-model-base-url>
OPENAI_MODEL=qwen-plus
NEXT_PUBLIC_AMAP_KEY=
BAIDU_MAP_AK=<your-baidu-server-ak>
NEXT_PUBLIC_BAIDU_MAP_AK=<your-baidu-browser-ak>
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
