"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Trash2, Plus, Calendar, MapPin } from "lucide-react";
import type { PlanResult } from "@/types/plan";

type TravelPlan = {
	id: string;
	title: string;
	destination: string;
	created_at: string;
	updated_at: string;
	plan_data: PlanResult;
};

type PlanManagerProps = {
	currentPlan: PlanResult | null;
	planInputs: {
		destination: string;
		startDate?: string;
		days?: number;
		budget?: number;
		travelers?: number;
		preferences: string;
		withChildren: boolean;
		language: "zh" | "en" | "ja";
	};
	expenses: any[];
	onLoadPlan: (plan: PlanResult, inputs: PlanManagerProps["planInputs"], expenses: any[]) => void;
	onPlanIdChange?: (planId: string | null) => void;
};

export default function PlanManager({
	currentPlan,
	planInputs,
	expenses,
	onLoadPlan,
	onPlanIdChange,
}: PlanManagerProps) {
	const { user } = useAuth();
	const [plans, setPlans] = useState<TravelPlan[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
	const supabase = createClient();

	useEffect(() => {
		if (user) {
			loadPlans();
		}
	}, [user]);

	async function loadPlans() {
		if (!user) return;
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("travel_plans")
				.select("*")
				.eq("user_id", user.id)
				.eq("is_active", true)
				.order("updated_at", { ascending: false });

			if (error) throw error;
			setPlans((data as TravelPlan[]) || []);
		} catch (err) {
			console.error("加载计划失败:", err);
		} finally {
			setLoading(false);
		}
	}

	async function savePlan() {
		if (!user || !currentPlan || !planInputs.destination) return;
		setSaving(true);
		try {
			const title = planInputs.destination || "未命名行程";
			const { data, error } = await supabase
				.from("travel_plans")
				.insert({
					user_id: user.id,
					title,
					destination: planInputs.destination,
					start_date: planInputs.startDate || null,
					days: planInputs.days || null,
					budget: planInputs.budget || null,
					travelers: planInputs.travelers || null,
					preferences: planInputs.preferences
						.split(/[，,、;]/)
						.map((s) => s.trim())
						.filter(Boolean),
					with_children: planInputs.withChildren,
					language: planInputs.language,
					plan_data: currentPlan,
				})
				.select()
				.single();

			if (error) throw error;
			await loadPlans();
			if (data) {
				setSelectedPlanId(data.id);
				onPlanIdChange?.(data.id);
			}
			alert("计划已保存");
		} catch (err: any) {
			console.error("保存失败:", err);
			alert(`保存失败: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}

	async function deletePlan(planId: string) {
		if (!user || !confirm("确定要删除这个计划吗？")) return;
		try {
			const { error } = await supabase
				.from("travel_plans")
				.update({ is_active: false })
				.eq("id", planId)
				.eq("user_id", user.id);

			if (error) throw error;
			await loadPlans();
			if (selectedPlanId === planId) {
				setSelectedPlanId(null);
			}
		} catch (err: any) {
			console.error("删除失败:", err);
			alert(`删除失败: ${err.message}`);
		}
	}

	async function loadPlan(plan: TravelPlan) {
		setSelectedPlanId(plan.id);
		onPlanIdChange?.(plan.id);
		try {
			// Load expenses for this plan
			const { data: expenseData } = await supabase
				.from("expenses")
				.select("*")
				.eq("plan_id", plan.id)
				.order("expense_date", { ascending: true });

			onLoadPlan(
				plan.plan_data,
				{
					destination: plan.destination,
					startDate: plan.start_date || undefined,
					days: plan.days || undefined,
					budget: plan.budget ? Number(plan.budget) : undefined,
					travelers: plan.travelers || undefined,
					preferences: (plan.preferences || []).join("、"),
					withChildren: plan.with_children || false,
					language: (plan.language as "zh" | "en" | "ja") || "zh",
				},
				expenseData || []
			);
		} catch (err) {
			console.error("加载计划失败:", err);
		}
	}


	if (!user) {
		return (
			<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
				请先登录以保存和管理计划
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">我的旅行计划</h3>
				<button
					onClick={savePlan}
					disabled={!currentPlan || saving}
					className="btn-primary inline-flex items-center gap-2"
				>
					{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
					保存当前计划
				</button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 size={24} className="animate-spin text-slate-400" />
				</div>
			) : plans.length === 0 ? (
				<div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
					<Plus size={32} className="mx-auto mb-2 opacity-50" />
					<p>还没有保存的计划</p>
					<p className="mt-1 text-xs">生成行程后点击"保存当前计划"</p>
				</div>
			) : (
				<div className="space-y-2">
					{plans.map((plan) => (
						<div
							key={plan.id}
							className={`group flex items-center justify-between rounded-lg border p-3 transition hover:border-brand/50 hover:shadow-sm ${
								selectedPlanId === plan.id
									? "border-brand bg-brand/5"
									: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
							}`}
						>
							<button
								onClick={() => loadPlan(plan)}
								className="flex-1 text-left"
							>
								<div className="flex items-center gap-2">
									<MapPin size={16} className="text-brand" />
									<span className="font-medium text-slate-900 dark:text-slate-100">
										{plan.title}
									</span>
								</div>
								<div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
									<span className="flex items-center gap-1">
										<Calendar size={12} />
										{new Date(plan.updated_at).toLocaleDateString("zh-CN")}
									</span>
									{plan.days && <span>{plan.days} 天</span>}
									{plan.budget && <span>¥{Number(plan.budget).toLocaleString()}</span>}
								</div>
							</button>
							<button
								onClick={() => deletePlan(plan.id)}
								className="ml-2 rounded p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
							>
								<Trash2 size={16} />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

