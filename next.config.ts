import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 添加下面这行来启用 standalone 模式
  output: 'standalone',
};

export default nextConfig;
