-- 数据库迁移：添加出发地字段
-- 在 Supabase SQL Editor 中执行此文件

-- 为 travel_plans 表添加 origin 字段
ALTER TABLE public.travel_plans 
ADD COLUMN IF NOT EXISTS origin TEXT;

-- 可选：从现有的 plan_data JSONB 中迁移 origin 数据（如果有的话）
-- 注意：这只会更新 plan_data 中包含 origin 的记录
UPDATE public.travel_plans
SET origin = plan_data->>'origin'
WHERE plan_data->>'origin' IS NOT NULL 
  AND plan_data->>'origin' != '';

-- 添加注释说明字段用途
COMMENT ON COLUMN public.travel_plans.origin IS '出发地，例如：北京、上海等';

