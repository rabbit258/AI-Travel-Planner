"use client";

import { useMemo, useState, useEffect } from "react";
import PlannerForm from "@/components/PlannerForm";
import PlanSummary from "@/components/PlanSummary";
import RouteMap from "@/components/RouteMap";
import ItineraryView from "@/components/ItineraryView";
import ExpenseTracker, { type Expense } from "@/components/ExpenseTracker";
import PlanManager from "@/components/PlanManager";
import RouteInfo from "@/components/RouteInfo";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { PlanResult, BudgetBreakdown } from "@/types/plan";

const gradientBackground =
	"relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-100 via-white to-white p-8 shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950";

export default function Home() {
	const { user } = useAuth();
	const supabase = createClient();
	const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
	const [origin, setOrigin] = useState<string>("");
	const [destination, setDestination] = useState("");
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [days, setDays] = useState<number | undefined>(undefined);
	const [budget, setBudget] = useState<number | undefined>(undefined);
	const [travelers, setTravelers] = useState<number | undefined>(undefined);
	const [preferences, setPreferences] = useState<string>("");
	const [withChildren, setWithChildren] = useState(false);
	const [language, setLanguage] = useState<"zh" | "en" | "ja">("zh");
	const [loading, setLoading] = useState(false);
	const [plan, setPlan] = useState<PlanResult | null>(null);
	const [expenses, setExpenses] = useState<Expense[]>([]);

	const expenseTotal = useMemo(
		() => expenses.reduce((sum, item) => sum + (item.amountCNY || 0), 0),
		[expenses]
	);

	const allPOIs = useMemo(
		() => plan?.itineraryByDay?.flatMap((day) => day.mapPOIs) ?? [],
		[plan?.itineraryByDay]
	);

	// Auto-save expenses to cloud when user is logged in and plan is saved
	useEffect(() => {
		if (!user || !currentPlanId) return;

		const saveExpenses = async () => {
			try {
				// Get existing expenses for this plan
				const { data: existing, error: fetchError } = await supabase
					.from("expenses")
					.select("id, notes, amount_cny, category, expense_date")
					.eq("plan_id", currentPlanId)
					.eq("user_id", user.id);

				if (fetchError) {
					console.error("获取费用失败:", fetchError);
					return;
				}

				const existingExpenses = existing || [];
				
				// 创建现有费用的映射（使用 notes + amount_cny + category 作为唯一标识）
				const existingMap = new Map<string, string>();
				existingExpenses.forEach((exp) => {
					const key = `${exp.notes || ""}_${exp.amount_cny}_${exp.category}`;
					existingMap.set(key, exp.id);
				});

				// 创建当前费用的映射
				const currentMap = new Map<string, Expense>();
				expenses.forEach((exp) => {
					const key = `${exp.title || ""}_${exp.amountCNY}_${exp.category}`;
					currentMap.set(key, exp);
				});

				// 删除不再存在的费用
				for (const exp of existingExpenses) {
					const key = `${exp.notes || ""}_${exp.amount_cny}_${exp.category}`;
					if (!currentMap.has(key)) {
						const { error: deleteError } = await supabase
							.from("expenses")
							.delete()
							.eq("id", exp.id)
							.eq("user_id", user.id);
						
						if (deleteError) {
							console.error("删除费用失败:", deleteError);
						}
					}
				}

				// 插入或更新费用
				for (const expense of expenses) {
					const key = `${expense.title || ""}_${expense.amountCNY}_${expense.category}`;
					const existingId = existingMap.get(key);

					if (existingId) {
						// 更新现有费用
						const { error: updateError } = await supabase
							.from("expenses")
							.update({
								category: expense.category,
								amount_cny: expense.amountCNY,
								notes: expense.title,
								expense_date: expense.date || null,
							})
							.eq("id", existingId)
							.eq("user_id", user.id);

						if (updateError) {
							console.error("更新费用失败:", updateError);
						}
					} else {
						// 插入新费用（让数据库自动生成 UUID）
						const { data: newExpense, error: insertError } = await supabase
							.from("expenses")
							.insert({
								plan_id: currentPlanId,
								user_id: user.id,
								category: expense.category,
								amount_cny: expense.amountCNY,
								notes: expense.title,
								expense_date: expense.date || null,
							})
							.select()
							.single();

						if (insertError) {
							console.error("插入费用失败:", insertError);
							console.error("费用数据:", expense);
						} else if (newExpense) {
							// 更新本地费用 ID 为数据库生成的 UUID
							setExpenses((prev) =>
								prev.map((e) =>
									e === expense ? { ...e, id: newExpense.id } : e
								)
							);
						}
					}
				}
			} catch (err: any) {
				console.error("保存费用失败 - 异常:", err);
				console.error("错误详情:", {
					message: err?.message,
					code: err?.code,
					details: err?.details,
				});
			}
		};

		// 只有在有费用或需要清理时才执行
		if (expenses.length > 0 || currentPlanId) {
			const timer = setTimeout(saveExpenses, 1000);
			return () => clearTimeout(timer);
		}
	}, [expenses, currentPlanId, user, supabase]);

	function handleLoadPlan(
		loadedPlan: PlanResult,
		inputs: {
			origin?: string;
			destination: string;
			startDate?: string;
			days?: number;
			budget?: number;
			travelers?: number;
			preferences: string;
			withChildren: boolean;
			language: "zh" | "en" | "ja";
		},
		loadedExpenses: any[]
	) {
		setPlan(loadedPlan);
		setOrigin(inputs.origin || "");
		setDestination(inputs.destination);
		setStartDate(inputs.startDate);
		setDays(inputs.days);
		setBudget(inputs.budget);
		setTravelers(inputs.travelers);
		setPreferences(inputs.preferences);
		setWithChildren(inputs.withChildren);
		setLanguage(inputs.language);
		setExpenses(
			loadedExpenses.map((e) => ({
				id: e.id,
				category: e.category as Expense["category"],
				title: e.notes || "",
				amountCNY: Number(e.amount_cny),
				date: e.expense_date || undefined,
			}))
		);
		// Note: currentPlanId will be set by PlanManager's onPlanIdChange callback
	}

	async function generatePlan() {
		if (!destination) return;
		setLoading(true);
		try {
			// 1. 生成行程计划
			const res = await fetch("/api/plan", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					origin,
					destination,
					startDate,
					days,
					budget,
					travelers,
					preferences: preferences
						.split(/[，,、;]/)
						.map((s) => s.trim())
						.filter(Boolean),
					withChildren,
					language,
				}),
			});
			const raw = (await res.json()) as Partial<PlanResult>;
			const toStringArray = (value: PlanResult["transport"]) => {
				if (!value) return [];
				if (!Array.isArray(value)) {
					// 如果是单个值，转换为数组
					if (typeof value === "string") return [value];
					if (typeof value === "object") {
						// 如果是对象，尝试提取 name、title 或 description
						const obj = value as any;
						return [obj.name || obj.title || obj.description || JSON.stringify(obj)];
					}
					return [String(value)];
				}
				// 如果是数组，处理每个元素
				return value.map((item) => {
					if (typeof item === "string") return item;
					if (typeof item === "object" && item !== null) {
						// 如果是对象，尝试提取有用的字段
						const obj = item as any;
						return obj.name || obj.title || obj.description || obj.text || JSON.stringify(obj);
					}
					return String(item);
				});
			};
			const normalizeBreakdown = (list?: BudgetBreakdown[]): BudgetBreakdown[] =>
				(list ?? []).map((item) => ({
					category: item.category,
					amount:
						typeof item.amount === "number"
							? item.amount
							: Number(item.amount) || 0,
				}));
			const normalized: PlanResult = {
				itineraryByDay: Array.isArray(raw.itineraryByDay) ? raw.itineraryByDay : [],
				transport: toStringArray(raw.transport),
				lodging: toStringArray(raw.lodging),
				restaurants: toStringArray(raw.restaurants),
				totalEstimatedCost:
					typeof raw.totalEstimatedCost === "number"
						? raw.totalEstimatedCost
						: raw.totalEstimatedCost
							? Number(raw.totalEstimatedCost)
							: undefined,
				tips: toStringArray(raw.tips),
				budgetBreakdown: normalizeBreakdown(raw.budgetBreakdown),
			};

			// 2. 如果有出发地和目的地，获取路径信息
			if (origin && destination) {
				try {
					const routeRes = await fetch("/api/baidu-map", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ origin, destination }),
					});
					
					if (routeRes.ok) {
						const routeData = await routeRes.json();
						normalized.originLocation = routeData.originLocation;
						normalized.destinationLocation = routeData.destinationLocation;
						normalized.routeInfo = routeData.routeInfo;
					} else {
						console.warn("获取路径信息失败:", await routeRes.text());
					}
				} catch (routeError) {
					console.error("获取路径信息异常:", routeError);
					// 不阻止计划生成，只是没有路径信息
				}
			}

			setPlan(normalized);
		} catch (e) {
			console.error(e);
			alert("规划失败，请稍后重试");
		} finally {
			setLoading(false);
		}
	}

  return (
		<div className="space-y-10">
			<section className={gradientBackground}>
				<div className="absolute -top-24 right-8 size-48 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
				<div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
				<div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-4 max-w-xl">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-sky-600 shadow dark:bg-slate-900/60 dark:text-sky-300">
							AI Travel Copilot
						</span>
						<h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
							告诉我你的旅行想法，剩下的交给 AI
						</h1>
						<p className="text-sm text-slate-600 dark:text-slate-300">
							一站式行程规划、预算分析、地图导航与实时提醒。语音或文字输入，一键生成个性化旅行方案，随时调整，轻松同步。
          </p>
        </div>
					<div className="grid w-full max-w-md gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">预计行程预算</span>
							<span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								{plan?.totalEstimatedCost ? `¥${Math.round(plan.totalEstimatedCost)}` : budget ? `¥${budget}` : "—"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">已记录支出</span>
							<span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
								{expenseTotal > 0 ? `¥${Math.round(expenseTotal)}` : "¥0"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">行程天数</span>
							<span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								{plan?.itineraryByDay?.length || days || "—"} 天
							</span>
						</div>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
					<PlannerForm
						origin={origin}
						destination={destination}
						startDate={startDate}
						days={days}
						budget={budget}
						travelers={travelers}
						preferences={preferences}
						withChildren={withChildren}
						language={language}
						loading={loading}
						onOriginChange={setOrigin}
						onDestinationChange={setDestination}
						onStartDateChange={setStartDate}
						onDaysChange={setDays}
						onBudgetChange={setBudget}
						onTravelersChange={setTravelers}
						onPreferencesChange={setPreferences}
						onWithChildrenChange={setWithChildren}
						onLanguageChange={setLanguage}
						onGenerate={generatePlan}
					/>
				</div>

				<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
					{plan ? (
						<PlanSummary plan={plan} />
					) : (
						<div className="flex h-full flex-col items-start justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
							<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">等待你的旅行灵感</h2>
							<p>输入目的地和需求后，可以查看 AI 自动生成的交通、住宿、美食与贴士列表。</p>
							<p className="text-xs opacity-70">支持语音输入，适合快速记录突发的旅行想法。</p>
						</div>
					)}
				</div>
			</section>

			{plan && (
				<section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					<div className="xl:col-span-2 space-y-4">
						<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
							{plan.originLocation && plan.destinationLocation ? (
								<RouteMap
									originLocation={plan.originLocation}
									destinationLocation={plan.destinationLocation}
									routeInfo={plan.routeInfo}
									pois={allPOIs}
									height={420}
									className="rounded-2xl overflow-hidden"
								/>
							) : (
								<div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
									暂无路线信息，请填写出发地和目的地。
								</div>
							)}
						</div>
						{plan.routeInfo && (
							<RouteInfo
								routeInfo={plan.routeInfo}
								originLocation={plan.originLocation}
								destinationLocation={plan.destinationLocation}
							/>
						)}
					</div>
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
						<ItineraryView
							itineraryByDay={plan.itineraryByDay}
							totalEstimatedCost={plan.totalEstimatedCost}
						/>
					</div>
				</section>
			)}

			<section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
					<ExpenseTracker
						initial={expenses}
						budgetCNY={plan?.totalEstimatedCost ?? budget}
						onChange={setExpenses}
					/>
				</div>
				<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
					<PlanManager
						currentPlan={plan}
						planInputs={{
							origin,
							destination,
							startDate,
							days,
							budget,
							travelers,
							preferences,
							withChildren,
							language,
						}}
						expenses={expenses}
						onLoadPlan={handleLoadPlan}
						onPlanIdChange={setCurrentPlanId}
					/>
        </div>
			</section>
    </div>
  );
}
