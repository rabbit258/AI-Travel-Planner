# Dockerfile
#
# --- 阶段 1: 构建 (Builder) ---
# 使用 README 中推荐的 Node >= 20.9 版本
# "alpine" 是一个非常轻量的 Linux 发行版
FROM node:20-alpine AS builder

# Build-time environment (injected via docker build --build-arg or GitHub Actions secrets)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG OPENAI_MODEL
ARG NEXT_PUBLIC_AMAP_KEY
ARG BAIDU_MAP_AK
ARG NEXT_PUBLIC_BAIDU_MAP_AK

# Make them available during the Next.js build
ENV NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}"
ENV NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
ENV OPENAI_API_KEY="${OPENAI_API_KEY}"
ENV OPENAI_BASE_URL="${OPENAI_BASE_URL}"
ENV OPENAI_MODEL="${OPENAI_MODEL}"
ENV NEXT_PUBLIC_AMAP_KEY="${NEXT_PUBLIC_AMAP_KEY}"
ENV BAIDU_MAP_AK="${BAIDU_MAP_AK}"
ENV NEXT_PUBLIC_BAIDU_MAP_AK="${NEXT_PUBLIC_BAIDU_MAP_AK}"

# 设置工作目录
WORKDIR /app

# 禁用 Next.js 遥测数据
ENV NEXT_TELEMETRY_DISABLED=1

# 复制 package.json 和 package-lock.json (或 yarn.lock, pnpm-lock.yaml)
COPY package*.json ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN npm install

# 复制所有剩余的源代码
COPY . .

# 运行 Next.js 的生产构建命令
RUN npm run build

# --- 阶段 2: 运行 (Runner) ---
# 再次使用轻量的 node 镜像
FROM node:20-alpine

WORKDIR /app

# 设置为生产环境
ENV NODE_ENV=production
# 禁用 Next.js 遥测数据
ENV NEXT_TELEMETRY_DISABLED=1

# 从 "builder" 阶段复制 Next.js 的 standalone 输出
# 这包含了运行服务器所需的最少文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 创建一个非 root 用户 "node" 来运行应用，提高安全性
USER node

# 暴露 Next.js 默认的 3000 端口
EXPOSE 3000

# 设置端口环境变量
ENV PORT=3000

# 启动 Next.js 生产服务器 (standalone 模式的入口是 server.js)
CMD ["node", "server.js"]